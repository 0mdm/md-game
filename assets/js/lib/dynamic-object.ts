import { Sprite, Texture } from "pixi.js";
import { QuadtreeBox } from "./objects";
import { BaseObject, Quadtree } from "./quadtree";
import { app } from "../main/app";

export interface DynamicObjOpts {
    x: number;
    y: number;
    width: number;
    height: number;
    heightX: number
    offsetHeightX: number;
    texture: Texture;
    hpMax?: number;
    getTree: () => Quadtree;
}

export class DynamicObj {
    jumpIntensity = 1.5;
    currentGravity = 0;
    gravity = 0.2;
    gravityEnabled = true;
    jumpTime = 0;
    jumpTimeLimit = 20;
    fg = 0;
    fgmax = -5;
    sprite: Sprite;
    vy: number = 0;
    vx: number = 0;
    hp: number;
    hpMax: number = 10;
    invincibilityTimer: number = 0;
    invincible: boolean = false;

    pos: QuadtreeBox;
    sidePos: QuadtreeBox;

    getTree: () => Quadtree;

    events: ((self: this) => void)[] = [];

    onJumpStart: () => void = () => undefined;

    constructor(o: DynamicObjOpts) {
        this.pos = DynamicObj.generateBounds(o.x, o.y, o.width, o.height);
        this.sidePos = DynamicObj.generateBounds(o.x, o.y + o.offsetHeightX, o.width, o.heightX);
        this.sprite = new Sprite(o.texture);
        this.sprite.width = o.width;
        this.sprite.height = o.height;
        this.sprite.anchor.set(0);
        this.sprite.position.set(this.pos.x, this.pos.y);
        this.sprite.zIndex = 2;
        this.getTree = o.getTree;

        if(o.hpMax) this.hpMax = o.hpMax;
        this.hp = this.hpMax;
        app.stage.addChild(this.sprite);
    }

    static generateBounds(x: number, y: number, width: number, height: number): QuadtreeBox {
        return {
            x,
            y,
            width,
            height,
            maxX: x - width,
            maxY: y + height,
        };
    }

    disable() {
        this.gravityEnabled = false;
        this.sprite.visible = false;
    }

    enable() {
        this.gravityEnabled = true;
        this.sprite.visible = true;
    }

    tp(x: number, y: number) {
        const dx = x - this.pos.x;
        const dy = y - this.pos.y;

        this.updatePos(dx, dy);
        this.updateSpritePos(dx, dy);
    }

    updatePos(x: number, y: number) {
        this.updateX(x);
        this.updateY(y);
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

    seperateX(o: BaseObject) {
        if(this.pos.x < o.x) {
            // right
            const vx = o.x - this.pos.maxX;

            this.moveRight(vx);
        } else {
            // left
            const vx = o.maxX - this.pos.x;

            this.moveRight(vx);
        }
    
    }
    
    seperateY(o: BaseObject, vDown: number, deltaTime: number) {
        if(this.pos.y < o.y) {
            // floor
            const fNormal = this.pos.maxY - o.y + vDown;
            this.moveUp(fNormal);
            this.jumpTime = 0;
            this.fg = 0;
            this.currentGravity = 0;
        } else {
            // ceiling
            const fNormal = this.pos.y - o.maxY + vDown;
            this.fg = -this.gravity;
            this.moveUp(fNormal + this.fg * deltaTime);
            this.jumpTime = this.jumpTimeLimit;
            this.currentGravity = this.gravity;
        }
    }

    updateSprite() {
        this.sprite.position.x = this.pos.x;
        this.sprite.position.y = this.pos.y;
    }

    moveUp(y: number) {
        this.vy -= y;
    }

    moveDown(y: number) {
        this.vy += y;
    }

    moveRight(x: number) {
        this.vx += x;
    }

    moveLeft(x: number) {
        this.vx -= x;
    }

    updateSpriteY(y: number) {
        this.sprite.position.y += y;
    }

    updateSpriteX(x: number) {
        this.sprite.position.x += x; 
    }

    updateSpritePos(x: number, y: number) {
        this.updateSpriteX(x);
        this.updateSpriteY(y);
    }

    detectCollisionX(tree: Quadtree) {
        const collidedX: BaseObject[] | false = tree.find(this.sidePos, this);
        if(collidedX)
            this.seperateX(collidedX[0]);
    }

    detectCollisionY(tree: Quadtree, deltaTime: number) {
        const vDown = -this.fg * deltaTime;
        this.moveDown(vDown);
        this.updateY(this.vy);
        this.updateSpriteY(this.vy);

        const collidedY: BaseObject[] | false = tree.find(this.pos, this);
        if(collidedY) {
            this.seperateY(collidedY[0], vDown, deltaTime);
            //this.sprite.tint = 0x00fffff;
        } else {
            //this.sprite.tint = 0xffffff; 
        }

    }

    tick(deltaTime: number) {
        const tree = this.getTree();

        for(const event of this.events) {
            this.events.shift();
            event(this);
        }

        if(this.gravityEnabled && (this.fg * deltaTime > this.fgmax)) {
            this.fg -= this.currentGravity * deltaTime;
            if(this.fg < this.fgmax) this.fg = this.fgmax;
        }

        this.detectCollisionY(tree, deltaTime);
        this.updatePos(this.vx, this.vy);
        this.updateSpritePos(this.vx, this.vy);
        this.vx = 0;
        this.vy = 0;

        this.detectCollisionX(tree);
        this.updateX(this.vx);
        this.updateSpriteX(this.vx);
        this.vx = 0;

        if(this.invincible) {
            console.log(this.invincibilityTimer)
            if(this.invincibilityTimer > 0) {
                this.invincibilityTimer -= deltaTime;

                if(Math.floor(this.invincibilityTimer) % 2 == 0) {
                    this.sprite.tint = 0x00ffff;
                } else {
                    this.sprite.tint = 0xffffff;
                }
            } else {
                this.invincible = false
                this.invincibilityTimer = 0;
                this.sprite.tint = 0xffffff;
            }
        }
    }

    jump(deltaTime: number) {
        if(this.jumpTime == 0) this.onJumpStart();

        if(this.jumpTime < this.jumpTimeLimit) {
            this.currentGravity = 0;
            this.jumpTime += deltaTime;
            this.fg = this.jumpIntensity;
        } else {
            this.jumpEnd();
        }
    }

    jumpEnd() {
        this.jumpTime = this.jumpTimeLimit;
        this.currentGravity = this.gravity;
    }

    activateInvincibility(t: number) {
        this.invincible = true;
        this.invincibilityTimer = t;
    }

    kill() {}

    hurt(dmg: number) {}
}
