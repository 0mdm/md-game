import { GameObject } from "./objects";

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

const octreeMinSize = 8;

function alertErr(msg: string): never {
    alert("Octree: " + msg);
    throw new Error("Octree: " + msg);
}

function AABB(a: Octree, b: GameObject): boolean {
    return a.x <= b.sprite.bounds.maxX
    && a.maxX >= b.sprite.x 
    && a.y <= b.sprite.bounds.maxY 
    && a.y >= b.sprite.y
}

class Octree {
    children: Octree[] = [];
    isLeaf = false;
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number
    storedObjects = [];

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
        }
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

        const o1 = new Octree(q1, false);
        const o2 = new Octree(q2, false);
        const o3 = new Octree(q3, false);
        const o4 = new Octree(q4, false);

        this.children = [o1, o2, o3, o4];
    }

    get(o: GameObject): boolean {
        const found: boolean = AABB(this, o);

        if(found) {
            if(this.isLeaf) return true;

            for(const tree of this.children)
                if(tree.get(o)) return true;

            if(o.isOversized) return true;

            return false;
        } else {
            return false;
        }
    }

    insert(object: GameObject) {
        
    }
}