import { Container, Mesh, MeshGeometry, SpritesheetData, Texture } from "pixi.js";
import { Map2D } from "./keymap";

interface UVdataOpts {
    u: number;
    v: number;
    maxU: number;
    maxV: number;
}

var uvDataWasSet = false;
const uvData: {[name: string]: UVdataOpts} = {};

export class Chunk {
    atlas: Texture;
    blockSize: number;
    all: Container = new Container();
    platform: Container = new Container();
    map: Map2D<string> = new Map2D<string>();
    uvScaleX: number;
    uvScaleY: number;
    chunkSize: number;
    isGreedyMeshed: boolean = false;

    static setGlobalUV(data: SpritesheetData, totalW: number, totalH: number) {
        uvDataWasSet = true;
        for(const name in data.frames) {
            const pos = data.frames[name].frame;

            uvData[name] = {
                u: pos.x / totalW,
                v: pos.y / totalH,
                maxU: (pos.x + pos.w) / totalW,
                maxV: (pos.y + pos.h) / totalH,
            };
        }
    }

    constructor(atlas: Texture, blockSize: number, chunkSize: number) {
        if(!uvDataWasSet) throw new Error(
            "chunks.ts: uv data wasn't set"
        );

        this.atlas = atlas;
        this.chunkSize = chunkSize;
        this.blockSize = blockSize;
        this.all.addChild(this.platform);
        this.uvScaleX = blockSize / atlas.width;
        this.uvScaleY = blockSize / atlas.height;
    }

    placePlatformBlock(coord: string, type: string): void {
        this.map.set(coord, type);
    }

    greedyMeshPlatform(ox: number, oy: number) {
        if(this.isGreedyMeshed) throw new Error(
            "chunk.ts: chunk was already greedy meshed"
        );

        const positions: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        var indexCount: number = 0;
        var count: number = 0;
        this.map.forEach((coord: string, type: string) => {
            if(uvData[type] == undefined) throw new Error(
                "chunks.ts: " + `"${type}" wasn't found in UV data`
            );
            // individual blocks

            count++;
            // it breaks at 20 if not using uv map
            //if(count > 20) return;

            var [x, y] = Map2D.getFromCoord(coord);
            addUV(x, y, type);

            x *= this.blockSize;
            y *= this.blockSize;
            x += ox;
            y += oy;

            const maxX = x + this.blockSize;
            const maxY = y + this.blockSize;

            add(x, y, maxX, maxY);
        });

        function add(x: number, y: number, maxX: number, maxY: number) {
            indices.push(indexCount, indexCount + 1, indexCount + 2, indexCount, indexCount + 2, indexCount + 3);
            positions.push(x, y, maxX, y, maxX, maxY, x, maxY);
            indexCount += 4;
        }

        function addUV(x: number, y: number, type: string) {
            /*const u = x * scaleX;
            const v = y * scaleY;
            const uu = (x + self.blockSize * sizeScale) * scaleX;
            const vv = (y + self.blockSize * sizeScale) * scaleY;*/

            const {u, v, maxU, maxV} = uvData[type];

            // top left, top right, bottom right, bottom left
            uvs.push(u, v, maxU, v, maxU, maxV, u, maxV);
            /*uvs.push(
                0, 0,
                1, 0,
                1, 1,
                0, 1,
            );*/
        }

        const geometry = new MeshGeometry({
            indices: new Uint32Array(indices),
            positions: new Float32Array(positions),
            uvs: new Float32Array(uvs),
        });

        const m = new Mesh({
            texture: this.atlas,
            geometry,
        });

        m.position.set(ox, oy);
        this.isGreedyMeshed = true;

        this.platform.addChild(m);
    }
}