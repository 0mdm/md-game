import { $ } from "../lib/util";
import { player } from "./player";

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
    right: true,
};

setInterval(() => {
}, 1 / 60);

up(upB, () => moving.up = true);
up(leftB, () => moving.left = true);
up(downB, () => moving.down = true);
up(rightB, () => moving.right = true);

down(upB, () => moving.up = false);
down(leftB, () => moving.left = false);
down(downB, () => moving.down = false);
down(rightB, () => moving.right = false);