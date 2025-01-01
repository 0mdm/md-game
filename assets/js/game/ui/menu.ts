import { $, toggleElement } from "../../lib/util";
import { player } from "../start";
import { enableLevelEditor } from "./level-editor";

var isMenuOpened = false;

const controls = $("#ui > #controls") as HTMLDivElement;

const menuBar = $("#ui > #menu-bar") as HTMLDivElement;

const menuBtn = $("#ui > #menu-bar #menu-btn");
menuBtn.addEventListener("pointerup", e => toggleMenu());

const menuOverlay = $("#ui > #menu-overlay") as HTMLDivElement;

function toggleMenu() {
    isMenuOpened = !isMenuOpened;
    toggleElement(menuOverlay, isMenuOpened);
}

const levelEditor = $("#ui > #menu-overlay #level-editor");
levelEditor.addEventListener("pointerup", e => {
    toggleMenu();
    toggleElement(menuBar, isMenuOpened);
    toggleElement(controls, isMenuOpened);
    player.disableGravity();
    player.hide();
    enableLevelEditor();
});