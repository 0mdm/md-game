import {Container, Sprite} from "pixi.js";
import { QuadtreeBox } from "./objects";

var idCounter: number = 0;

function isColliding(q: Quadtree, o: BaseObject | QuadtreeBox): boolean {
    return q.x < o.maxX 
    && q.maxX > o.x 
    && q.y < o.y + o.maxX
    && q.maxY > o.y;
}

interface BaseObjectOpts {
    x: number;
    y: number;
    width: number;
    height: number;
    sprite: Sprite;
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

    constructor(o: BaseObjectOpts) {
        this.x = o.x;
        this.y = o.y;
        this.width = o.width;
        this.height = o.height;
        this.maxX = this.x + this.width;
        this.maxY = this.y + this.height;
        this.sprite = o.sprite;
        this.id = idCounter++;
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

    find(e: QuadtreeBox): false | BaseObject[] {
        if(isColliding(this, e)) {
            if(this.isDivided) {
                for(const node of this.nodes) return node.find(e);
            } else {
                if(this.children.length == 0) return false;
                return this.children;
            }
        }

        return false;
    }
}