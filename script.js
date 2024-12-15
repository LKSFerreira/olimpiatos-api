// script.js
import { pegarMedalhas } from './api.js';

export const video = document.getElementById('video');
export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d', { willReadFrequently: true });

let desenhando = false;
let chart;
let graficoAtual = null;

export async function iniciarVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
    });
    video.srcObject = stream;
    await new Promise((resolve) => (video.onloadedmetadata = resolve));

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.play();
}

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

function atualizarUI() {
    const tempoAtual = performance.now();
    const fps = Math.round(1000 / (tempoAtual - tempoAnterior));
    tempoAnterior = tempoAtual;
}

function desenharPaletaCores() {
    const cores = [
        { cor: 'rgba(255, 0, 0, 1)', funcao: ordenarMedalhas },
        { cor: 'rgba(0, 255, 0, 1)', funcao: agruparPorContinente },
        { cor: 'rgba(0, 0, 255, 1)', funcao: rankearContinentes },
        { cor: 'rgba(128, 0, 128, 1)', funcao: limparGrafico }
    ];
    const etiquetas = ['Ordenar Medalhas', 'Agrupar Continente', 'Rankear Continentes', 'Limpar Gráfico'];

    ctx.font = 'bold 16px sans-serif';

    const larguraQuadrado = 100;
    const alturaQuadrado = 80;
    const espacoEntre = 60;

    cores.forEach((item, i) => {
        const x = 100 + i * (larguraQuadrado + espacoEntre);
        const y = 10;

        ctx.fillStyle = item.cor;
        ctx.fillRect(x, y, larguraQuadrado, alturaQuadrado);
        ctx.fillStyle = 'black';

        const larguraTexto = ctx.measureText(etiquetas[i]).width;
        const posX = x + (larguraQuadrado - larguraTexto) / 2;
        const posY = y + alturaQuadrado + 20;

        ctx.fillText(etiquetas[i], posX, posY);
    });
}

export function selecionarFuncao(x, y) {
    const funcoes = [
        { xInicio: 100, xFim: 200, yInicio: 10, yFim: 90, funcao: ordenarMedalhas, cor: 'rgba(255, 0, 0, 0.75)' },
        { xInicio: 250, xFim: 350, yInicio: 10, yFim: 90, funcao: agruparPorContinente, cor: 'rgba(0, 255, 0, 0.75)' },
        { xInicio: 400, xFim: 500, yInicio: 10, yFim: 90, funcao: rankearContinentes, cor: 'rgba(0, 0, 255, 0.75)' },
        { xInicio: 550, xFim: 650, yInicio: 10, yFim: 90, funcao: limparGrafico, cor: 'rgba(128, 0, 128, 0.75)' }
    ];

    for (let i = 0; i < funcoes.length; i++) {
        const { xInicio, xFim, yInicio, yFim, funcao, cor } = funcoes[i];
        if (x > xInicio && x < xFim && y > yInicio && y < yFim) {
            if (graficoAtual !== funcao.name) {
                funcao(cor);
                graficoAtual = funcao.name;
            }
            return true;
        }
    }
    return false;
}

let tempoAnterior = performance.now();
function loopDesenho() {
    atualizarUI();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    desenharPaletaCores();
    requestAnimationFrame(loopDesenho);
}

iniciarVideo();
loopDesenho();

function ordenarMedalhas(cor) {
    console.log("Ordenar Medalhas foi chamado");
    pegarMedalhas().then(dados => {
        console.log("Dados recebidos da API: ", dados);
        const paises = dados.data;
        paises.sort((a, b) => b.total_medals - a.total_medals);
        desenharGrafico(paises.map(pais => [pais.name, pais.total_medals]), 'Medalhas por País', cor);
    }).catch(error => {
        console.error("Erro ao pegar dados da API:", error);
    });
}

function agruparPorContinente(cor) {
    console.log("Agrupar por Continente foi chamado");
    pegarMedalhas().then(dados => {
        console.log("Dados recebidos da API: ", dados);
        const paises = dados.data;
        const continentes = paises.reduce((acc, pais) => {
            if (!acc[pais.continent]) {
                acc[pais.continent] = { ouro: 0, prata: 0, bronze: 0 };
            }
            acc[pais.continent].ouro += pais.gold_medals;
            acc[pais.continent].prata += pais.silver_medals;
            acc[pais.continent].bronze += pais.bronze_medals;
            return acc;
        }, {});
        desenharGrafico(Object.entries(continentes).map(([continente, medalhas]) => [continente, medalhas.ouro + medalhas.prata + medalhas.bronze]), 'Medalhas por Continente', cor);
    }).catch(error => {
        console.error("Erro ao pegar dados da API:", error);
    });
}

function rankearContinentes(cor) {
    console.log("Rankear Continentes foi chamado");
    pegarMedalhas().then(dados => {
        console.log("Dados recebidos da API: ", dados);
        const paises = dados.data;
        const continentes = paises.reduce((acc, pais) => {
            if (!acc[pais.continent]) {
                acc[pais.continent] = 0;
            }
            acc[pais.continent] += pais.total_medals;
            return acc;
        }, {});
        const ranking = Object.entries(continentes).sort((a, b) => b[1] - a[1]);
        desenharGrafico(ranking, 'Ranking de Continentes', cor);
    }).catch(error => {
        console.error("Erro ao pegar dados da API:", error);
    });
}

function limparGrafico(cor) {
    console.log("Limpar Gráfico foi chamado");
    desenharGrafico([], '', cor, true);
    graficoAtual = null;
}

function desenharGrafico(dados, titulo, cor, limpar = false) {
    console.log("Desenhar Gráfico foi chamado com dados:", dados);

    if (chart) {
        chart.destroy();
    }

    const labels = dados.map(d => d[0]);
    const values = dados.map(d => d[1]);

    const data = {
        labels: labels,
        datasets: [{
            label: titulo,
            data: values,
            backgroundColor: cor,
            borderColor: cor,
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: !limpar,
                },
                title: {
                    display: !!titulo,
                    text: titulo
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: 'black',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    display: !limpar,
                    grid: {
                        display: !limpar
                    },
                    ticks: {
                        color: 'black', // Define a cor das legendas do eixo X
                        font: {
                            weight: 'bold' // Define as legendas do eixo X como negrito
                        }
                    }
                },
                y: {
                    display: !limpar,
                    grid: {
                        display: !limpar
                    },
                    ticks: {
                        color: 'black', // Define a cor das legendas do eixo Y
                        font: {
                            weight: 'bold' // Define as legendas do eixo Y como negrito
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    };

    const chartCanvas = document.createElement('canvas');
    chartCanvas.width = canvas.width;
    chartCanvas.height = canvas.height;
    document.querySelector('.container').appendChild(chartCanvas);

    chart = new Chart(chartCanvas, config);
}