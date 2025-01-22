import { SpritesheetData } from "pixi.js";
import { halfWidth } from "../main/canvas";

export interface TextureMesh {
    name: string;
    url: string;
}

interface HeightList {
    [height: string]: {
        name: string;
        img: HTMLImageElement;
    }[];
}

interface ImageList {
    [name: string]: HTMLImageElement;
}

interface CurrentSpritesheets {
    width: number;
    amount: number;
}

interface TexturePackerOpts {
    textures: TextureMesh[];
    url?: string;
    currentSpritesheets?: {[name: string]: CurrentSpritesheets},
}

export class TexturePacker {
    c: HTMLCanvasElement = document.createElement("canvas");
    ctx: CanvasRenderingContext2D;
    textures: TextureMesh[];
    images: HTMLImageElement[] = [];

    heights: HeightList = {};
    processedImages: ImageList = {};

    data: SpritesheetData = {
        frames: {},
        animations: {},
        meta: {
            format: "RGBA8888",
            scale: "1",
        },
    };

    currentSpritesheets: {[name: string]: CurrentSpritesheets};

    constructor(o: TexturePackerOpts) {
        const ctx = this.c.getContext("2d");
        if(ctx == undefined) throw new Error(
            "pack-textures.ts: ctx is undefined"
        );

        this.ctx = ctx;
        this.textures = o.textures;
        this.data.meta.image = o.url;
        this.currentSpritesheets = o.currentSpritesheets || {};
    }

    async pack(): Promise<HTMLCanvasElement> {
        const [totalW, totalH] = await this.processImages();
        const width = Math.ceil(Math.sqrt(Math.abs(totalW**2 - totalH**2)));

        this.sortHeight();
        this.packImages(width, totalH);

        return this.c;
    }

    sortHeight() {
        for(const name in this.processedImages) {
            const height = this.processedImages[name].height;
            if(this.heights[height] == undefined) 
                this.heights[height] = [];

            this.heights[height].push({name, img: this.processedImages[name]});
        }
    }

    private packImages(width: number, maxHeight: number) {
        this.c.width = width;
        this.c.height = width;

        var y = 0;
        for(const height in this.heights) {
            var wasLastItem = false;
            let x = 0;

            for(const {name, img} of this.heights[height]) {
                wasLastItem = false;
                this.drawImage(name, img, x, y);
                x += img.width;

                if(x >= width) {
                    y += Number(height);
                    x = 0;
                    wasLastItem = true;
                }
            }

            if(!wasLastItem) y += Number(height);
            wasLastItem = false;
        }

        //this.c.height = y;
        if(y > maxHeight) throw new Error(
            "pack-textures: y went over max height"
        );
    }

    drawImage(name: string, img: HTMLImageElement, x: number, y: number) {
        this.ctx.drawImage(img, x, y);

        const spritesheet = this.currentSpritesheets[name];
        if(spritesheet) {
            this.data.animations![name] = [];

            // multiple images. Only horizontal
            for(let sx = 0, frameN = 0; sx <= img.width - spritesheet.width; sx += spritesheet.width, frameN++) {
                if(frameN >= spritesheet.amount) throw new Error(
                    "pack-textures.ts: frames went over expected amount"
                );

                const sName = name + "_" + frameN;
                // sName: player_0, player_1, etc.

                this.data.animations![name].push(sName);
                this.data.frames[sName] = this.generateData(x + sx, y, spritesheet.width, img.height);
            }
        } else {
            // one image
            this.data.frames[name] = this.generateData(x, y, img.width, img.height);
        }
    }

    private generateData(x: number, y: number, width: number, height: number) {
        return {
            frame: {
                x,
                y,
                w: width,
                h: height,
            },
            sourceSize: {
                w: width,
                h: height,
            },
            spriteSourceSize: {
                x: 0,
                y: 0,
                w: width,
                h: height,
            },
            anchor: {
                x: width / 2,
                y: height / 2,
            },
        };
    }

    async processImages(): Promise<[number, number]> {
        const prList: Promise<HTMLImageElement>[] = [];

        for(const {name, url} of this.textures) {
            const img = new Image();
            img.alt = name;
            img.src = url;

            prList.push(new Promise(res => {
                img.onload = function() {
                    res(img);
                };
            }));
        }

        var width = 0;
        var height = 0;
        const images: HTMLImageElement[] = await Promise.all(prList);
        for(const img of images) {
            width += img.width;
            height += img.height;
            this.processedImages[img.alt] = img;
        }

        return [width, height];
    }
}