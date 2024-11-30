import { Container, Sprite, Texture } from "pixi.js";
import { levelOne } from "../levels/1";
import { Keymap } from "../lib/keymap";
import { app } from "../main/app";
import { player } from "./player";
import { Quadtree } from "../lib/quadtree";
import { GameObject } from "../lib/objects";

const tree1 = new Quadtree({
    x: 0,
    y: 0,
    width: innerWidth - (innerWidth % 8),
    height: innerWidth - (innerWidth % 8),
});

player.useTree(tree1);

const keymap = new Keymap();
const container = player.worldContainer;

keymap.key("#", (x, y) => {
    const s = new Sprite(Texture.WHITE);
    s.position.set(x * 16, y * 16);
    s.scale.set(16);
    s.tint = Math.random() * 0xffffff;
    container.addChild(s);

    const o = new GameObject(s);
    if(!tree1.insert(o)) throw new Error(
        "Object didn't go into the quadtree."
    +   `\n(${s.position.x}, ${s.position.y}) didn't go to bounds of (${tree1.x}, ${tree1.y}, ${tree1.maxX}, ${tree1.maxY})`
    );
});

keymap.run(levelOne);

app.stage.addChild(container);