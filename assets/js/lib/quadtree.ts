import {Container, Sprite, Texture} from "pixi.js";
import { Player, QuadtreeBox } from "./objects";
import { app } from "../main/app";
import { sp } from "./util";

var idCounter: number = 0;
var debugContainer: Container;

export function setQuadreeDebug(e: Container) {
    debugContainer = e;
}

function isColliding(q: Quadtree | QuadtreeBox| BaseObject, o: Quadtree | BaseObject | QuadtreeBox): boolean {
    return q.x < o.maxX 
    && q.maxX > o.x 
    && q.y < o.maxY
    && q.maxY > o.y;
}

function isDevColliding(q: Quadtree, o: BaseObject | QuadtreeBox) {
    const a = q.x < o.maxX;
    const b = q.maxX > o.x;
    const c = q.y < o.maxY
    const d = q.maxY > o.y;

    console.log("qy: " + q.y, "\no maxY: " + o.maxY, q.y < o.maxY);
}

interface BaseObjectOpts {
    x: number;
    y: number;
    width: number;
    height: number;
    sprite: Sprite;
    onTouch?: (e?: Player) => void;
}

export class BaseObject {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
    sprite: Sprite;
    id: number;
    onTouch?: (e?: Player) => void;

    constructor(o: BaseObjectOpts) {
        this.x = o.x;
        this.y = o.y;
        this.width = o.width;
        this.height = o.height;
        this.maxX = this.x + this.width;
        this.maxY = this.y + this.height;
        this.sprite = o.sprite;
        this.id = idCounter++;
        this.onTouch = o.onTouch;
    }
}

export class StaticObject extends BaseObject {
    constructor(o: BaseObjectOpts) {
        super(o);
    }
}

export class Quadtree {
    nodes: Quadtree[] = [];
    children: BaseObject[] = [];
    isDivided: boolean = false;
    x: number;
    y: number;
    width: number;
    height: number;
    halfW: number;
    halfH: number;
    maxX: number;
    maxY: number;
    minSize: number = 16;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxX = this.x + this.width;
        this.maxY = this.y + this.height;
        this.halfW = width / 2;
        this.halfH = height / 2;

        if(this.width % 2 != 0) throw new Error("quadtree.ts: can't divided by 2: " + this.width % 2);

        const size = 2048 / 32;
        if(this.width == size) {
            const s = new Sprite(Texture.WHITE);
            s.tint = Math.random() * 0xffffff;
            s.anchor.set(0, 0);
            // innerWidth: 874
            s.position.set(this.x, this.y);
            s.width = this.width;
            s.height = this.height;

            s.zIndex = -1;

            debugContainer.addChild(s);
        }

        if(this.width > this.minSize) this.subdivide();
    }

    subdivide() {
        this.isDivided = true;
        const nw = new Quadtree(this.x, this.y, this.halfW, this.halfH);
        const ne = new Quadtree(this.x + this.halfW, this.y, this.halfW, this.halfH);
        const se = new Quadtree(this.x + this.halfW, this.y + this.halfH, this.halfW, this.halfH);
        const sw = new Quadtree(this.x, this.y + this.halfH, this.halfW, this.halfH);

        this.nodes.push(nw, ne, se, sw);
    }

    insert(obj: BaseObject): boolean {
        if(obj.width > this.width
        || obj.height > this.height) return false;

        if(isColliding(this, obj)) {
            if(this.isDivided) {
                // parent
                for(const node of this.nodes)
                    if(node.insert(obj)) return true;
                
                this.children.push(obj);
                return true;
            } else {
                // leaf
                this.children.push(obj);
                return true;
            }
        }

        return false;
    }

    once = false;

    find(e: QuadtreeBox, a?: Player): false | BaseObject[] {
        if(isColliding(this, e)) {
            if(this.isDivided) {
                for(const node of this.nodes) {
                    const result = node.find(e, a);
                    if(result) return result;
                }

                /*if(e.width > this.width) {
                    const collisions = [];
                    for(const node of this.nodes) {
                        for(const box of node.children) {
                            if(isColliding(e, box)) collisions.push(box);
                        }
                    }

                    console.log(collisions)

                    if(collisions.length == 0) return false;
                    return collisions;
                }*/
            } else {
                /*if(this.children.length == 0) {
                    const collisions: BaseObject[] = [];
                    for(const node of this.nodes) {
                        for(const box of node.children) {
                            if(isColliding(e, box)) collisions.push(box);
                        }
                    }

                    if(collisions.length == 0) return false;
                    return collisions;
                }*/
                if(this.children.length == 0) return false;

                for(const boxes of this.children)
                    boxes.onTouch?.(a);
                
                return this.children;
            }
        }

        return false;
    }
}