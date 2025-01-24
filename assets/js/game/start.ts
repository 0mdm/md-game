import { app } from "../main/app";
import { World } from "../lib/world";
import { setPlayerObj } from "../lib/enemy";

export const world = new World({
    startLevel: "start",
});

export const player = world.player;

setPlayerObj(player);

app.stage.addChild(world.worldContainer);

