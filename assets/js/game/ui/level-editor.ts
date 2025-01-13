import { Texture } from "pixi.js";
import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { disableControls, enableControls } from "../controls";
import { player, world } from "../start";
import { createBackBtn, menuBar } from "./menu";

const pan = new PanController({
    touchEl: document.documentElement,
    enabled: false
});

const levelEditor = $("#ui > #level-editor") as HTMLElement;
const back = createBackBtn(disableLevelEditor);
levelEditor.appendChild(back);
var cx = 0;
var cy = 0;

function onPan(x: number, y: number) {
    world.container.position.x -= x;
    world.container.position.y -= y;
    cx += x;
    cy += y;
}

export function enableLevelEditor() {
    levelEditor.style.display = "block";
    player.disable();
    disableControls();
    
    pan.onPan = onPan;
    pan.enable();
}

function disableLevelEditor() {
    levelEditor.style.display = "none";
    player.enable();
    enableControls();
    world.container.position.x += cx;
    world.container.position.y += cy;
    cx = 0;
    cy = 0;
    menuBar.style.display = "flex";

    pan.disable();
    pan.setGrabCursor("grab", "grabbing");
    basicBlock.style.color = "black";
    basicBlockChosen = false;
}

var basicBlockChosen = false;
const basicBlock = $("#ui > #level-editor #basic-block") as HTMLButtonElement;
basicBlock.style.color = "black";
basicBlock.onpointerup = function() {
    basicBlockChosen = !basicBlockChosen;

    if(basicBlockChosen) {
        pan.setGrabCursor("crosshair", "crosshair");
        pan.onPan = placeBlock;
        basicBlock.style.color = "red";
    } else {
        pan.setGrabCursor("grab", "grabbing");
        pan.onPan = onPan;
        basicBlock.style.color = "black";
    }
}

function placeBlock(dx: number, dy: number, px: number, py: number) {
    const worldX = px - world.container.position.x;
    const worldY = py - world.container.position.y;
    const x = Math.floor(worldX / 16);
    const y = Math.floor(worldY / 16);
    world.addBlock(x, y, Texture.WHITE);
}