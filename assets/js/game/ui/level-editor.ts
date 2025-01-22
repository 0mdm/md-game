import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { disableControls, enableControls } from "../controls";
import { player, world } from "../start";
import { createBackBtn, menuBar } from "./menu";
import { blockSize } from "../../lib/quadtree";
import { ElList } from "../../lib/ui";
import { images } from "../../main/canvas";
import { BaseObject } from "../../lib/base-object";
import { spritesheetAsset } from "pixi.js";
import { screenHeight, screenWidth } from "../../main/app";

const panArea = $("#pan-area") as HTMLDivElement;

const pan = new PanController({
    touchEl: panArea,
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
    player.sprite.position.x -= x;
    player.sprite.position.y -= y;
    cx += x;
    cy += y;
}

export function enableLevelEditor() {
    levelEditor.style.display = "block";
    panArea.style.pointerEvents = "auto";
    player.disable();
    disableControls();
    
    pan.onPan = onPan;
    pan.enable();
}

function disableLevelEditor() {
    levelEditor.style.display = "none";
    panArea.style.pointerEvents = "none";
    player.enable();
    enableControls();
    world.container.position.x += cx;
    world.container.position.y += cy;
    player.sprite.position.x += cx;
    player.sprite.position.y += cy;
    cx = 0;
    cy = 0;
    menuBar.style.display = "flex";

    pan.disable();
    pan.setGrabCursor("grab", "grabbing");
    elList.exit();
}

const offsetX = (innerWidth - screenWidth) / 2;
const offsetY = (innerHeight - screenHeight) / 2;

function getBlockPos(px: number, py: number): [number, number] {
    const worldX = px - offsetX - world.container.position.x;
    const worldY = py - offsetY - world.container.position.y;

    const x = Math.floor(worldX / blockSize);
    const y = Math.round(worldY / blockSize);

    return [x, y];
}

function removeBlock(px: number, py: number) {
    const [x, y] = getBlockPos(px, py);

    world.removeBlock(x, y);
}

function placeBlock(name: string, px: number, py: number): BaseObject | false {
    const [x, y] = getBlockPos(px, py);

    const block = world.addBlockIfEmpty(x, y, name);
    return block;
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

var t = 0;

const blocks = $("#ui > #level-editor > #blocks") as HTMLDivElement;
const elList = new ElList(blocks, [
    ElList.generate("delete", images["misc/trash.png"]),
    ElList.generate("basic", images["blocks/block.png"]),
    ElList.generate("spike", images["blocks/spike.png"]),
], (name: string, el: HTMLElement) => {
    pan.setGrabCursor("crosshair", "crosshair");
    el.classList.add("block-selected");

    if(name == "delete") {
        pan.onPan = function(dx: number, dy: number, px: number, py: number) {
            removeBlock(px, py);
        }
    } else {
        pan.onPan = function(dx: number, dy: number, px: number, py: number) {
            const obj: BaseObject | false = placeBlock(name, px, py);
            if(!obj) return;

            if(rotation == 0) return;
            const s = obj.sprite;
            s.rotation = rotation * (Math.PI / 180);
        };
    }
}, (el: HTMLElement) => {
    el.classList.remove("block-selected");
}, () => {
    pan.setGrabCursor("grab", "grabbing");
    pan.onPan = onPan;
});

const left = $("#ui > #level-editor > #util #left") as HTMLButtonElement;
const right = $("#ui > #level-editor > #util #right") as HTMLButtonElement;
var lastRotation = 0;
var rotation = 0;

left.onpointerup = function() {
    lastRotation = rotation;
    rotation -= 90;
    if(rotation < 0) rotation = 270;
    setRotation();
};

right.onpointerup = function() {
    lastRotation = rotation;
    rotation += 90;
    if(rotation >= 360) rotation = 0;
    setRotation();
};

function setRotation() {
    blocks.classList.remove("deg-" + lastRotation.toString());
    blocks.classList.add("deg-" + rotation.toString());
    console.log(blocks.classList)
}

/*
const importLevel = $("#import-level") as HTMLElement;
importLevel.onpointerup = function() {
    const text = prompt("Enter level text");
    if(!text) return;

};*/