import { SpritesheetData } from "pixi.js";

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

    constructor(textures: TextureMesh[]) {
        const ctx = this.c.getContext("2d");
        if(ctx == undefined) throw new Error(
            "pack-textures.ts: ctx is undefined"
        );

        this.ctx = ctx;

        this.textures = textures;
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