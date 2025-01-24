import { $ } from "../lib/util";
import { audio } from "../main/canvas";
import { player, world } from "./start";
import { Howl } from "howler";
import { setDebugStats } from "./ui/dev/debug";

const jumpSfx = new Howl({
    src: [audio["sfx/jump.mp3"]],
    html5: true,
});

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

const speed = 5;

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

export function loop() {
    const current = performance.now();

    if(tabFocusLost) {
        tabFocusLost = false;
        lastUpdate = current + 1;
    }

    const rDelta = current - lastUpdate;
    const deltaTime = rDelta / expectedFPS;
    const fps = 1000 / rDelta;
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

    player.stopWalking();
    if(moving.left) {
        player.turnLeft();
        player.moveLeft(speed * deltaTime);
        player.continueWalking();
    }

    if(moving.right) {
        player.turnRight();
        player.moveRight(speed * deltaTime);
        player.continueWalking();
    }
    player.tick(deltaTime);

    for(const entity of world.entities) {
        entity.tick(deltaTime);
    }

    setDebugStats(fps, rDelta, deltaTime);

    requestAnimationFrame(loop);
}

loop();

player.onJumpStart = () => jumpSfx.play();

addEventListener("visibilitychange", () => {
    if(document.visibilityState == "hidden") {
        tabFocusLost = true;
    }
});

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