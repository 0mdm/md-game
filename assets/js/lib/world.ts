import { Container, Sprite, Texture } from "pixi.js";
import { Keymap } from "./keymap";
import { BaseObject, Quadtree } from "./quadtree";
import { GameObject, Player, PlayerOpts } from "./objects";
import { app } from "../main/app";

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

    constructor(o: WorldOpts) {
        this.cLevel = o.startLevel;

        o.player ||= {};
        this.player = new Player({
            worldContainer: this.container,
            texture: o.player.texture || Texture.WHITE,
        });

        for(const i in levelMap) {
            this.trees[i] = new Quadtree(0, 0, 8000, 8000);
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
            const s = new Sprite(Texture.WHITE);
            s.position.set(x * 16, y * 16);
            s.scale.set(16);
            s.tint = Math.random() * 0xffffff;
            this.container.addChild(s);
        
            const o = new BaseObject({
                x: s.x,
                y: s.y,
                width: 16,
                height: 16,
                sprite: s,
            });

            this.container.addChild(o.sprite);
            console.log(o.sprite);

            self.keymapInsert(o, s);
        });
    }
}