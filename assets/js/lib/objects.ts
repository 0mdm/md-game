import { Sprite, Texture } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";

interface PlayerOpts {
    texture: Texture;
}

export class Player {
    constructor(o: PlayerOpts) {
        const playerSprite = new Sprite(o.texture);
        playerSprite.scale.x = 10;
        playerSprite.scale.y = 20;
        playerSprite.position.set(halfWidth, halfHeight);
        playerSprite.anchor.set(0.5, 0.5);

        app.stage.addChild(playerSprite);
    }


}