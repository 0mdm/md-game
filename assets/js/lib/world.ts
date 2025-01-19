import { Assets, Container, GlEncoderSystem, Sprite, Texture } from "pixi.js";
import { Keymap } from "./keymap";
import { BaseObject, blockSize, Quadtree, setQuadreeDebug } from "./quadtree";
import { Player, PlayerOpts, QuadtreeBox, setSpawn } from "./objects";
import { app } from "../main/app";
import { $, $$, rand255 } from "./util";
import { textures } from "../main/canvas";
import { DynamicObj } from "./dynamic-object";
import { Enemy } from "./enemy";

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
            this.trees[i] = new Quadtree(0, 0, 2048 * 2, 2048 * 2);
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

    keymapInsert(o: BaseObject, s: Sprite) {
        const t = this.trees[this.cLevel];
        if(!(this.trees[this.cLevel].insert(o))) throw new Error(
            "Object didn't go into the quadtree."
        +   `\n(${s.position.x}, ${s.position.y}) didn't go to bounds of (${t.x}, ${t.y}, ${t.maxX}, ${t.maxY})`
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
        const [s, o] = blockTypes[type](x, y, this);
        if(o instanceof DynamicObj) return;

        this.container.addChild(s);
        this.container.addChild(o.sprite);
        this.keymapInsert(o, s);
    }

    addBlockIfEmpty(x: number, y: number, type: string): boolean {
        const bounds: QuadtreeBox = DynamicObj.generateBounds(x * blockSize, y * blockSize, blockSize, blockSize);
        const found = this.getTree().blockFind(bounds);
        if(found) return false;

        this.addBlock(x, y, type);
        return true;
    }
}

function setBlock(s: Sprite, x: number, y: number) {
    s.width = blockSize;
    s.height = blockSize;
    s.position.set(x * blockSize, y * blockSize);
}

type BlockMesh = [Sprite, BaseObject | DynamicObj | Enemy];

// const spikeT = await Assets.load("assets/sprites/blocks/spike.png");

const blockTypes: {[index: string]: (x: number, y: number, world?: World) => BlockMesh} = {
    basic(x: number, y: number): BlockMesh {
        const s = new Sprite(textures["blocks/block.png"]);
        setBlock(s, x, y);
        s.tint = 0x1ae9f0;

        const o = new BaseObject({
            x: s.x,
            y: s.y,
            width: blockSize,
            height: blockSize,
            sprite: s,
            onTouch() {
                s.tint = 0xfff000;
            },
        })

        return [s, o];
    },
    spike(x: number, y: number): BlockMesh {
        const s = new Sprite(textures["blocks/spike.png"]);
        s.tint = 0xff0000;
        setBlock(s, x, y);

        const o = new BaseObject({
            x: s.x,
            y: s.y,
            width: blockSize,
            height: blockSize,
            sprite: s,
            onTouch(e?: DynamicObj) {
                e?.hurt(2);
            },
        })

        return [s, o];
    },
    enemy(x: number, y: number, world?: World): BlockMesh {
        const o = new Enemy({
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

        world?.entities.push(o);

        return [o.sprite, o];
    },
};