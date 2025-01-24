import { blockSize } from "./quadtree";

export class Keymap {
    keys: {[index: string]: (x: number, y: number) => void} = {};

    run(txt: string) {
        const txtArr: string[] = txt.split("\n");  
        const yMax = txtArr.length;

        for(let y = 0; y != yMax; y++) {
            let x = 0;
            // It starts from the top to the bottom
            const actualY = yMax-y;

            // Horizontal slice
            const hSlice = txtArr[y];
            for(const char of hSlice) {
                x++;
                this.keys[char]?.(x, y);
            }
        }
    }

    key(char: string, f: (x: number, y: number) => void) {
        this.keys[char] = f;
    }

    static async buildString(endX: number, endY: number, f: (x: number, y: number) => string | undefined): Promise<string> {
        const final: string[] = [];

        const prArr: Promise<void>[] = [];

        for(let y = 0; y < endY; y++) prArr.push(
            new Promise(res => {
                setTimeout(() => {
                    findY(y);
                    res();
                });
            }),
        );

        function findY(y: number) {
            const yLayer: string[] = [];
    
            for(let x = 0; x < endX; x++) {
                const char = f(x, y) || " ";
                yLayer.push(char);
            }
    
            final.push(yLayer.join(""));
        }

        const finalPr = Promise.all(prArr);
        await finalPr;

        return final.join("\n");
    }
}

export class Map2D<T> {
    map: {[coord: string]: T} = {};

    constructor() {}

    static coord(x: number, y: number): string {
        return `${x},${y}`;
    }

    private getFromCoord(str: string): [x: number, y: number] {
        return str.split(",").map(n => Number(n)) as [number, number];
    }

    set(coord: string, t: T) {
        this.map[coord] = t;
    }

    forEach(f: (t: T) => void) {
        for(const i in this.map) f(this.map[i]);
    }

    radius(x: number, y: number, rx: number, ry: number, size: number, f: (coord: string, t: T) => void) {
        for(let dx = -rx; dx <= rx; dx++) {
            for(let dy = -ry; dy <= ry; dy++) {
                //if(dx === 0 && dy === 0) continue;
                const coord: string = Map2D.coord(x + dx * size, y + dy * size);
                const res = this.map[coord];
                if(res == undefined) continue;

                f(coord, res);
           }
        }
    }
}