import { ElList, textEl } from "../../../lib/ui";
import { $, $$, round } from "../../../lib/util";

const debugEl = $("#ui > #debug-area") as HTMLDivElement;

var isToggled = false;
export function toggleDebugTools() {
    if(isToggled)
        debugEl.style.display = "none";
    else
        debugEl.style.display = "flex";
    

    isToggled = !isToggled;
}

function a(t: string) {
    const el = textEl(t);
    debugEl.appendChild(el);

    return el;
}

const roundNumber = 10;
const fps = a("FPS: --");
const rdt = a("Raw Delta Time: --");
const cores = a("CPU Cores: " + navigator.hardwareConcurrency || "unknown");
const deltaTime = a("Delta Time: --");

const tickerMax = 12;
var ticker = tickerMax;
export function setDebugStats(fpsN: number, rDeltaTime: number, deltaTimeN: number) {
    ticker -= deltaTimeN;
    if(ticker > 0) return;
    ticker = tickerMax;

    fps.textContent = "FPS: " + round(fpsN, roundNumber);
    rdt.textContent = "Raw Delta Time: " + round(rDeltaTime, roundNumber) + "ms";
    deltaTime.textContent = "Delta Time: " + round(deltaTimeN, roundNumber) + "ms/fps";
}