import { Application } from "pixi.js";
import { $ } from "../lib/util";

export const app = await new Application().init({
    preference: "webgpu",
    powerPreference: "high-performance",
    antialias: false,
    autoDensity: true,
    canvas: $("#c") as HTMLCanvasElement,
    hello: true,
    height: innerHeight,
    width: innerWidth,
    resolution: devicePixelRatio,
});

