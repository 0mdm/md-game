import { DynamicObj, DynamicObjOpts } from "./dynamic-object";
import { Player } from "./objects";
import { isColliding } from "./quadtree";

var player: Player;

export function setPlayerObj(p: Player) {
    player = p;
}

export class Enemy extends DynamicObj {
    speed: number = 1.3;

    constructor(o: DynamicObjOpts) {
        super(o);
    }

    override extraTick(deltaTime: number): void {
        if(!player) return;
        this.pathfind(deltaTime);

        // optimize this with spatial partitioning later
        if(isColliding(this.pos, player.pos)) {
            player.hurt(2);
        }
    }

    pathfind(deltaTime: number) {
        const s = this.speed * deltaTime;
        const desX = player.pos.x;
        const desY = player.pos.y;

        if(desX > this.pos.x) {
            this.moveRight(s);
        } else {
            this.moveLeft(s);
        }

        this.jump(deltaTime);
    }
}