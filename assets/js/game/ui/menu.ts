import { btn1 } from "../../lib/ui";
import { $, btnList } from "../../lib/util";
import { enableLevelEditor } from "./level-editor";
import "./inventory";
import { enableInventory } from "./inventory";

export function createBackBtn(up?: () => void) {
    if (!up) up = () => {};
    return btn1("Back", up);
}

export const menuBar = $("#ui > #menu-bar") as HTMLElement;

const list = btnList([
    btn1("Level Editor", enableLevelEditor)
], () => menuBar.style.display = "none");

list.addTo(menuBar);
