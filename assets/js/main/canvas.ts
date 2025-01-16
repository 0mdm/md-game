import { Assets, Texture } from "pixi.js";

export const halfWidth = Math.round(innerWidth / 2 * 100) / 100;
export const halfHeight = Math.round(innerHeight / 2 * 100) / 100;

document.documentElement.style.setProperty("--w", innerWidth + "px");
document.documentElement.style.setProperty("--h", innerHeight + "px");

type GlobArr = [string, (() => Promise<{default: string}>)];

export const images: {[index: string]: string} = {};
export const textures: {[index: string]: Texture} = {};

const spriteDir = "../../sprites/";
const imgArr: GlobArr[] = 
Object.entries(import.meta.glob<{default: string}>("../../sprites/**"))
.map(([name, img]: GlobArr) => [name.slice(spriteDir.length), img]);

for(const [name, img] of imgArr) {
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

export const audio: {[index: string]: string} = {};
const audioDir = "../../audio/";
const audioArr: GlobArr[] = Object.entries(import.meta.glob<{default: string}>("../../audio/**"))
.map(([name, audio]: GlobArr) => [name.slice(audioDir.length), audio]);

for(const [name, getAudio] of audioArr) {
    const recievedAudio: {default: string} = await getAudio();
    if(typeof recievedAudio == "object") {
        audio[name] = recievedAudio.default; 
    } else {
        throw new Error(
            `loader.ts: recieved type wasn't "{default: string}"`
        );
    }
}

