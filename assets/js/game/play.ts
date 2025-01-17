import { $ } from "../lib/util";
import { disableControls, enableControls, loop } from "./controls";
import { player } from "./start";

const controls = $("#ui > #controls") as HTMLDivElement;
const start = $("#ui > #play-c #play") as HTMLButtonElement;
const startC = $("#ui > #play-c") as HTMLDivElement;
const menuBar = $("#ui > #menu-bar") as HTMLElement;

player.disable();
disableControls();
controls.style.display = "none";
menuBar.style.display = "none";

start.addEventListener("pointerup", e => {
    player.enable();
    enableControls();
    controls.style.display = "flex";
    startC.style.display = "none";
    menuBar.style.display = "flex";
});