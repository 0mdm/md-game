import { Container, Sprite, Texture } from "pixi.js";
import { Keymap } from "../lib/keymap";
import { app } from "../main/app";
import { player } from "./player";
import { World } from "../lib/world";

const world = new World("1");

const container = player.worldContainer;

app.stage.addChild(container);