const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const fpsDisplay = document.getElementById('fps');
const ferramentaDisplay = document.getElementById('ferramenta');

let espessuraPincel = 15;
let espessuraBorracha = 50;
let corDesenho = 'rgba(255, 0, 255, 1)';
let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;
let pilhaDesfazer = [];
let pilhaRefazer = [];
let chart;
let graficoAtual = null;

function empurrarEstadoCanvas() {
    pilhaDesfazer.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (pilhaDesfazer.length > 10) pilhaDesfazer.shift();
}

function desfazer() {
    if (pilhaDesfazer.length > 0) {
        pilhaRefazer.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const imagem = pilhaDesfazer.pop();
        ctx.putImageData(imagem, 0, 0);
    }
}

function refazer() {
    if (pilhaRefazer.length > 0) {
        pilhaDesfazer.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const imagem = pilhaRefazer.pop();
        ctx.putImageData(imagem, 0, 0);
    }
}

async function iniciarVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
    });
    video.srcObject = stream;
    await new Promise((resolve) => (video.onloadedmetadata = resolve));

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.play();
}

function desenhar(x, y) {
    ctx.strokeStyle = corDesenho;
    ctx.lineWidth = corDesenho === 'rgba(0, 0, 0, 1)' ? espessuraBorracha : espessuraPincel;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ultimoX, ultimoY);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
}

canvas.addEventListener('mousedown', (e) => {
    desenhando = true;
    empurrarEstadoCanvas();
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

window.addEventListener('keydown', (e) => {
    if (e.key === 'z') desfazer();
    if (e.key === 'y') refazer();
});

function atualizarUI() {
    const tempoAtual = performance.now();
    const fps = Math.round(1000 / (tempoAtual - tempoAnterior));
    tempoAnterior = tempoAtual;
    fpsDisplay.innerText = `FPS: ${fps}`;
    ferramentaDisplay.innerText = `Ferramenta: ${corDesenho === 'rgba(0, 0, 0, 1)' ? 'Borracha' : 'Pincel'}`;
}

function desenharPaletaCores() {
    const cores = [
        { cor: 'rgba(255, 0, 0, 1)', funcao: ordenarMedalhas },
        { cor: 'rgba(0, 255, 0, 1)', funcao: agruparPorContinente },
        { cor: 'rgba(0, 0, 255, 1)', funcao: rankearContinentes },
        { cor: 'rgba(128, 0, 128, 1)', funcao: limparGrafico }
    ];
    const etiquetas = ['Ordenar Medalhas', 'Agrupar Continente', 'Rankear Continentes', 'Limpar Gráfico'];

    // Definir o tamanho da fonte
    ctx.font = 'bold 16px sans-serif'; // Aumente o tamanho da fonte aqui

    const larguraQuadrado = 100;
    const alturaQuadrado = 80;
    const espacoEntre = 60; // Espaço entre as funcionalidades

    cores.forEach((item, i) => {
        const x = 100 + i * (larguraQuadrado + espacoEntre); // Aumentar o espaço horizontal
        const y = 10;

        ctx.fillStyle = item.cor;
        ctx.fillRect(x, y, larguraQuadrado, alturaQuadrado);
        ctx.fillStyle = 'black';

        // Calcular a largura do texto
        const larguraTexto = ctx.measureText(etiquetas[i]).width;

        // Centralizar o texto
        const posX = x + (larguraQuadrado - larguraTexto) / 2; // Posição X centralizada
        const posY = y + alturaQuadrado + 20; // Mantém o espaço entre o quadrado e o texto

        ctx.fillText(etiquetas[i], posX, posY);
    });
}

function selecionarFuncao(x, y) {
    const funcoes = [
        { xInicio: 100, xFim: 200, yInicio: 10, yFim: 90, funcao: ordenarMedalhas },
        { xInicio: 250, xFim: 350, yInicio: 10, yFim: 90, funcao: agruparPorContinente },
        { xInicio: 400, xFim: 500, yInicio: 10, yFim: 90, funcao: rankearContinentes },
        { xInicio: 550, xFim: 650, yInicio: 10, yFim: 90, funcao: limparGrafico }
    ];

    for (let i = 0; i < funcoes.length; i++) {
        const { xInicio, xFim, yInicio, yFim, funcao } = funcoes[i];
        if (x > xInicio && x < xFim && y > yInicio && y < yFim) {
            if (graficoAtual !== funcao.name) {
                funcao();
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

function ordenarMedalhas() {
    console.log("Ordenar Medalhas foi chamado");
    pegarMedalhas().then(dados => {
        console.log("Dados recebidos da API: ", dados);
        const paises = dados.data;
        paises.sort((a, b) => b.total_medals - a.total_medals);
        desenharGrafico(paises.map(pais => [pais.name, pais.total_medals]), 'Medalhas por País');
    }).catch(error => {
        console.error("Erro ao pegar dados da API:", error);
    });
}

function agruparPorContinente() {
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
        desenharGrafico(Object.entries(continentes).map(([continente, medalhas]) => [continente, medalhas.ouro + medalhas.prata + medalhas.bronze]), 'Medalhas por Continente');
    }).catch(error => {
        console.error("Erro ao pegar dados da API:", error);
    });
}

function rankearContinentes() {
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
        desenharGrafico(ranking, 'Ranking de Continentes');
    }).catch(error => {
        console.error("Erro ao pegar dados da API:", error);
    });
}

function limparGrafico() {
    console.log("Limpar Gráfico foi chamado");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (chart) {
        chart.destroy();
        chart = null;
    }
    graficoAtual = null;
}

function desenharGrafico(dados, titulo) {
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
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
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
                    position: 'top',
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        },
    };

    const chartCanvas = document.createElement('canvas');
    chartCanvas.width = canvas.width;
    chartCanvas.height = canvas.height;
    document.querySelector('.container').appendChild(chartCanvas);

    chart = new Chart(chartCanvas, config);
}