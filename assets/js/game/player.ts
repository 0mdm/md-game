import {Container, Sprite, Texture} from "pixi.js";
import { app } from "../main/app";
import { halfHeight, halfWidth } from "../main/canvas";
import { Player } from "../lib/objects";

export const player = new Player({
    texture: Texture.WHITE,
    worldContainer: new Container(),
});

