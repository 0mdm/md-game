import { Container, Sprite, Texture } from "pixi.js";
import { Keymap } from "./keymap";
import { blockSize, Quadtree, setQuadreeDebug } from "./quadtree";
import { Player, PlayerOpts, setSpawn } from "./objects";
import { app } from "../main/app";
import { textures } from "../main/canvas";
import { DynamicObj } from "./dynamic-object";
import { Enemy } from "./enemy";
import { BaseObject, BoxBound } from "./base-object";

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
    container = new Container(); // world
    keymap = new Keymap();
    player: Player;
    cLevel: string; // current level
    size: number = 2048 * 2;

    entities: Enemy[] = [];

    getTree(): Quadtree {
        const t = this.trees[this.cLevel];
        
        return t;
    }

    constructor(o: WorldOpts) {
        this.cLevel = o.startLevel;

        o.player ||= {};

        setQuadreeDebug(this.container);

        this.player = new Player({
            worldContainer: this.container,
            texture: o.player.texture || Texture.WHITE,
            getTree: () => this.trees[this.cLevel],
        });


        for(const i in levelMap) {
            this.trees[i] = new Quadtree(0, 0, this.size, this.size);
        }

        this.setKeymap();
        this.loadLevel(this.cLevel);

        app.stage.addChild(this.container);
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

    addBlock(x: number, y: number, type: string) {
        const o = blockTypes[type](x, y, this);
        if(o instanceof DynamicObj) return;

        this.container.addChild(o.sprite);
        this.keymapInsert(o);
    }

    addBlockIfEmpty(x: number, y: number, type: string): boolean {
        const bounds: BoxBound = DynamicObj.generateBounds(x * blockSize, y * blockSize, blockSize, blockSize);
        const found = this.getTree().blockFind(bounds);
        if(found) return false;

        this.addBlock(x, y, type);
        return true;
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
            container: world!.container,
        });

        world!.entities.push(o);

        return o;
    },
};