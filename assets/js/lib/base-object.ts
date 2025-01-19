import { Sprite, Texture } from "pixi.js";
import { DynamicObj, DynamicObjOpts } from "./dynamic-object";

var idCounter = 0;

export interface BoxBound {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
}

export interface BaseObjectOpts {
    x: number;
    y: number;
    width: number;
    height: number;
    texture: Texture;
    onTouch?: (e: BaseObject) => void;
}

export class BaseObject {
    pos: BoxBound;
    sprite: Sprite;
    id: number;

    onTouch: (o: BaseObject) => void = () => undefined;

    constructor(o: BaseObjectOpts) {
        this.pos = BaseObject.generateBounds(o.x, o.y, o.width, o.height);
        this.sprite = new Sprite(o.texture);
        this.id = idCounter++;

        this.sprite.position.set(this.pos.x, this.pos.y);
        this.sprite.width = this.pos.width;
        this.sprite.height = this.pos.height;

        if(o.onTouch) this.onTouch = o.onTouch;
    }

    static generateBounds(x: number, y: number, width: number, height: number): BoxBound {
        return {
            x,
            y,
            width,
            height,
            maxX: x + width,
            maxY: y + height,
        };
    }

    kill() {}

    hurt(dmg: number) {}
}