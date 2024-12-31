import { $ } from "../lib/util";
import { player } from "./start";

function up(el: HTMLButtonElement, f: () => void) {
    el.addEventListener("pointerup", f);
}

function down(el: HTMLButtonElement, f: () => void) {
    el.addEventListener("pointerdown", f);
}

const upB = $("#ui > #controls #up") as HTMLButtonElement;
const leftB = $("#ui > #controls #left") as HTMLButtonElement;
const downB = $("#ui > #controls #down") as HTMLButtonElement;
const rightB = $("#ui > #controls #right") as HTMLButtonElement;

const speed = 8;

const moving = {
    up: false,
    left: false,
    down: false,
    right: false,
};

var popupShown = false;
var isTabActive = true;
var lastUpdate = Date.now();
const expectedFPS = 1000 / 30;

addEventListener("visibilitychange", e => {
    if(document.hidden) {
        isTabActive = false; 
    } else {
        isTabActive = true;
    }
});

setInterval(() => {
    const current = Date.now();
    const deltaTime = (current - lastUpdate) / expectedFPS;
    lastUpdate = current;
    if(deltaTime > 1 && !popupShown && isTabActive) {
        popupShown = true;
        console.log("Please turn off low-power mode. It messes with the game");
    }

    if(moving.up) {
        player.jump();
    } else {
        player.jumpEnd();
    }

    if(moving.left) player.moveLeft(speed * deltaTime);
    if(moving.right) player.moveRight(speed * deltaTime);
    player.tick();
}, 1000 / 60);

addEventListener("keydown", e => {
    if(e.key == "w") moving.up = true;
    if(e.key == "a") moving.left = true;
    if(e.key == "d") moving.right = true;
});

addEventListener("keyup", e => {
    if(e.key == "w") moving.up = false;
    if(e.key == "a") moving.left = false;
    if(e.key == "d") moving.right = false;
});

down(upB, () => moving.up = true);
down(leftB, () => moving.left = true);
down(downB, () => moving.down = true);
down(rightB, () => moving.right = true);

up(upB, () => moving.up = false);
up(leftB, () => moving.left = false);
up(downB, () => moving.down = false);
up(rightB, () => moving.right = false);