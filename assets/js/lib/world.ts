import { Container, Mesh, Sprite, Spritesheet, SpritesheetData, Texture } from "pixi.js";
import { Keymap, Map2D } from "./keymap";
import { blockSize, Quadtree, setQuadreeDebug } from "./quadtree";
import { Player, PlayerOpts, setSpawn } from "./objects";
import { app } from "../main/app";
import { textures } from "../main/canvas";
import { DynamicObj } from "./dynamic-object";
import { Enemy } from "./enemy";
import { BaseObject, BoxBound } from "./base-object";
import { Chunk } from "./chunk";
import { floorToMultiples } from "./util";
import { spritesheetObj } from "../main/atlas";

interface TreeMap {
    [index: string]: Quadtree;
}

interface LevelMap {
    [index: string]: string;
}

export const levelMap: LevelMap = {};

interface WorldOpts {
    player?: Partial<PlayerOpts>;
    startLevel: string;
    atlas: Texture;
    spritesheet: Spritesheet;
}

export class World {
    trees: TreeMap = {};
    worldContainer: Container = new Container(); // current container
    worldContainerMap: Map2D<Chunk>;
    container: {[level: string]: Map2D<Chunk>} = {};
    keymap = new Keymap();
    player: Player;
    cLevel: string; // current level
    chunkSize: number = 16;
    size: number = 2048 * 2;
    renderDx: number = 2;
    renderDy: number = 1;
    loadedChunks: {[coord: string]: Chunk} = {};
    worldPosX: number;
    worldPosY: number;
    isBoundToPlayerPos: boolean = true;
    atlas: Texture;
    spritesheet: Spritesheet;

    entities: Enemy[] = [];

    getTree(): Quadtree {
        const t = this.trees[this.cLevel];
        
        return t;
    }

    constructor(o: WorldOpts) {
        Chunk.setGlobalUV(o.spritesheet.data, o.atlas.width, o.atlas.height);
        this.atlas = o.atlas;
        this.cLevel = o.startLevel;
        this.container[this.cLevel] = new Map2D<Chunk>();
        this.worldContainerMap = this.container[this.cLevel];
        this.spritesheet = o.spritesheet;

        o.player ||= {};

        setQuadreeDebug(this.worldContainer);

        this.player = new Player({
            worldContainer: this.worldContainer,
            height: 40,
            actualWidth: 10,
            texture: textures["player/player.png"],
            getTree: () => this.trees[this.cLevel],
        });

        for(const i in levelMap) {
            this.trees[i] = new Quadtree(0, 0, this.size, this.size);
        }

        this.setKeymap();
        this.loadLevel(this.cLevel);
        this.worldPosX = this.player.pos.x;
        this.worldPosY = this.player.pos.y;

        app.stage.addChild(this.worldContainer);

        this.greedyMesh();
        this.chunkLoop();
        setInterval(() => this.chunkLoop(), 1000 / 2);
    }

    getChunkN(n: number): number {
        return floorToMultiples(n, this.chunkSize);
    }

    loadLevel(l: string) {
        this.cLevel = l; // name
        const level: string = levelMap[this.cLevel]; // blocks
        if(level == undefined) throw new Error("world.ts: level not found");

        this.keymap.run(level);
    }
    
    keymapInsert(o: BaseObject) {
        const t = this.trees[this.cLevel];
        if(!(this.trees[this.cLevel].insert(o))) throw new Error(
            "Object didn't go into the quadtree."
        +   `\n(${o.pos.x}, ${o.pos.y}) didn't go to bounds of (${t.x}, ${t.y}, ${t.maxX}, ${t.maxY})`
        );
    }

    setKeymap() {
        const self = this;
        this.keymap.key("#", (x, y) => {
            self.addBlock(x, y, "block");
        });

        this.keymap.key("$", (x, y) => {
            self.addBlock(x, y, "spike");
        });

        this.keymap.key("@", (x, y) => {
            setSpawn(x * blockSize, y * blockSize);
            this.player.tp(x * blockSize, y * blockSize);
        });

        this.keymap.key("E", (x, y) => {
            self.addBlock(x, y, "enemy");
        });
    }

    chunkLoop() {
        if(this.isBoundToPlayerPos) {
            this.worldPosX = this.player.pos.x;
            this.worldPosY = this.player.pos.y;
        }
        const chunkX = this.getChunkN(this.worldPosX / blockSize);
        const chunkY = this.getChunkN(this.worldPosY / blockSize);

        const chunksToBeDeleted: {[coord: string]: Chunk} = {};
        /*
        this.worldContainerMap.forEach((coord: string, chunk: Chunk) => {
            this.loadedChunks[coord] = chunk;
            this.worldContainer.addChild(chunk.all);
        });*/
        
        this.worldContainerMap
        .radius(chunkX, chunkY, this.renderDx+1, this.renderDx+1, this.chunkSize, (coord: string, chunk: Chunk) => {
            if(this.loadedChunks[coord] == undefined) return;
            chunksToBeDeleted[coord] = chunk;
        });

        this.worldContainerMap
        .radius(chunkX, chunkY, this.renderDx, this.renderDy, this.chunkSize, (coord: string, chunk: Chunk) => {
            delete chunksToBeDeleted[coord];
            this.loadedChunks[coord] = chunk;
            this.worldContainer.addChild(chunk.all);
        });

        
        for(const coord in chunksToBeDeleted) {
            delete this.loadedChunks[coord];
            this.worldContainer.removeChild(chunksToBeDeleted[coord].all);
        }

        
    }

