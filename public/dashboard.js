const tokenSite = localStorage.getItem('token_site');
const dadosUsuario = JSON.parse(localStorage.getItem('usuario'));

if (!tokenSite || !dadosUsuario) {
    window.location.href = '/login.html';
}

const telasPermitidas = Array.isArray(dadosUsuario.telas_permitidas)
    ? dadosUsuario.telas_permitidas
    : [];

function normalizarTela(tela) {
    return String(tela || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function telaEquivalentePermitida(chaveTela, telaPermitida) {
    const atual = normalizarTela(chaveTela);
    const permitida = normalizarTela(telaPermitida);

    if (atual === permitida) {
        return true;
    }

    const aliasesPosVendas = new Set(['pos-vendas', 'pos-venda', 'pós-vendas', 'pós-venda']);
    return aliasesPosVendas.has(atual) && aliasesPosVendas.has(permitida);
}

function podeVerTela(chaveTela) {
    return telasPermitidas.some(telaPermitida => telaEquivalentePermitida(chaveTela, telaPermitida));
}

const relatorios = {
    vendas: { nome: 'VENDAS' },
    'pos-vendas': { nome: 'PÓS-VENDAS' },
    dre: { nome: 'DRE' }
};

document.getElementById('txt-nome').innerText = dadosUsuario.nome || '';
document.getElementById('txt-cargo').innerText = dadosUsuario.cargo || '';
document.getElementById('txt-filial').innerText = dadosUsuario.filial || '';

const iniciais = (dadosUsuario.nome || '')
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

document.getElementById('avatar').innerText = iniciais || '??';

const containerMenu = document.getElementById('container-menu');
containerMenu.innerHTML = '';

Object.entries(relatorios).forEach(([chaveTela, dadosTela]) => {
    if (!podeVerTela(chaveTela)) {
        return;
    }

    const link = document.createElement('a');
    link.className = 'menu-item';
    link.innerText = dadosTela.nome;
    link.href = '#';
    link.onclick = (e) => {
    e.preventDefault();
    document.querySelectorAll('.menu-item').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    carregarDashboard(dadosTela.nome, chaveTela); // passa a chave, não o link
};
    containerMenu.appendChild(link);
});

const primeiroLink = containerMenu.querySelector('a');
if (primeiroLink) {
    primeiroLink.classList.add('active');
    const primeiraChavePermitida = Object.keys(relatorios).find(chave => podeVerTela(chave));
    if (primeiraChavePermitida) {
        carregarDashboard(relatorios[primeiraChavePermitida].nome, primeiraChavePermitida);
    }
} else {
    document.getElementById('reportContainer').innerHTML = '<div style="padding: 24px; color: #666;">Nenhuma tela permitida para este usuário.</div>';
}

async function carregarDashboard(nomeTela, chaveTela) {
    const token = localStorage.getItem('token_site');

    const titulo = document.getElementById('titulo-tela');
    if (titulo) titulo.innerText = nomeTela;

    const container = document.getElementById('reportContainer');
    container.innerHTML = '<div style="padding: 24px; color: #666;">Carregando...</div>';

    try {
        const resposta = await fetch(`/api/link-relatorio/${chaveTela}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!resposta.ok) {
            container.innerHTML = '<div style="padding: 24px; color: red;">Acesso negado ou erro ao carregar.</div>';
            return;
        }

        const { link } = await resposta.json();

        container.innerHTML = `
            <iframe
                title="Power BI Report"
                width="100%"
                height="100%"
                src="${link}"
                frameborder="0"
                allowFullScreen="true">
            </iframe>
        `;
    } catch (erro) {
        container.innerHTML = '<div style="padding: 24px; color: red;">Erro ao carregar relatório.</div>';
    }
}

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token_site');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
});

if (dadosUsuario.cargo === 'ADMINISTRADOR') {
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.style.display = 'block';
    }
}
