import { Texture } from "pixi.js";
import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { player, world } from "../start";

const panController = new PanController({
    touchEl: document.documentElement,
});

panController.onPan = function(x, y) {
    world.container.x -= x;
    world.container.y -= y;
};

panController.disable();

const basicBlock = $("#ui > #level-editor #basic-block") as HTMLButtonElement;

var currentLevel = "start";
var selectedBlock: string | null = null;

basicBlock.onpointerup = function() {
    selectedBlock = "basic-block";
    panController.onPan = function(dx, dy, px, py) {
        const x = Math.round((px - player.pos.x) / 16) * 16 + player.pos.x - Math.round(world.container.position.x);
        const y = Math.round((py - player.pos.y) / 16) * 16 + player.pos.y - Math.round(world.container.position.y);
        if(x < 0 || y < 0) return;

        world.addBlock(x / 16, y / 16, Texture.WHITE);
    }
};

export function enableLevelEditor() {
    panController.enable();
}

