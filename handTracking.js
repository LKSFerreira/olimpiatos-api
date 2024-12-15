// handTracking.js
import { video, canvas, selecionarFuncao } from './script.js';

let modelo;

async function carregarModelo() {
    console.log("Carregando modelo de detecção de mãos...");
    modelo = await handpose.load();
    console.log("Modelo carregado com sucesso!");
    loopRastreamentoMaos();
}

async function detectarMaos() {
    const previsoes = await modelo.estimateHands(video);
    if (previsoes.length > 0) {
        processarDadosMaos(previsoes[0].landmarks);
    }
}

function processarDadosMaos(marcos) {
    const pontaDedoIndicador = marcos[8];
    const pontaDedoMedio = marcos[12];

    const x1 = canvas.width - pontaDedoIndicador[0];
    const y1 = pontaDedoIndicador[1];
    const x2 = canvas.width - pontaDedoMedio[0];
    const y2 = pontaDedoMedio[1];

    if (y1 < 90) {
        if (selecionarFuncao(x1, y1)) {
            return;
        }
    }
}

async function loopRastreamentoMaos() {
    await detectarMaos();
    requestAnimationFrame(loopRastreamentoMaos);
}

carregarModelo();