import { Container, measureHtmlText, ObservablePoint, Sprite, squaredDistanceToLineSegment, Texture, v8_0_0 } from "pixi.js";
import { halfHeight, halfWidth } from "../main/canvas";
import { app } from "../main/app";
import { blockSize, Quadtree } from "./quadtree";
import { DynamicObj, DynamicObjOpts } from "./dynamic-object";
import { $ } from "./util";

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
    worldContainer: Container;

    constructor(o: PlayerOpts) {
        const opts: DynamicObjOpts = {
            container: app.stage,
            x: halfWidth,
            y: halfHeight,
            width: blockSize,
            height: blockSize,
            heightX: blockSize / 2,
            texture: o.texture,
            getTree: o.getTree,
            offsetHeightX: 4,
        };

        super(opts);
        this.worldContainer = o.worldContainer;
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
}

function updateHpBar(hpMax: number, hp: number) {
    const w = Math.ceil(hpElWidth / hpMax * hp).toString() + "px";
    hpEl.style.width = w;
}