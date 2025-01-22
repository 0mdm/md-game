import { Spritesheet, Texture } from "pixi.js";
import { images } from "./canvas";

const spritesheetObj = 
{"frames":{"block":{"frame":{"x":0,"y":0,"w":32,"h":32},"sourceSize":{"w":32,"h":32},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":32},"anchor":{"x":16,"y":16}},"spike":{"frame":{"x":32,"y":0,"w":32,"h":32},"sourceSize":{"w":32,"h":32},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":32},"anchor":{"x":16,"y":16}},"jumpy":{"frame":{"x":64,"y":0,"w":32,"h":32},"sourceSize":{"w":32,"h":32},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":32},"anchor":{"x":16,"y":16}},"rotate":{"frame":{"x":96,"y":0,"w":32,"h":32},"sourceSize":{"w":32,"h":32},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":32},"anchor":{"x":16,"y":16}},"trash":{"frame":{"x":128,"y":0,"w":32,"h":32},"sourceSize":{"w":32,"h":32},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":32},"anchor":{"x":16,"y":16}},"player-walk_0":{"frame":{"x":0,"y":32,"w":32,"h":40},"sourceSize":{"w":32,"h":40},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":40},"anchor":{"x":16,"y":20}},"player-walk_1":{"frame":{"x":32,"y":32,"w":32,"h":40},"sourceSize":{"w":32,"h":40},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":40},"anchor":{"x":16,"y":20}},"player-walk_2":{"frame":{"x":64,"y":32,"w":32,"h":40},"sourceSize":{"w":32,"h":40},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":40},"anchor":{"x":16,"y":20}},"player-walk_3":{"frame":{"x":96,"y":32,"w":32,"h":40},"sourceSize":{"w":32,"h":40},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":40},"anchor":{"x":16,"y":20}},"player":{"frame":{"x":128,"y":32,"w":32,"h":40},"sourceSize":{"w":32,"h":40},"spriteSourceSize":{"x":0,"y":0,"w":32,"h":40},"anchor":{"x":16,"y":20}},"left":{"frame":{"x":0,"y":72,"w":63,"h":63},"sourceSize":{"w":63,"h":63},"spriteSourceSize":{"x":0,"y":0,"w":63,"h":63},"anchor":{"x":31.5,"y":31.5}},"shoot":{"frame":{"x":63,"y":72,"w":63,"h":63},"sourceSize":{"w":63,"h":63},"spriteSourceSize":{"x":0,"y":0,"w":63,"h":63},"anchor":{"x":31.5,"y":31.5}}},"animations":{"player-walk":["player-walk_0","player-walk_1","player-walk_2","player-walk_3"]},"meta":{"format":"RGBA8888","scale":"1"}};

if(images["spritesheet.png"] == undefined) alert("Error: spritesheet wasn't loaded");

const spritesheet = new Spritesheet(
    Texture.from(images["spritesheet.png"]),
    spritesheetObj,
);

await spritesheet.parse();

export {spritesheet};