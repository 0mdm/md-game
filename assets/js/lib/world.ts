import { Container, Sprite, Texture } from "pixi.js";
import { Keymap, Map2D } from "./keymap";
import { blockSize, Quadtree, setQuadreeDebug } from "./quadtree";
import { Player, PlayerOpts, setSpawn } from "./objects";
import { app } from "../main/app";
import { textures } from "../main/canvas";
import { DynamicObj } from "./dynamic-object";
import { Enemy } from "./enemy";
import { BaseObject, BoxBound } from "./base-object";
import { ContainerZindex, generateZIndexContainers } from "./chunk";
import { floorToMultiples } from "./util";

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
}

export class World {
    trees: TreeMap = {};
    worldContainer: Container; // current container
    worldContainerMap: ContainerZindex;
    container: {[level: string]: ContainerZindex} = {};
    keymap = new Keymap();
    player: Player;
    cLevel: string; // current level
    chunkSize: number = 16;
    size: number = 2048 * 2;
    renderDx: number = 2;
    renderDy: number = 1;
    loadedChunks: {[coord: string]: Container} = {};

    entities: Enemy[] = [];

    getTree(): Quadtree {
        const t = this.trees[this.cLevel];
        
        return t;
    }

    constructor(o: WorldOpts) {
        this.cLevel = o.startLevel;
        this.container[this.cLevel] = generateZIndexContainers();
        this.worldContainer = this.container[this.cLevel].all;
        this.worldContainerMap = this.container[this.cLevel];

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

        app.stage.addChild(this.worldContainer);
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
            self.addBlock(x, y, "basic");
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
        const chunkX = this.getChunkN(this.player.pos.x / blockSize);
        const chunkY = this.getChunkN(this.player.pos.y / blockSize);

        const chunksToBeDeleted: {[coord: string]: Container} = {};

        this.worldContainerMap.platform
        .radius(chunkX, chunkY, this.renderDx+1, this.renderDx+1, this.chunkSize, (coord: string, c: Container) => {
            if(this.loadedChunks[coord] == undefined) return;
            chunksToBeDeleted[coord] = c;
        });

        this.worldContainerMap.platform
        .radius(chunkX, chunkY, this.renderDx, this.renderDy, this.chunkSize, (coord: string, c: Container) => {
            delete chunksToBeDeleted[coord];
            this.loadedChunks[coord] = c;
            this.worldContainer.addChild(c);
        });

        for(const coord in chunksToBeDeleted) {
            delete this.loadedChunks[coord];
            this.worldContainer.removeChild(chunksToBeDeleted[coord]);
        }
    }

    getChunkCoord(x: number, y: number): string {
        return Map2D.coord(this.getChunkN(x), this.getChunkN(y));
    }

    private addToPlatform(coord: string, s: Sprite) {
        if(this.worldContainerMap.platform.map[coord] == undefined) {
            const c = new Container();
            this.worldContainerMap.platform.map[coord] = c;
            //this.worldContainerMap.all.addChild(c);
        }

        this.worldContainerMap.platform.map[coord].addChild(s);
    }

    addBlock(x: number, y: number, type: string): BaseObject {
        const o = blockTypes[type](x, y, this);
        if(o instanceof DynamicObj) return o;

        const chunkCoord: string = this.getChunkCoord(x, y);
        this.addToPlatform(chunkCoord, o.sprite);

        /*this.worldContainerMap.platform.map[chunkCoord].visible = false;
        if(this.test) this.worldContainerMap.platform.map[chunkCoord].visible = false;
        this.test = !this.test;*/

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
}

const blockTypes: {[index: string]: (x: number, y: number, world?: World) => BaseObject} = {
    basic(x: number, y: number): BaseObject {
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