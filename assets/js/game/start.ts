import { app } from "../main/app";
import { World } from "../lib/world";

const world = new World({
    startLevel: "start",
});

export const player = world.player;

app.stage.addChild(world.container);
