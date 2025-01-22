import { Application } from "pixi.js";
import { $ } from "../lib/util";

export const app = await new Application();

export const screenHeight = Math.min(innerHeight, 700);
export const screenWidth = Math.min(innerWidth, 1100);

app.init({
    preference: "webgpu",
    powerPreference: "high-performance",
    antialias: false,
    autoDensity: true,
    canvas: $("#c") as HTMLCanvasElement,
    hello: true,
    height: screenHeight,
    width: screenWidth,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
});
