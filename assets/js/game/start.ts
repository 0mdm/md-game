import { app } from "../main/app";
import { World } from "../lib/world";
import { setPlayerObj } from "../lib/enemy";
import { atlasTexture, spritesheet, spritesheetObj } from "../main/atlas";
import { Texture } from "pixi.js";
import { textures } from "../main/canvas";

export const world = new World({
    startLevel: "start",
    //atlas: textures["enemies/jumpy.png"],
    atlas: atlasTexture,
    spritesheet: spritesheet,
});

export const player = world.player;

setPlayerObj(player);

app.stage.addChild(world.worldContainer);

