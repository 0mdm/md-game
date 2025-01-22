import { AnimatedSprite, AnimatedSpriteOptions, Sprite, Texture } from "pixi.js";
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
    character: string;
    onTouch?: (e: BaseObject) => void;
    customSprite?: AnimatedSprite;
}

export class BaseObject {
    character: string;
    pos: BoxBound;
    sprite: Sprite | AnimatedSprite;
    id: number;

    onTouch: (o: BaseObject) => void = () => undefined;

    constructor(o: BaseObjectOpts) {
        this.character = o.character;
        this.pos = BaseObject.generateBounds(o.x, o.y, o.width, o.height);

        if(o.customSprite) {
            this.sprite = o.customSprite;
        } else this.sprite = new Sprite(o.texture);

        this.id = idCounter++;

        this.sprite.anchor.set(.5);
        this.sprite.position.set(this.pos.x + this.pos.width / 2, this.pos.y + this.pos.height / 2);
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

    destroy(): void {
        this.id = NaN;
        this.character = " ";
        this.onTouch = () => undefined;
        this.sprite.destroy();
    }

    kill() {}

    hurt(dmg: number) {}
}