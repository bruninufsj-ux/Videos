export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const SOURCE_SECONDS = 54.66;
export const DURATION_IN_FRAMES = Math.ceil(SOURCE_SECONDS * FPS);

export const toFrame = (seconds: number) => Math.round(seconds * FPS);
