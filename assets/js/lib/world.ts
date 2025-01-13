import { Assets, Container, Sprite, Texture } from "pixi.js";
import { Keymap } from "./keymap";
import { BaseObject, Quadtree, setQuadreeDebug } from "./quadtree";
import { Player, PlayerOpts, QuadtreeBox } from "./objects";
import { app } from "../main/app";
import { $, $$, rand255 } from "./util";

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

    getTree(): Quadtree {
        return this.trees[this.cLevel];
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
            this.trees[i] = new Quadtree(0, 0, 2048, 2048);
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
    }

    addBlock(x: number, y: number, type: string) {
        const [s, o] = blockTypes[type](x, y);

        this.container.addChild(s);
        this.container.addChild(o.sprite);
        this.keymapInsert(o, s);
    }

    addBlockIfEmpty(x: number, y: number, t: Texture) {
        const o: QuadtreeBox = {
            x: x,
            y: y,
            width: 16,
            height: 16,
            maxX: x + 16,
            maxY: y + 16,
        };

        console.log(this.getTree().find(o, true));
    }
}

function setBlock(s: Sprite, x: number, y: number) {
    s.scale.set(16);
    s.position.set(x * 16, y * 16);
}

type BlockMesh = [Sprite, BaseObject];

const spikeT = await Assets.load("assets/sprites/blocks/spike.png");

const blockTypes: {[index: string]: (x: number, y: number) => BlockMesh} = {
    basic(x: number, y: number): BlockMesh {
        const s = new Sprite(Texture.WHITE);
        s.tint = 0x1ae9f0;
        setBlock(s, x, y);

        const o = new BaseObject({
            x: s.x,
            y: s.y,
            width: 16,
            height: 16,
            sprite: s,
            onTouch() {
                s.tint = 0xfff000;
            },
        })

        return [s, o];
    },
    spike(x: number, y: number): BlockMesh {
        const s = new Sprite(spikeT);
        s.scale.set(0.5);
        s.position.set(x * 16, y * 16);

        const o = new BaseObject({
            x: s.x,
            y: s.y,
            width: 16,
            height: 16,
            sprite: s,
            onTouch() {
                s.tint = 0x000000;
                $("#menu-bar").appendChild($$("h1", {
                    style: {
                        color: `rgb(${rand255()}, ${rand255()}, ${rand255()})`,
                    },
                    text: "YOU DIED!"
                }))
            },
        })

        return [s, o];
    }
};