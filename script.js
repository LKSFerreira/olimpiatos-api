import { iniciarVideo, loopDesenho } from './ui.js';
import { setupCanvasEventHandlers } from './eventHandlers.js';

export const video = document.getElementById('video');
export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d', { willReadFrequently: true });

iniciarVideo(video, canvas).then(() => {
    setupCanvasEventHandlers(canvas);
    loopDesenho(video, canvas, ctx);
});