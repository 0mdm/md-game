import { TextureMesh, TexturePacker } from "../../../lib/pack-textures";
import { btn1 } from "../../../lib/ui";
import { $, $$, btnList } from "../../../lib/util";
import { images } from "../../../main/canvas";
import { createBackBtn } from "../menu";

const texturePackerEl = $("#ui > #texture-packer") as HTMLDivElement;
const main = $("#ui > #texture-packer #main") as HTMLDivElement;
const bottom = $("#ui > #texture-packer #bottom") as HTMLDivElement;

export function enableTexturePacker() {
    texturePackerEl.style.display = "flex";
}

const back = createBackBtn(() => texturePackerEl.style.display = "none");
texturePackerEl.prepend(back);

var isDisabled = false;
const createAtlas = btn1("Create Atlas");
createAtlas.style.backgroundColor = "#46db96";

createAtlas.onpointerup = async function() {
    if(isDisabled) return;
    isDisabled = true;
    createAtlas.style.backgroundColor = "#4b705f";
    createAtlas.setAttribute("disabled", "true");
    createAtlas.textContent = "Disabled";
    
    await packTextures();
}; 

bottom.appendChild(createAtlas);

const meshes: TextureMesh[] = [];

for(const image in images) {
    const url = images[image];
    const el = $$("img", {
        attrs: {src: url},
    });

    const name = url.match((/[^\/.]+\./))?.[0].slice(0, -1);
    if(name == undefined) throw new Error(
        "texture-packer.ts: " + `"${url}" returns undefined name`
    );

    if(name == "spritesheet") continue;

    meshes.push({name, url});

    main.appendChild(el);
}

async function packTextures() {
    const packer = new TexturePacker({
        textures: meshes,
        currentSpritesheets: {
            "player-walk": {
                width: 32,
                amount: 4,
            }
        },
        padding: 1,
    });

    const c = await packer.pack();
    const url = c.toDataURL();
    const img = $$("img", {
        attrs: {
            id: "atlas",
            src: url,
        },
    });  
    main.appendChild(img);

    /*for(const i in packer.data.frames) {
        console.log(i, packer.data.frames[i].frame);
    }

    console.log(packer.data.animations);*/

    console.log(JSON.stringify(packer.data));
}