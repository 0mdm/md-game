import { Container, Sprite, Texture } from "pixi.js";
import { Keymap } from "./keymap";
import { BaseObject, Quadtree } from "./quadtree";
import { GameObject } from "./objects";
import { app } from "../main/app";

interface TreeMap {
    [index: string]: Quadtree;
}

interface LevelMap {
    [index: string]: string;
}

export const levelMap: LevelMap = {};

export class World {
    trees: TreeMap = {};
    container = new Container();
    keymap = new Keymap();
    cLevel: string; // current level

    constructor(startLevel: string) {
        this.cLevel = startLevel;
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
                stage: app.stage,
            });
            self.keymapInsert(o, s);
        });
    }
}