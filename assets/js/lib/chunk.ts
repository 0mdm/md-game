import { Container } from "pixi.js";
import { Map2D } from "./keymap";

export interface ContainerZindex {
    all: Container;
    platform: Map2D<Container>;
}

export function generateZIndexContainers(): ContainerZindex {
    const o: ContainerZindex = {
        all: new Container(),
        platform: new Map2D<Container>,
    }

    o.platform.forEach((t: Container) => o.all.addChild(t));

    return o;
}
