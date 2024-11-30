import { Sprite, Texture } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";

interface PlayerOpts {
    texture: Texture;
}

export class Player {
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
        this.playerSprite.scale.y = 20;
        this.playerSprite.anchor.set(0.5, 0.5);
        this.playerSprite.position.set(halfWidth, halfHeight);

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
            this.vertVelocity -= this.currentGravity;
            this.playerSprite.position.y -= this.vertVelocity;
            if (this.playerSprite.position.y < (halfHeight - this.gravity)) {
                this.playerSprite.position.y += this.gravity;
            } else if (this.playerSprite.position.y > halfHeight) {
                this.playerSprite.position.y = halfHeight;
                this.jumpTime = 0;
                this.vertVelocity = 0;
            }
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
        this.playerSprite.position.x -= s;
    }

    moveRight(s: number) {
        this.playerSprite.position.x += s;
    }
}

export class GameObject {
    sprite: Sprite;
    isOversized = false;

    constructor(sprite: Sprite) {
        this.sprite = sprite;
    }
}