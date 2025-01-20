import { $$ } from "./util";

export function btn1(text: string, up?: () => void) {
    return $$("button", {
        text,
        up,
    });
}

interface ElListOpts {
    name: string;
    src: string;
}

export class ElList {
    previousSelectedEl?: HTMLElement;
    previousSelectedName?: string;
    selected: string = "";
    parent: HTMLElement;

    onChangeF: (el: HTMLElement) => void;

    constructor(parent: HTMLElement, arr: ElListOpts[], up: (name: string, el: HTMLElement) => void, onChange: (el: HTMLElement) => undefined, onUnselect: () => void) {
        const self = this;
        this.parent = parent;
        this.onChangeF = onChange;

        for(const i of arr) {
            const el = $$("button", {
                children: [
                    $$("img", {
                        attrs: {
                            alt: i.name,
                            src: i.src,
                        }
                    }),
                ],
            });

            el.onpointerup = function() {
                if(self.previousSelectedEl) 
                    onChange(self.previousSelectedEl);

                if(self.previousSelectedName == i.name) {
                    onUnselect();
                    self.previousSelectedEl = undefined;
                    self.previousSelectedName = undefined;
                } else {
                    up(i.name, el);
                    self.previousSelectedEl = el;
                    self.previousSelectedName = i.name;
                }
            };

            this.parent.appendChild(el);
        }
    }

    exit() {
        if(this.previousSelectedEl) this.onChangeF(this.previousSelectedEl);
        this.selected = "";
        this.previousSelectedName = undefined;
    }

    static generate(name: string, src: string): ElListOpts {
        return {
            name,
            src,
        };
    }
}