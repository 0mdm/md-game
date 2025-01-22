import { AnimatedSprite, Container, getUrlExtension, measureHtmlText, ObservablePoint, Sprite, squaredDistanceToLineSegment, Texture, v8_0_0 } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app, screenHeight, screenWidth } from "../main/app";
import { blockSize, Quadtree } from "./quadtree";
import { DynamicObj, DynamicObjOpts } from "./dynamic-object";
import { $ } from "./util";
import { spritesheet } from "../main/atlas";

/*
export interface QuadtreeBox {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
}*/

export interface PlayerOpts extends Partial<DynamicObjOpts> {
    height: number;
    actualWidth: number;
    worldContainer: Container;
    texture: Texture;
    getTree: () => Quadtree;
}

var spawnX = 0;
var spawnY = 0;

export function setSpawn(x: number, y: number) {
    spawnX = x;
    spawnY = y;
}


const hpTxt = $("#ui > #stats > #health-c #health") as HTMLParagraphElement;
const hpEl = $("#ui > #stats > #health-c") as HTMLElement;
const hpElWidth: number = Number(getComputedStyle(document.documentElement).getPropertyValue("--sw").slice(0, -2));

export class Player extends DynamicObj {
    isPlayingWalkAnim: boolean = false;
    isWalking: boolean = false;
    worldContainer: Container;

    constructor(o: PlayerOpts) {
        const opts: DynamicObjOpts = {
            character: "@",
            container: app.stage,
            x: screenWidth / 2,
            y: screenHeight / 2,
            width: o.actualWidth,
            height: o.height,
            heightX: o.height - 4,
            texture: o.texture,
            getTree: o.getTree,
            offsetHeightX: 3,
            customSprite: new AnimatedSprite(spritesheet.animations["player-walk"]),
        };

        super(opts);

        (this.sprite as AnimatedSprite).animationSpeed = 0.11;

        this.worldContainer = o.worldContainer;
        this.sprite.width = 32;
        this.sprite.position.x -= 12;

        this.onHitFloor = function() {
            this.isPlayingWalkAnim = false;
            const s = this.sprite as AnimatedSprite;
            var f = s.currentFrame+1;
            if(f >= s.totalFrames) f = 0;

            s.gotoAndStop(f);
        }
    }

    override updateSpriteX(x: number): void {
        this.worldContainer.position.x -= x;
    }

    override updateSpriteY(y: number): void {
        this.worldContainer.position.y -= y;
    }

    override kill() {
        this.jumpEnd();
        this.respawn();
    }

    respawn() {
        this.hp = this.hpMax;
        this.events.push(self => self.tp(spawnX, spawnY));
        hpTxt.textContent = `${this.hp}/${this.hpMax}`;
        updateHpBar(this.hpMax, this.hp);
    }

    override hurt(dmg: number) {
        if(this.invincible) return;

        this.hp -= Math.round(dmg);
        hpTxt.textContent = `${this.hp}/${this.hpMax}`;

        if(this.hp <= 0) return this.kill();

        updateHpBar(this.hpMax, this.hp);
        this.activateInvincibility(50);
    }

    continueWalking() {
        if(this.isJumping) return;
        this.isWalking = true;
    }

    stopWalking() {
        this.isWalking = false;
    }

    turnLeft() {
        this.sprite.anchor.x = 1;
        this.sprite.scale.x = -1;
    }

    turnRight() {
        this.sprite.anchor.x = 0;
        this.sprite.scale.x = 1;
    }

    override extraTick(deltaTime: number): void {
        if(!this.isPlayingWalkAnim && this.isWalking) {
            this.isPlayingWalkAnim = true;
            (this.sprite as AnimatedSprite).play();
        } else if(this.isPlayingWalkAnim && !this.isWalking) {
            this.isPlayingWalkAnim = false;
            (this.sprite as AnimatedSprite).stop();
        }
    }

    override jump(deltaTime: number): void {
        super.jump(deltaTime);
        if(this.isPlayingWalkAnim && this.isJumping) {
            this.isPlayingWalkAnim = false;
            (this.sprite as AnimatedSprite).stop();
        }
    }
}

function updateHpBar(hpMax: number, hp: number) {
    const w = Math.ceil(hpElWidth / hpMax * hp).toString() + "px";
    hpEl.style.width = w;
}