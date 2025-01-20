import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { disableControls, enableControls } from "../controls";
import { player, world } from "../start";
import { createBackBtn, menuBar } from "./menu";
import { blockSize } from "../../lib/quadtree";
import { ElList } from "../../lib/ui";

const pan = new PanController({
    touchEl: $("#ui") as HTMLDivElement,
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
    elList.exit();
    //basicBlock.style.color = "black";
    //basicBlockChosen = false;
}

/*
var basicBlockChosen = false;
const basicBlock = $("#ui > #level-editor #basic-block") as HTMLButtonElement;
basicBlock.onpointerup = function() {
    basicBlockChosen = !basicBlockChosen;

    if(basicBlockChosen) {
        pan.setGrabCursor("crosshair", "crosshair");
        pan.onPan = placeBlock;
        basicBlock.classList.add("block-selected");
    } else {
        pan.setGrabCursor("grab", "grabbing");
        pan.onPan = onPan;
        basicBlock.classList.remove("block-selected");
    }
}

const deleteBlock = $("#ui > #level-editor #delete") as HTMLButtonElement;
deleteBlock.onpointerup = function() {
    basicBlockChosen = false;

};
*/

function getBlockPos(px: number, py: number): [number, number] {
    const worldX = px - world.container.position.x;
    const worldY = py - world.container.position.y;

    const x = Math.floor(worldX / blockSize);
    const y = Math.floor(worldY / blockSize);

    return [x, y];
}

function removeBlock(px: number, py: number) {
    const [x, y] = getBlockPos(px, py);

    world.removeBlock(x, y);
}

function placeBlock(name: string, px: number, py: number) {
    const [x, y] = getBlockPos(px, py);

    world.addBlockIfEmpty(x, y, name);
}

const getText = $("#ui > #level-editor #get-text") as HTMLButtonElement;
getText.addEventListener("pointerup", async e => {
    const st: string = await world.convertLevelToString();
    try {
        await navigator.clipboard.writeText(st);
        alert("Copied to clipboard");
    } catch(err) {
        alert("Couldn't copy to clipboard");
        console.error(err);
    }
});

const blocks = $("#ui > #level-editor #blocks") as HTMLDivElement;
const elList = new ElList(blocks, [
    ElList.generate("delete", "assets/sprites/misc/trash.png"),
    ElList.generate("basic", "assets/sprites/blocks/block.png"),
    ElList.generate("spike", "assets/sprites/blocks/spike.png"),
], (name: string, el: HTMLElement) => {
    pan.setGrabCursor("crosshair", "crosshair");
    el.classList.add("block-selected");

    if(name == "delete") {
        pan.onPan = function(dx: number, dy: number, px: number, py: number) {
            removeBlock(px, py);
        }
    } else {
        pan.onPan = function(dx: number, dy: number, px: number, py: number) {
            placeBlock(name, px, py);
        };
    }
}, (el: HTMLElement) => {
    el.classList.remove("block-selected");
}, () => {
    pan.setGrabCursor("grab", "grabbing");
    pan.onPan = onPan;
});