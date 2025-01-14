import { Assets, Texture } from "pixi.js";

export const halfWidth = Math.round(innerWidth / 2 * 100) / 100;
export const halfHeight = Math.round(innerHeight / 2 * 100) / 100;

document.documentElement.style.setProperty("--w", innerWidth + "px");
document.documentElement.style.setProperty("--h", innerHeight + "px");

type imgPromiseArr = [string, (() => Promise<{default: string}>)];

export const images: {[index: string]: string} = {};
export const textures: {[index: string]: Texture} = {};

const baseDir = "../../sprites/";
const fileArr: imgPromiseArr[] = 
Object.entries(import.meta.glob<{default: string}>("../../sprites/**"))
.map(([name, img]: imgPromiseArr) => [name.slice(baseDir.length), img]);

for(const [name, img] of fileArr) {
    const recievedImages: {default: string} = await img();
    if(typeof recievedImages == "object") {
        images[name] = recievedImages.default;
        textures[name] = await Assets.load(images[name]);
    } else {
        throw new Error(
            `loader.ts: recieved type wasn't "{default: string}"`
        );
    }
}
