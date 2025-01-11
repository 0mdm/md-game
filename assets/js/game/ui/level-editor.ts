import { Texture } from "pixi.js";
import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { disableControls, enableControls } from "../controls";
import { player, world } from "../start";
import { createBackBtn, menuBar } from "./menu";

const pan = new PanController({
    touchEl: document.documentElement,
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

    pan.onPan = () => undefined;
}

var basicBlockChosen = false;
const basicBlock = $("#ui > #level-editor #basic-block") as HTMLButtonElement;
basicBlock.style.color = "black";
basicBlock.onpointerup = function() {
    basicBlockChosen = !basicBlockChosen;

    if(basicBlockChosen) {
        pan.onPan = placeBlock;
        basicBlock.style.color = "red";
    } else {
        pan.onPan = onPan;
        basicBlock.style.color = "black";
    }
}

function placeBlock(dx: number, dy: number, px: number, py: number) {
    const x = Math.round((Math.round((px - player.pos.x) / 16) * 16 + player.pos.x - Math.round(world.container.position.x)) / 16);
    const y = Math.round((Math.round((py - player.pos.y) / 16) * 16 + player.pos.y - Math.round(world.container.position.y)) / 16);

    world.addBlock(x, y, Texture.WHITE);
}