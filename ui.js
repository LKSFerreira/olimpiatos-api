import { desenharPaletaCores, atualizarUI } from './functions.js';

export async function iniciarVideo(video, canvas) {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
    });
    video.srcObject = stream;
    await new Promise((resolve) => (video.onloadedmetadata = resolve));

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.play();
}

let tempoAnterior = performance.now();
export function loopDesenho(video, canvas, ctx) {
    function draw() {
        atualizarUI(tempoAnterior);
        tempoAnterior = performance.now();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        desenharPaletaCores(ctx);
        requestAnimationFrame(draw);
    }
    draw();
}