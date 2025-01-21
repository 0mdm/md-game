import { btn1 } from "../../../lib/ui";
import { $, btnList } from "../../../lib/util";
import { createBackBtn } from "../menu";

const texturePackerEl = $("#ui > #texture-packer") as HTMLDivElement;


export function enableTexturePacker() {
    texturePackerEl.style.display = "flex";
}

const back = createBackBtn(() => texturePackerEl.style.display = "none");
texturePackerEl.prepend(back);

    