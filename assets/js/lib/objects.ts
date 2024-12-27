import { Container, ObservablePoint, Sprite, squaredDistanceToLineSegment, Texture } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";
import { BaseObject, Quadtree } from "./quadtree";

export interface QuadtreeBox {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
}

export interface PlayerOpts {
    texture: Texture;
    worldContainer: Container;
    getTree: () => Quadtree;
}

export class Player {
    worldContainer: Container;
    jumpIntensity = 0;
    jumpIntensityMax = 2;
    currentGravity = 0;
    gravity = 0.02; // pixels per frame
    gravityEnabled = true;
    jumpTime = 0;
    jumpTimeLimit = 40;
    vertVelocity = 0;
    playerSprite: Sprite;
    pos: QuadtreeBox = {
        x: halfWidth,
        y: halfHeight / 2,
        width: 16,
        height: 16,
        maxX: halfWidth - 16,
        maxY: halfHeight + 16,
    };
    sidePos: QuadtreeBox = {
        x: halfWidth,
        y: halfHeight / 2 + 2,
        width: 16,
        height: 10,
        maxX: halfWidth - 16,
        maxY: halfHeight + 10,
    };
    getTree: () => Quadtree;

    constructor(o: PlayerOpts) {
        this.playerSprite = new Sprite(o.texture);
        this.playerSprite.width = this.pos.width;
        this.playerSprite.height = this.pos.height;
        this.playerSprite.anchor.set(0, 0);
        this.playerSprite.position.set(this.pos.x, this.pos.y);
        this.playerSprite.zIndex = 2;
        this.worldContainer = o.worldContainer;
        this.getTree = o.getTree;

        app.stage.addChild(this.playerSprite);
    }

    enableGravity() {
        this.gravityEnabled = true;
    }

    disableGravity() {
        this.gravityEnabled = false;
    }

    calculateOverlapX(o: BaseObject): number {
        return Math.max(0, Math.min(this.pos.maxX, o.maxX) - Math.max(this.pos.x, o.x))
    }
      
    calculateOverlapY(o: BaseObject): number {
        return Math.max(0, Math.min(this.pos.y, o.y) - Math.max(this.pos.maxY, o.maxY));
    }

    seperateX(o: BaseObject) {
        const overlapX = this.calculateOverlapX(o);
        this.moveRight(this.pos.x < o.x ? -overlapX : overlapX);
    }


    seperateY(o: BaseObject) {
        const overlapY = this.calculateOverlapY(o);
        this.moveUp(this.pos.y > o.y ? overlapY : -overlapY);
        
        if(this.pos.y > o.y && this.vertVelocity > 0) {
            this.vertVelocity = 0;
        } else if(this.vertVelocity < 0) {
            this.vertVelocity = 0;
        }
    }

    debugHighlight(arr: BaseObject[]) {
        for(const o of arr) {
            o.sprite.tint = 0xfff000;
        }
    }

    tick() {
        this.pos.maxX = this.pos.x + this.pos.width;
        this.pos.maxY = this.pos.y + this.pos.height;
        this.sidePos.maxX = this.sidePos.x + this.sidePos.width;
        this.sidePos.maxY = this.sidePos.y + this.sidePos.height;

        if(this.gravityEnabled) {
            this.vertVelocity -= this.currentGravity;
            this.handleCollision();
        }
    }

    handleCollision() {
        const tree = this.getTree();

        const collidedY: BaseObject[] | false = tree.find(this.pos);
        if(collidedY) {
            this.jumpTime = 0;
            this.seperateY(collidedY[0]);
            this.debugHighlight(collidedY);
        }

        const collidedX: BaseObject[] | false = tree.find(this.sidePos);
        if(collidedX) this.seperateX(collidedX[0]);

        this.moveDown(-this.vertVelocity);
    }

    jump() {
        if(this.jumpTime < this.jumpTimeLimit) {
            this.currentGravity = 0;
            this.jumpTime++;
            this.vertVelocity = 1.5;
            if(this.jumpIntensity < this.jumpIntensityMax) {
                this.vertVelocity = this.jumpIntensityMax / 2;
            } else {
                this.vertVelocity = this.jumpIntensityMax;
            }
        } else {
            this.jumpEnd();
        }
    }

    jumpEnd() {
        this.jumpTime = this.jumpTimeLimit;
        this.currentGravity = this.gravity;
        this.jumpIntensity = 0;
    }

    moveDown(s: number) {
        this.pos.y += s;
        this.sidePos.y += s;
        this.worldContainer.position.y -= s;
    }

    moveUp(s: number) {
        this.pos.y -= s;
        this.sidePos.y -= s;
        this.worldContainer.position.y += s;
    }

    moveLeft(s: number) {
        this.worldContainer.position.x += s;
        this.sidePos.x -= s;
        this.pos.x -= s;
    }

    moveRight(s: number) {
        this.worldContainer.position.x -= s;
        this.sidePos.x += s;
        this.pos.x += s;
    }
}
/*
export class GameObject {
    sprite: Sprite;
    isOversized = false;

    constructor(sprite: Sprite) {
        this.sprite = sprite;
    }

    getQuadtreeBounds(): QuadtreeBox {
        return {
            x: this.sprite.position.x,
            y: this.sprite.position.y,
            width: this.sprite.width,
            height: this.sprite.height,
            maxX: this.sprite.bounds.maxX,
            maxY: this.sprite.bounds.maxY,
        };
    }
}*/