
interface PanControllerOpts {
    touchEl: HTMLElement;
    grabCursor?: string;
    grabbingCursor?: string;
    enabled?: boolean;
}

export class PanController {
    canPan: boolean = true;
    touchEl: HTMLElement;
    touchPosition: Map<number, {lastX: number, lastY: number}> = new Map();
    isMouseDown: boolean = false;
    grabCursor: string = "grab";
    grabbingCursor: string = "grabbing";

    constructor(o: PanControllerOpts) {
        this.touchEl = o.touchEl;
        this.grabCursor = o.grabCursor || this.grabCursor;
        this.grabbingCursor = o.grabbingCursor || this.grabbingCursor;
        if (o.enabled === false) {
            this.disable();
            this.canPan = false; 
        } else {
            this.enable();
            this.canPan = true;
        }
    }

    setGrabCursor(grabCursor: string, grabbingCursor: string) {
        this.grabCursor = grabCursor;
        this.grabbingCursor = grabbingCursor;
        if (!this.canPan) return;
        if (this.isMouseDown) {
            this.touchEl.style.cursor = this.grabbingCursor;
        } else {
            this.touchEl.style.cursor = this.grabCursor;
        }
    }


    enable() {
        this.touchEl.onpointerdown = e => this.touchDown(e);
        this.touchEl.onpointerup = e => this.touchUp(e);
        this.touchEl.ontouchmove = e => Array.from(e.targetTouches).forEach(t => this.touchMove(t));

        this.touchEl.onmousedown = e => this.mouseDown(e);
        this.touchEl.onmouseup = e => this.mouseUp(e);
        this.touchEl.onmousemove = e => this.mouseMove(e);

        this.canPan = true;
        this.touchEl.style.cursor = this.grabCursor;
    }

    disable() {
        this.touchEl.onpointerdown = null;
        this.touchEl.onpointerup = null;
        this.touchEl.ontouchmove = null;

        this.touchEl.onmousedown = null;
        this.touchEl.onmouseup = null;
        this.touchEl.onmousemove = null;

        this.canPan = false;
        this.touchEl.style.cursor = "default";
    }

    mouseMove(e: MouseEvent) {
        if (!this.canPan) return;
        if (!this.isMouseDown) return;
        
        const x = -e.movementX;
        const y = -e.movementY;

        this.onPan(x, y, e.pageX, e.pageY);
    }

    touchMove(e: Touch) {
        if(!this.canPan) return;

        const touch = this.touchPosition.get(e.identifier);
        if(!touch) return;
        
        const x = touch.lastX - e.pageX;
        const y = touch.lastY - e.pageY;
        this.touchPosition.set(e.identifier, {lastX: e.pageX, lastY: e.pageY});
        this.onPan(x, y, e.pageX, e.pageY);
    }
    
    onPan: (x: number, y: number, px: number, py: number) => void = () => undefined;

    touchDown(e: PointerEvent) {
        this.touchPosition.set(e.pointerId, {lastX: e.pageX, lastY: e.pageY});
        this.onPan(0, 0, e.pageX, e.pageY);
    }

    touchUp(e: PointerEvent) {
        this.touchPosition.delete(e.pointerId);
    }

    mouseDown(e: MouseEvent) {
        this.isMouseDown = true;
        this.touchEl.style.cursor = this.grabbingCursor;
        this.onPan(0, 0, e.pageX, e.pageY);
    }

    mouseUp(e: MouseEvent) {
        this.isMouseDown = false;
        this.touchEl.style.cursor = this.grabCursor;
    }
}