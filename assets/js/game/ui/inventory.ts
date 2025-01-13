import { $ } from "../../lib/util";
import { disableControls, enableControls } from "../controls";
import { createBackBtn, menuBar } from "./menu";

const inventory = $("#ui > #inventory") as HTMLElement;
const back = createBackBtn(disableInventory);

inventory.appendChild(back);

function disableInventory() {
    inventory.style.display = "none";
    menuBar.style.display = "flex";
    //enableControls();
}

export function enableInventory() {
    inventory.style.display = "block";
    //disableControls();
}
