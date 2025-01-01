
interface PanControllerOpts {
    touchEl: HTMLElement;
}

export class PanController {
    canPan: boolean = true;
    touchEl: HTMLElement;
    x: number = 0;
    y: number = 0;
    lx: number = 0;
    ly: number = 0;
    isDown: boolean = false;
    id: number = NaN;

    constructor(o: PanControllerOpts) {
        this.touchEl = o.touchEl;
        this.enable();
    }

    enable() {
        this.touchEl.onpointerdown = e => this.down(e);
        this.touchEl.onpointerup = e => this.up();
        this.touchEl.ontouchmove = e => this.touchMove(e.targetTouches[e.targetTouches.length - 1]);
        this.touchEl.onmousemove= e => this.mouseMove(e);
    }

    disable() {
        this.touchEl.onpointerdown = null;
        this.touchEl.onpointerup = null;
        this.touchEl.ontouchmove = null;
        this.touchEl.onmousemove = null;
    }

    mouseMove(e: MouseEvent) {
        if (!this.canPan) return;
        const x = e.movementX;
        const y = e.movementY;

        this.onPan(x, y);
    }

    touchMove(e: Touch) {
        if(!this.canPan) return;
        if(e.identifier == this.id) {
          this.x = this.lx - e.pageX;
          this.y = this.ly - e.pageY;
          this.lx = e.pageX;
          this.ly = e.pageY;
    
          this.onPan(this.x, this.y);
        }
    }
    
    onPan: (x: number, y: number) => void = () => undefined;

    down(e: PointerEvent) {
        if(this.isDown) return;

        this.isDown = true
        this.id = e.pointerId
        this.lx = e.pageX
        this.ly = e.pageY
    }

    up() {
        if(!this.isDown) return;

        this.isDown = false;
        this.id = NaN;
    }
}