import { AnimatedSprite, Container, Sprite, Texture } from "pixi.js";
import { Quadtree } from "./quadtree";
import { BaseObject, BaseObjectOpts, BoxBound } from "./base-object";

export interface DynamicObjOpts extends BaseObjectOpts {
    container: Container;
    x: number;
    y: number;
    width: number;
    height: number;
    heightX: number
    offsetHeightX: number;
    texture: Texture;
    hpMax?: number;
    getTree: () => Quadtree;
    customSprite?: AnimatedSprite;
}

// ifc = invicincibility flicker counter

export class DynamicObj extends BaseObject {
    isFlickered = false;
    ifc: number;
    ifcMax: number = 5;

    jumpIntensity = 4;
    currentGravity = 0;
    gravity = 0.2;
    gravityEnabled = true;
    jumpTime = 0;
    jumpTimeLimit = 25;
    fg = 0;
    fgmax = -10;
    vy: number = 0;
    vx: number = 0;
    hp: number;
    hpMax: number = 10;
    invincibilityTimer: number = 0;
    invincible: boolean = false;
    isJumping: boolean = false;

    sidePos: BoxBound;

    getTree: () => Quadtree;

    events: ((self: this) => void)[] = [];

    onJumpStart: () => void = () => undefined;
    onHitFloor: () => void = () => undefined;

    constructor(o: DynamicObjOpts) {
        super(o);
        this.sidePos = DynamicObj.generateBounds(o.x, o.y + o.offsetHeightX, o.width, o.heightX);
        //this.sidePos = DynamicObj.generateBounds(o.x, o.y, o.width, o.height );
        this.sprite.anchor.set(0);
        this.sprite.position.set(this.pos.x, this.pos.y);
        this.sprite.zIndex = 2;
        this.getTree = o.getTree;
        this.ifc = this.ifcMax;
        o.container.addChild(this.sprite);

        if(o.hpMax) this.hpMax = o.hpMax;
        this.hp = this.hpMax;
    }

    disable() {
        this.gravityEnabled = false;
    }

    enable() {
        this.gravityEnabled = true;
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

    seperateX(o: BaseObject, deltaTime: number) {
        if(this.sidePos.x - this.vx < o.pos.x) {
            // right
            const vx = o.pos.x - this.sidePos.maxX;

            //console.log(Math.round(vx * 100) / 100);
            this.vx = 0;
            this.moveRight(vx);
        } else {
            // left
            const vx = o.pos.maxX - this.sidePos.x;

            this.vx = 0;
            this.moveRight(vx);
        }
    
    }
    
    seperateY(o: BaseObject, vDown: number, deltaTime: number) {
        if(this.pos.y < o.pos.y) {
            // floor
            const fNormal = this.pos.maxY - o.pos.y + vDown;
            this.moveUp(fNormal);
            this.jumpTime = 0;
            this.fg = 0;
            this.currentGravity = 0;
            
            if(this.isJumping) this.onHitFloor();
            this.isJumping = false;
        } else {
            // ceiling
            const fNormal = this.pos.y - o.pos.maxY + vDown;
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

    detectCollisionX(tree: Quadtree, deltaTime: number) {
        const collidedX: BaseObject[] | false = tree.find(this.sidePos, this);
        if(collidedX) {
            this.seperateX(collidedX[0], deltaTime);
        } else {
            this.vx = 0;
        }
    }

    detectCollisionY(tree: Quadtree, deltaTime: number) {
        var vDown = this.vy - this.fg * deltaTime;
        //this.moveDown(vDown);
        //this.updateY(this.vy);
        //this.updateSpriteY(this.vy);
        this.updateY(vDown);
        this.updateSpriteY(vDown);

        const collidedY: BaseObject[] | false = tree.find(this.pos, this);
        if(collidedY) {
            vDown += this.fg * deltaTime;
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

        if(this.gravityEnabled && (this.fg > this.fgmax)) {
            this.fg -= this.currentGravity * deltaTime;
            if(this.fg < this.fgmax) this.fg = this.fgmax;
        }

        this.detectCollisionY(tree, deltaTime);
        this.updatePos(this.vx, this.vy);
        this.updateSpritePos(this.vx, this.vy);
        //this.vx = 0;
        this.vy = 0;

        this.detectCollisionX(tree, deltaTime);
        this.updateX(this.vx);
        this.updateSpriteX(this.vx);
        this.vx = 0;

        if(this.invincible) {
            if(this.invincibilityTimer > 0) {
                this.ifc -= deltaTime;
                this.invincibilityTimer -= deltaTime;

                if(this.ifc <= 0) {
                    this.isFlickered = !this.isFlickered;
                    this.ifc = this.ifcMax;
                }

                if(this.isFlickered) {
                    this.sprite.tint = 0x00ffff;
                } else {
                    this.sprite.tint = 0xffffff;
                }
            } else {
                this.isFlickered = false;
                this.invincible = false
                this.invincibilityTimer = 0;
                this.sprite.tint = 0xffffff;
                this.ifc = this.ifcMax;
            }
        }

        this.extraTick(deltaTime);
    }

    extraTick(deltaTime: number) {}

    jump(deltaTime: number) {
        if(this.jumpTime == 0) this.onJumpStart();

        if(this.jumpTime < this.jumpTimeLimit) {
            this.isJumping = true;
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

}
