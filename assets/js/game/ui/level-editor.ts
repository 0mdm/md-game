import { PanController } from "../../lib/pan-controller";
import { $ } from "../../lib/util";
import { world } from "../start";

const panController = new PanController({
    touchEl: document.documentElement,
});

panController.onPan = ((x, y) => {
    world.container.x -= x;
    world.container.y -= y;
});

panController.disable();

export function enableLevelEditor() {
    panController.enable();
}

