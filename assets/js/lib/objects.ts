import { Sprite, Texture } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";
import { player } from "../game/player";
import { fr60 } from "./util";

interface PlayerOpts {
    texture: Texture;
}

export class Player {
    jumpIntensity= 3;
    jumpInertia = 3;
    gravity = 0.8;
    jumpTime = 0;
    jumpTimeLimit = 60;
    playerSprite: Sprite;

    constructor(o: PlayerOpts) {
        this.playerSprite = new Sprite(o.texture);
        this.playerSprite.scale.x = 10;
        this.playerSprite.scale.y = 20;
        this.playerSprite.anchor.set(0.5, 0.5);
        this.playerSprite.position.set(halfWidth, halfHeight);
        this.enableGravity();

        app.stage.addChild(this.playerSprite);
    }

    enableGravity() {
        const halfHeightG = halfHeight - this.gravity;

        fr60(() => {
            if(this.playerSprite.position.y < halfHeightG) {
                this.playerSprite.position.y += this.gravity;
            } else if(this.playerSprite.position.y < halfHeight) {
                this.playerSprite.position.y = halfHeight;
                this.jumpTime = 0;
            } else if(this.playerSprite.position.y == halfHeight) {
                this.jumpTime = 0;
            }
        });
    }

    jump() {
        if(this.jumpTime <= this.jumpTimeLimit) {
            this.jumpTime++;
            this.playerSprite.position.y -= this.gravity + this.jumpInertia;
            if(this.jumpInertia > 0) this.jumpInertia -= 0.05;
        }
    }

    jumpEnd() {
        this.jumpTime = this.jumpTimeLimit;
        this.jumpInertia = this.jumpIntensity;
    }

    moveLeft(s: number) {
        this.playerSprite.position.x -= s;
    }

    moveRight(s: number) {
        this.playerSprite.position.x += s;
    }
}