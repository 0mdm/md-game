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

const moving = {
    up: false,
    left: false,
    down: false,
    right: false,
};

setInterval(() => {
    if(moving.up) {
        player.jump();
    } else {
        player.jumpEnd();
    }

    if(moving.left) player.moveLeft(1);
    if(moving.right) player.moveRight(1);
    player.tick();
}, 1 / 30);

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