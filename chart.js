let chart;

export function desenharGrafico(dados, titulo, cor, limpar = false) {
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