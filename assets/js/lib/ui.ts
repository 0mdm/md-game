import { $$ } from "./util";

export function btn1(text: string, up?: () => void) {
    return $$("button", {
        text,
        up,
    });
}