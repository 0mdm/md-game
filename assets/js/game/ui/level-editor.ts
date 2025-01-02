import { Texture } from "pixi.js";
import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { world } from "../start";

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
    panController.onPan = function(dx, dy) {
        const x = Math.abs(dx);
        const y = Math.abs(dy);
        world.addBlock(x, y, Texture.WHITE);
    }
};

export function enableLevelEditor() {
    panController.enable();
}

