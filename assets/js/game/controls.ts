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

const speed = 4;

const moving = {
    up: false,
    left: false,
    down: false,
    right: false,
};

var controlsIsDisabled = false;
var popupShown = false;
var isTabActive = true;
var lastUpdate = performance.now();
const expectedFPS = 1000 / 60;

export function disableControls() {
    controlsIsDisabled = true;
}

export function enableControls() {
    controlsIsDisabled = false;
}

addEventListener("blur", e => {
    isTabActive = false; 
});

addEventListener("focus", e => {
    isTabActive = true;
});

var tabFocusLost = false;

function loop() {
    const current = performance.now();

    if(tabFocusLost) {
        tabFocusLost = false;
        lastUpdate = current + 1;
        console.log(0)
    }

    const rDelta = current - lastUpdate;
    const deltaTime = rDelta / expectedFPS;
    lastUpdate = current;

    if(controlsIsDisabled) return requestAnimationFrame(loop);
    if(deltaTime > 1 && !popupShown && isTabActive) {
        popupShown = true;
        console.log("Please turn off low-power mode. It messes with the game");
    }

    if(moving.up) {
        player.jump(deltaTime);
    } else {
        player.jumpEnd();
    }

    if(moving.left) player.moveLeft(speed * deltaTime);
    if(moving.right) player.moveRight(speed * deltaTime);
    player.tick(deltaTime);

    requestAnimationFrame(loop);
}

addEventListener("visibilitychange", () => {
    if(document.visibilityState == "hidden") {
        tabFocusLost = true;
    }
});

loop();

//setInterval(loop, expectedFPS);

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