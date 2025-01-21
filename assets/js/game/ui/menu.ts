import { btn1 } from "../../lib/ui";
import { $, btnList } from "../../lib/util";
import { enableLevelEditor } from "./level-editor";
import "./inventory";
import { toggleDebugTools } from "./dev/debug";
import { enableTexturePacker } from "./dev/texture-packer";

export function createBackBtn(up?: () => void): HTMLButtonElement {
    return btn1("Back", up);
}

export const menuBar = $("#ui > #menu-bar") as HTMLElement;

const list = btnList([
    btn1("Level Editor", enableLevelEditor),
    btn1("Dev Tools", showDevTools),
], () => menuBar.style.display = "none");

list.addTo(menuBar);

const devMenuEl = $("#ui > #dev-menu") as HTMLDivElement;
const devList = btnList([
    btn1("Toggle Debug Info", toggleDebugTools),
    btn1("Texture Packer", enableTexturePacker),
], () => {
    devMenuEl.style.display = "none";
    menuBar.style.display = "flex";
});

devMenuEl.appendChild(createBackBtn(() => {
    devMenuEl.style.display = "none";
    menuBar.style.display = "flex";
}));
devList.addTo(devMenuEl);

function showDevTools() {
    devMenuEl.style.display = "flex";
}
