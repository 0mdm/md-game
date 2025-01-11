import { Texture } from "pixi.js";
import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { player, world } from "../start";

const panController = new PanController({
    touchEl: document.documentElement,
});

var isClicked = false;
var ogX: number = 0;
var ogY: number = 0;

function pan(x: number, y: number) {
    if(!isClicked) {
        ogX = world.container.x;
        ogY = world.container.y;
        isClicked = true;
    }
    world.container.x -= x;
    world.container.y -= y;
};

panController.onPan = pan;

panController.disable();

const basicBlock = $("#ui > #level-editor #basic-block") as HTMLButtonElement;

var selectedBlock: string | null = null;

basicBlock.onpointerup = function() {
    basicBlock.classList.toggle("selected");
    if(selectedBlock == "basic-block") {
        return panController.onPan = pan;
    }
    selectedBlock = "basic-block";
    panController.onPan = function(dx, dy, px, py) {
        const x = Math.round((px - player.pos.x) / 16) * 16 + player.pos.x - Math.round(world.container.position.x);
        const y = Math.round((py - player.pos.y) / 16) * 16 + player.pos.y - Math.round(world.container.position.y);
        if(x < 0 || y < 0) return;

        
        world.addBlockIfEmpty(x / 16, y / 16, Texture.WHITE);
    }
};

export function enableLevelEditor() {
    panController.enable();
    pan(0, 0);
}

export function panBack() {
    if(isClicked) {
    isClicked = false;
    world.container.x = ogX;
    world.container.y = ogY;
    console.log(ogX, ogY);
    }
}
