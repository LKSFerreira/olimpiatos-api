import { selecionarFuncao } from './functions.js';

let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;

export function setupCanvasEventHandlers(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        desenhando = true;
        [ultimoX, ultimoY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!desenhando) return;
        desenhar(e.offsetX, e.offsetY);
        [ultimoX, ultimoY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mouseup', () => {
        desenhando = false;
    });

    canvas.addEventListener('mouseleave', () => {
        desenhando = false;
    });

    canvas.addEventListener('click', (e) => {
        selecionarFuncao(e.offsetX, e.offsetY);
    });
}

function desenhar(x, y) {
    // Função de desenho (se necessário)
}