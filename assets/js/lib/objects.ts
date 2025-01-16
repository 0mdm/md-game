import { Container, measureHtmlText, ObservablePoint, Sprite, squaredDistanceToLineSegment, Texture, v8_0_0 } from "pixi.js";
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

var spawnX = 0;
var spawnY = 0;

export function setSpawn(x: number, y: number) {
    spawnX = x;
    spawnY = y;
}

export class Player {
    worldContainer: Container;
    jumpIntensity = 1.5;
    currentGravity = 0;
    gravity = 0.2; // pixels per frame
    gravityEnabled = true;
    jumpTime = 0;
    jumpTimeLimit = 20;
    vertVelocity = 0;
    vertVelocityLimit = -5;
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
        y: halfHeight + halfHeight / 4 + 3,
        width: 16,
        height: 7,
        maxX: halfWidth - 16,
        maxY: halfHeight + 7,
    };

    events: ((self: this) => void)[] = [];

    getTree: () => Quadtree;

    onJumpStart: () => void = () => undefined;

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

    tp(x: number, y: number) {
        const dx = x - this.pos.x;
        const dy = y - this.pos.y;

        this.updatePos(dx, dy);
        this.updateSpritePos(dx, dy);
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

    seperateY(o: BaseObject, vDown: number, deltaTime: number) {
        if(this.pos.y < o.y) {
            // floor
            const fNormal = this.pos.maxY - o.y + vDown;
            this.moveUp(fNormal);
            this.jumpTime = 0;
            this.vertVelocity = 0;
            this.currentGravity = 0;
        } else {
            // ceiling
            const fNormal = this.pos.y - o.maxY + vDown;
            this.vertVelocity = -this.gravity;
            this.moveUp(fNormal + this.vertVelocity * deltaTime);
            this.jumpTime = this.jumpTimeLimit;
            this.currentGravity = this.gravity;
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

    updateSpriteX(x: number) {
        this.worldContainer.position.x -= x;
    }

    updateSpriteY(y: number) {
        this.worldContainer.position.y -= y;
    }

    updateSpritePos(x: number, y: number) {
        this.updateSpriteX(x);
        this.updateSpriteY(y);
    }

    tick(deltaTime: number) {
        const tree = this.getTree();

        for(const event of this.events) {
            this.events.shift();
            event(this);
        }

        if(this.gravityEnabled && (this.vertVelocity * deltaTime > this.vertVelocityLimit)) {
            this.vertVelocity -= this.currentGravity * deltaTime;
            if(this.vertVelocity < this.vertVelocityLimit) this.vertVelocity = this.vertVelocityLimit;
        }

        this.handleY(tree, deltaTime);
        this.updatePos(this.vx, this.vy);
        this.updateSpritePos(this.vx, this.vy);
        this.vy = 0;
        this.vx = 0;

        this.handleX(tree);
        this.updateX(this.vx);
        this.updateSpriteX(this.vx);
        this.vx = 0;
    }

    handleX(tree: Quadtree) {
        const collidedX: BaseObject[] | false = tree.find(this.sidePos, this);
        if(collidedX) {
            this.seperateX(collidedX[0]);
        } else {
            this.canMove.right = true;
            this.canMove.left = true;
        }
    }

    handleY(tree: Quadtree, deltaTime: number) {
        const vDown = -this.vertVelocity * deltaTime;
        this.moveDown(vDown);
        this.updateY(this.vy);
        this.updateSpriteY(this.vy);

        const collidedY: BaseObject[] | false = tree.find(this.pos, this);
        if(collidedY) {
            this.seperateY(collidedY[0], vDown, deltaTime);
            //this.playerSprite.tint = 0x00fffff;
        } else {
            //this.playerSprite.tint = 0xffffff; 
        }

    }

    jump(deltaTime: number) {
        if(this.jumpTime == 0) this.onJumpStart();

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

    kill() {
        this.events.push(self => self.tp(spawnX, spawnY));
    }
}
