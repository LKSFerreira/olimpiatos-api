// api.js
const BASE_URL = 'https://apis.codante.io/olympic-games';

async function pegarDados(endpoint) {
    try {
        const resposta = await fetch(`${BASE_URL}${endpoint}`);
        if (!resposta.ok) {
            throw new Error('Erro ao buscar dados da API');
        }
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        console.error(erro);
    }
}

export async function pegarMedalhas() {
    return await pegarDados('/countries');
}