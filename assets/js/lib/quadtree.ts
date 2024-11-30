import { PointData, Sprite, Texture } from "pixi.js";
import { GameObject, QuadtreeBox } from "./objects";
import { app } from "../main/app";

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

const octreeMinSize = 8;

function alertErr(msg: string): never {
    throw new Error("Octree: " + msg);
}

function AABB(a: Quadtree, b: QuadtreeBox): boolean {
    if(b.x == 16) {
        console.log(a.x <= b.maxX);
        console.log(a.maxX >= b.x);
        console.log(a.y <= b.maxY);
        console.log(a.maxY >= b.y)
        console.log("\n")
    }

    return a.x <= b.maxX
    && a.maxX >= b.x 
    && a.y <= b.maxY 
    && a.maxY >= b.y
}

export class Quadtree {
    children: Quadtree[] = [];
    isLeaf = false;
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number
    storedObjects: GameObject[] = [];

    constructor(b: Bounds, isParent: boolean = true) {
        this.x = b.x;
        this.y = b.y;
        this.width = b.width;
        this.maxX = b.x + b.width;
        this.height = b.height;
        this.maxY = b.y + b.height;

        if(isParent) this.checkForErrors();

        if(this.width > octreeMinSize) {
            this.split();
        } else {
            this.isLeaf = true;
            this.addDebugSquare();
        }
    }

    addDebugSquare() {
        const s = new Sprite(Texture.WHITE);
        s.position.set(this.x, this.y);
        s.width = this.width;
        s.height = this.height;
        app.stage.addChild(s);
    }

    checkForErrors() {
        if(this.width != this.height) alertErr(`Width isn't equal to height: ${this.width}, ${this.height}`);
        if(this.width % octreeMinSize != 0) alertErr("Octree isn't divisible");
        if(this.width <= 1) alertErr("Width and height are too small");
    }

    split() {
        // half bounds
        const hw = this.width / 2;
        const hh = this.height / 2;

        const q1: Bounds = {
            x: this.x,
            y: this.x,
            width: hw,
            height: hh,
        };
        const q2: Bounds = {
            x: this.x + hw,
            y: this.y,
            width: hw,
            height: hh,
        };
        const q3: Bounds = {
            x: this.x + hw,
            y: this.y + hh,
            width: hw,
            height: hh,
        };
        const q4: Bounds = {
            x: this.x,
            y: this.y + hh,
            width: hw,
            height: hh,
        };

        const o1 = new Quadtree(q1, false);
        const o2 = new Quadtree(q2, false);
        const o3 = new Quadtree(q3, false);
        const o4 = new Quadtree(q4, false);

        this.children = [o1, o2, o3, o4];
    }

    checkForBlocks(o: QuadtreeBox): boolean {
        const found: boolean = AABB(this, o);

        if(found) {
            if(this.isLeaf) return true;

            for(const tree of this.children)
                if(tree.checkForBlocks(o)) return true;

            if(o.width > octreeMinSize) return true;

            return false;
        } else {
            return false;
        }
    }

    insert(o: GameObject): boolean {
        const isInside = AABB(this, o.getQuadtreeBounds());
        if(isInside) {
            if(this.isLeaf) {
                this.storedObjects.push(o);
                return true;
            }

            for(const trees of this.children) 
                if(trees.insert(o)) return true;
        }

        return false;
    }
}