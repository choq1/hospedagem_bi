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
    vendas: {
        nome: 'VENDAS',
        link: 'https://app.powerbi.com/view?r=eyJrIjoiNzliZTZhNzktMWNjNC00NzQ5LWI1M2MtZmFiZTUyM2I0MTFjIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    },
    'pos-vendas': {
        nome: 'PÓS-VENDAS',
        link: 'https://app.powerbi.com/view?r=eyJrIjoiNzliZTZhNzktMWNjNC00NzQ5LWI1M2MtZmFiZTUyM2I0MTFjIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    },
    dre: {
        nome: 'DRE',
        link: 'https://app.powerbi.com/view?r=eyJrIjoiMzIwMzViM2EtYTc0Ny00YmM2LWE5OGQtMTkwYWU3MWRhYzEzIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    }
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
        carregarDashboard(dadosTela.nome, dadosTela.link);
    };
    containerMenu.appendChild(link);
});

const primeiroLink = containerMenu.querySelector('a');
if (primeiroLink) {
    primeiroLink.classList.add('active');
    const primeiraChavePermitida = Object.keys(relatorios).find(chave => podeVerTela(chave));
    if (primeiraChavePermitida) {
        carregarDashboard(relatorios[primeiraChavePermitida].nome, relatorios[primeiraChavePermitida].link);
    }
} else {
    document.getElementById('reportContainer').innerHTML = '<div style="padding: 24px; color: #666;">Nenhuma tela permitida para este usuário.</div>';
}

function carregarDashboard(nomeTela, link) {
    const titulo = document.getElementById('titulo-tela');
    if (titulo) {
        titulo.innerText = nomeTela;
    }

    const container = document.getElementById('reportContainer');
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
