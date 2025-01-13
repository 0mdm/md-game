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
    jumpIntensity = 2.5;
    currentGravity = 0;
    gravity = 0.2; // pixels per frame
    gravityEnabled = true;
    jumpTime = 0;
    jumpTimeLimit = 20;
    vertVelocity = 0;
    vx: number = 0;
    vy: number = 0;
    playerSprite: Sprite;
    canMove = {
        left: true,
        right: true,
    };
    pos: QuadtreeBox = {
        x: halfWidth,
        y: halfHeight + halfHeight / 4,
        width: 16,
        height: 16,
        maxX: halfWidth - 16,
        maxY: halfHeight + 16,
    };
    sidePos: QuadtreeBox = {
        x: halfWidth,
        y: halfHeight + halfHeight / 4 + 2,
        width: 16,
        height: 7,
        maxX: halfWidth - 16,
        maxY: halfHeight + 7,
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

    hide() {
        this.playerSprite.visible = false;
    }

    show() {
        this.playerSprite.visible = true;
    }

    enableGravity() {
        this.gravityEnabled = true;
    }

    disableGravity() {
        this.gravityEnabled = false;
    }

    tpX(x: number) {
        this.vx = x - this.pos.maxX;
    }

    seperateX(o: BaseObject) {
        if(this.pos.x < o.x) {
            // right
            this.canMove.right = false;
            this.vx = o.x - this.pos.maxX;
        } else {
            // left
            this.canMove.left = false;
            this.vx = o.maxX - this.pos.x;
        }

    }

    seperateY(o: BaseObject, deltaTime: number) {
        if(this.pos.y < o.y) {
            // floor
            this.moveUp((this.pos.maxY - o.y) / deltaTime);
        } else {
            // ceiling
            this.moveUp((this.pos.y - o.maxY));
        }

        if(this.pos.y > o.y && this.vertVelocity > 0) {
            // hit head
            this.jumpTime = this.jumpTimeLimit;
            this.vertVelocity = this.gravity;
            this.currentGravity = this.gravity;
        } else if(this.pos.y < o.y && this.vertVelocity < 0) {
            // standing on ground or touching side
            this.jumpTime = 0;
            this.vertVelocity = 0;
        }
    }

    debugHighlight(arr: BaseObject[]) {
        for(const o of arr) {
            o.sprite.tint = 0xfff000;
        }
    }

    updateX(x: number) {
        this.pos.x += x;
        this.sidePos.x += x;
        this.pos.maxX = this.pos.x + this.pos.width;
        this.sidePos.maxX = this.sidePos.x + this.sidePos.width;
    }

    updateY(y: number) {
        this.pos.y += y;
        this.sidePos.y += y;
        this.pos.maxY = this.pos.y + this.pos.height;
        this.sidePos.maxY = this.sidePos.y + this.sidePos.height;
    }

    updatePos(x: number, y: number) {
        this.updateX(x);
        this.updateY(y);
    }

    updateSpritePos() {
        this.worldContainer.position.x -= this.vx;
        this.worldContainer.position.y -= this.vy;
    }

    tick(deltaTime: number) {
        const tree = this.getTree();

        if(this.gravityEnabled) {
            this.vertVelocity -= this.currentGravity * deltaTime;
        }

        this.handleY(tree, deltaTime);
        this.updatePos(this.vx, this.vy);
        this.updateSpritePos();
        this.vx = 0;
        this.vy = 0;
        this.handleX(tree);
        this.updatePos(this.vx, this.vy);
        this.updateSpritePos();
        this.vx = 0;
        this.vy = 0;
    }

    handleX(tree: Quadtree) {
        const collidedX: BaseObject[] | false = tree.find(this.sidePos);
        if(collidedX) {
            this.seperateX(collidedX[0]);
        } else {
            this.canMove.right = true;
            this.canMove.left = true;
        }
    }

    handleY(tree: Quadtree, deltaTime: number) {
        const collidedY: BaseObject[] | false = tree.find(this.pos);
        if(collidedY) {
            this.seperateY(collidedY[0], deltaTime);
        }

        this.moveDown(-this.vertVelocity * deltaTime);
    }

    jump(deltaTime: number) {
        if(this.jumpTime < this.jumpTimeLimit) {
            this.currentGravity = 0;
            this.jumpTime += deltaTime;
            this.vertVelocity = this.jumpIntensity;
        } else {
            this.jumpEnd();
        }
    }

    jumpEnd() {
        this.jumpTime = this.jumpTimeLimit;
        this.currentGravity = this.gravity;
    }

    moveDown(s: number) {
        this.vy += s;
    }

    moveUp(s: number) {
        this.vy -= s;
    }

    moveLeft(s: number) {
        if(!this.canMove.left) return;
        this.vx -= s;
    }

    moveRight(s: number) {
        if(!this.canMove.right) return;
        this.vx += s;
    }

    disable() {
        this.disableGravity();
        this.hide();
    }

    enable() {
        this.enableGravity();
        this.show();
    }
}
