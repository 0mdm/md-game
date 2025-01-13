import { Color, Sprite, Texture } from "pixi.js";

export const UTIL_VERSION: number = 1.3;

export const RADIAN_QUARTER = 28.6479;

export function throwErr(file: string, msg: string): never {
  const err = new Error(`${file}.ts: ${msg}`);
  console.error(err);
  throw err.stack;
}

export function $(e: string): Element {
  const el = document.querySelector(e);
  if(el === null) throwErr(
    "util",
    `Can't find element "${e}"`
  );

  return el;
}

interface $$Opts {
  text?: string;
  children?: Element[];
  up?: () => void;
  down?: () => void;
  attrs?: {[key: string]: string},
  style?: {[key: string]: string},
}

export function $$
<N extends keyof HTMLElementTagNameMap>
(name: N, opts?: $$Opts): HTMLElementTagNameMap[N] {
  const el: HTMLElementTagNameMap[N] = 
  document.createElement(name) as 
  HTMLElementTagNameMap[N];

  if(!opts) return el;

  if(opts.text) el.textContent = opts.text;

  if(opts.children) 
    for(const i of opts.children)
      el.appendChild(i);

  if(opts.up)
    el.addEventListener("pointerup", opts.up);

  if(opts.down)
    el.addEventListener("pointerdown", opts.down);

  if(opts.attrs)
    for(const name in opts.attrs)
      el.setAttribute(name, opts.attrs[name]);

  if(opts.style)
    for(const name in opts.style)
      el.style.setProperty(name, opts.style[name]);

  return el;
}


export interface HideableInterface {
  el: Element;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export function hideable(el: HTMLElement, type?: string): HideableInterface {
  type ||= "flex";
  return {
    el,
    show() {
      el.style.display = type;
    },
    hide() {
      el.style.display = "none";
    },
    toggle() {
      if(el.style.display == "none") {
        el.style.display = type;
      } else {
        el.style.display = "none";
      }
    }
  };
}

export function getRandom(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)];
}

export function clamp(min: number, num: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function fr60(f: () => void) {
  setInterval(f, 1 / 60)
}

export function sp(x: number, y: number, width: number, height: number, color: number = Math.random() * 0xffffff): Sprite {
  const s = new Sprite(Texture.WHITE);
  s.position.set(x, y);
  s.width = width;
  s.height = height;
  s.tint = Math.random() * 0xffffff;
  s.zIndex = -1;
  return s;
}

export function toggleElement(el: HTMLElement, bool: boolean, type: string = "block") {
  if(bool) {
    el.style.display = el.getAttribute("data-display")!;
  } else {
    el.style.display = "none";
  }
}

export interface BtnList {
  arr: HTMLButtonElement[];
  addTo: (el: HTMLElement) => void;
}

export function btnList(arr: HTMLButtonElement[], up?: () => void) {
  function addTo(el: HTMLElement) {
    for(const btn of arr) el.appendChild(btn);
  }

  if(up)
    for(const btn of arr) btn.addEventListener("pointerup", up);

  return {
    arr,
    addTo,
  } as BtnList;
}

export function rand255(): number {
  return Math.floor(Math.random() * 256);
}