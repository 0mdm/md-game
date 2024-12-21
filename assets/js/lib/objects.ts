import { Container, Sprite, Texture } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";

export interface box {

}

export interface QuadtreeBox {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
}

interface PlayerOpts {
    texture: Texture;
    worldContainer: Container;
}

export class Player {
    worldContainer: Container;
    jumpIntensity = 0;
    currentGravity = 0;
    gravity = 0.02; // pixels per frame
    gravityEnabled = true;
    jumpTime = 0;
    jumpTimeLimit = 40;
    vertVelocity = 0;
    playerSprite: Sprite;

    constructor(o: PlayerOpts) {
        this.playerSprite = new Sprite(o.texture);
        this.playerSprite.scale.x = 10;
        this.playerSprite.scale.y = 46;
        this.playerSprite.anchor.set(0.5, 0.5);
        this.playerSprite.position.set(halfWidth, halfHeight);
        this.worldContainer = o.worldContainer;

        app.stage.addChild(this.playerSprite);
    }

    enableGravity() {
        this.gravityEnabled = true;
    }
    disableGravity() {
        this.gravityEnabled = false;
    }
    
    tick() {
        if(this.gravityEnabled) {
            const playerBounds: QuadtreeBox = {
                x: this.playerSprite.x,
                y: this.playerSprite.y-1,
                width: this.playerSprite.width,
                height: this.playerSprite.height,
                maxX: this.playerSprite.bounds.maxX,
                maxY: this.playerSprite.bounds.maxY-1,
            };

            /*this.vertVelocity -= this.currentGravity;
            this.worldContainer.position.y += this.vertVelocity;
            if(this.worldContainer.position.y > -this.gravity) {
                this.worldContainer.position.y += this.gravity;
            } else if(this.tree!.checkForBlocks(playerBounds)) {
                this.worldContainer.position.y = 0;
                this.jumpTime = 0;
                this.vertVelocity = 0;
            }*/
        }
    }

    jump() {
        if(this.jumpTime < this.jumpTimeLimit) {
            this.currentGravity = 0;
            this.jumpTime++;
            this.vertVelocity = 1.5;
            /*if(this.jumpIntensity < this.jumpIntensityMax) {
                this.vertVelocity = this.jumpIntensityMax / 2;
            } else {
                this.vertVelocity = this.jumpIntensityMax;
            }*/
        } else {
            this.jumpEnd();
        }
    }

    jumpEnd() {
        this.jumpTime = this.jumpTimeLimit;
        this.currentGravity = this.gravity;
        this.jumpIntensity = 0;
    }

    moveLeft(s: number) {
        this.worldContainer.position.x += s;
    }

    moveRight(s: number) {
        this.worldContainer.position.x -= s;
    }
}

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
}