export const halfWidth = Math.round(innerWidth / 2 * 100) / 100;
export const halfHeight = Math.round(innerHeight / 2 * 100) / 100;

document.documentElement.style.setProperty("--w", innerWidth + "px");
document.documentElement.style.setProperty("--h", innerHeight + "px");