    getChunkCoord(x: number, y: number): string {
        return Map2D.coord(this.getChunkN(x), this.getChunkN(y));
    }

    private addToPlatform(chunkCoords: string, normalCoords: string, type: string) {
        if(this.worldContainerMap.map[chunkCoords] == undefined) {
            this.worldContainerMap.map[chunkCoords] = new Chunk(this.atlas, blockSize, this.chunkSize);
        }

        this.worldContainerMap.map[chunkCoords].placePlatformBlock(normalCoords, type);
        //this.worldContainerMap.map[coord].platform.addChild(s);
    }

    addBlock(x: number, y: number, type: string): BaseObject {
        const o = blockTypes[type](x, y, this);
        if(o instanceof DynamicObj) return o;

        const normalCoords: string = Map2D.coord(x, y);
        const chunkCoord: string = this.getChunkCoord(x, y);
        this.addToPlatform(chunkCoord, normalCoords, type);
        this.keymapInsert(o);

        return o;
    }

    addBlockIfEmpty(x: number, y: number, type: string): BaseObject | false {
        const bounds: BoxBound = DynamicObj.generateBounds(x * blockSize, y * blockSize, blockSize, blockSize);
        const found = this.getTree().blockFind(bounds);
        if(found) return false;

        return this.addBlock(x, y, type);
    }

    destroyBlock(obj: BaseObject) {
        this.worldContainer.removeChild(obj.sprite);
        const result = this.getTree().deleteObj(obj.pos);
        if(!result) throw new Error(
            "objects.ts: couldn't delete unknown block"
        );
    }

    removeBlock(x: number, y: number) {
        const bounds: BoxBound = DynamicObj.generateBounds(x * blockSize, y * blockSize, blockSize, blockSize);
        const found = this.getTree().blockFind(bounds);
        if(!found) return;
        if(found.length > 1) throw new Error(
            "objects.ts: found length is greater than 1"
        );

        const block = found[0];
        this.destroyBlock(block);
    }

    async convertLevelToString(): Promise<string> {
        const tree = this.getTree();
        
        const final: string = await Keymap.buildString(this.size / blockSize, this.size / blockSize, (x: number, y: number) => {
            x *= blockSize;
            y *= blockSize;

            const found = tree.blockFind(BaseObject.generateBounds(x, y, blockSize, blockSize));

            if(found) return found[0].character;
        });

        return final;
    }

    greedyMesh() {
        this.worldContainerMap.forEach((coord: string, chunk: Chunk) => {
            const [x, y] = Map2D.getFromCoord(coord);
            chunk.greedyMeshPlatform(this.getChunkN(x / this.chunkSize), this.getChunkN(y / this.chunkSize));

            //this.worldContainer.addChild(mesh);
        });
    }
}

const blockTypes: {[index: string]: (x: number, y: number, world?: World) => BaseObject} = {
    block(x: number, y: number): BaseObject {
        const o = new BaseObject({
            x: x * blockSize,
            y: y * blockSize,
            width: blockSize,
            height: blockSize,
            character: "#",
            texture: textures["blocks/block.png"],
            onTouch() {
                o.sprite.tint = 0xfff000;
            },
        });

        o.sprite.tint = 0x1ae9f0;

        //setBlock(o.sprite, x, y);
        return o;
    },
    spike(x: number, y: number): BaseObject {
        const o = new BaseObject({
            character: "$",
            x: x * blockSize,
            y: y * blockSize,
            width: blockSize,
            height: blockSize,
            texture: textures["blocks/spike.png"],
            onTouch(e: BaseObject) {
                e.hurt(2);
            },
        });

        o.sprite.tint = 0xff0000;

        return o;
    },
    enemy(x: number, y: number, world?: World): BaseObject {
        const o = new Enemy({
            character: "E",
            texture: textures["enemies/jumpy.png"],
            x: x * blockSize,
            y: y * blockSize,
            width: blockSize,
            height: blockSize,
            heightX: blockSize / 2,
            offsetHeightX: 4,

            // wtf is this bug
            getTree: () => world!.getTree(),
            container: world!.worldContainer,
        });

        world!.entities.push(o);

        return o;
    },
};