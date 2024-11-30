import { Container, Sprite, Texture } from "pixi.js";
import { levelOne } from "../levels/1";
import { Keymap } from "../lib/keymap";
import { app } from "../main/app";
import { player } from "./player";

const keymap = new Keymap();
const container = player.worldContainer;

keymap.key("#", (x, y) => {
    const s = new Sprite(Texture.WHITE);
    s.position.set(x * 16, y * 16);
    s.scale.set(16);
    //s.tint = 0xefefef;
    container.addChild(s);
});

keymap.run(levelOne);

app.stage.addChild(container);