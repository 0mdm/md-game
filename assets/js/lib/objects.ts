import { Container, measureHtmlText, ObservablePoint, Sprite, squaredDistanceToLineSegment, Texture, v8_0_0 } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";
import { BaseObject, Quadtree } from "./quadtree";
import { DynamicObj, DynamicObjOpts } from "./dynamic-object";

export interface QuadtreeBox {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
}

export interface PlayerOpts extends Partial<DynamicObjOpts> {
    worldContainer: Container;
    texture: Texture;
    getTree: () => Quadtree;
}

var spawnX = 0;
var spawnY = 0;

export function setSpawn(x: number, y: number) {
    spawnX = x;
    spawnY = y;
}

export class Player extends DynamicObj {
    worldContainer: Container;

    constructor(o: PlayerOpts) {
        const opts: DynamicObjOpts = {
            x: halfWidth,
            y: halfHeight,
            width: 16,
            height: 16,
            heightX: 7,
            texture: o.texture,
            getTree: o.getTree,
        };

        super(opts);
        this.worldContainer = o.worldContainer;
    }

    override updateSpriteX(x: number): void {
        this.worldContainer.position.x -= x;
    }

    override updateSpriteY(y: number): void {
        this.worldContainer.position.y -= y;
    }

    override kill() {
        this.events.push(self => self.tp(spawnX, spawnY));
    }
}