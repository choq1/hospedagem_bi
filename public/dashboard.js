const tokenSite = localStorage.getItem('token_site');
const dadosUsuario = JSON.parse(localStorage.getItem('usuario'));

if (!tokenSite) {
    window.location.href = '/login.html';
}

// IDs do seu Power BI (Grupo Caminho)
const groupId = 'e4509305-8a1a-4853-894a-f5ba07b18314';
const tenantId = 'common';

// Mapeamento dos relatórios com os IDs corretos
const mapeamentoRelatorios = {
    'vendas': { 
        nome: 'VENDAS', 
        id: '1d05ac29-60f7-45e3-bbf9-0a7aa8e45a9e' // ← SUBSTITUA AQUI
    },
    'pos-vendas': { 
        nome: 'PÓS-VENDAS', 
        id: '1d05ac29-60f7-45e3-bbf9-0a7aa8e45a9e' // ← SUBSTITUA AQUI
    },
    'dre': { 
        nome: 'DRE', 
        id: 'e56f2b5a-4e59-41ca-9eac-4fd131a9c802' // ← Já tem o ID correto
    }
};

// Preencher dados do usuário
document.getElementById('txt-nome').innerText = dadosUsuario.nome;
document.getElementById('txt-cargo').innerText = dadosUsuario.cargo;
document.getElementById('txt-filial').innerText = dadosUsuario.filial;

// Gerar iniciais para o avatar
const iniciais = dadosUsuario.nome
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
document.getElementById('avatar').innerText = iniciais;

// Criar menu com os 3 botões
const containerMenu = document.getElementById('container-menu');
containerMenu.innerHTML = ''; // Limpar menu antigo

Object.keys(mapeamentoRelatorios).forEach(tela => {
    const link = document.createElement('a');
    link.className = 'menu-item';
    link.innerText = mapeamentoRelatorios[tela].nome;
    link.href = '#';
    link.onclick = (e) => {
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        carregarDashboard(tela, mapeamentoRelatorios[tela].id);
    };
    containerMenu.appendChild(link);
});

// Carregar primeiro relatório por padrão
if (Object.keys(mapeamentoRelatorios).length > 0) {
    const primeiroTela = Object.keys(mapeamentoRelatorios)[0];
    const primeiroLink = containerMenu.querySelector('a');
    if (primeiroLink) {
        primeiroLink.classList.add('active');
    }
    carregarDashboard(primeiroTela, mapeamentoRelatorios[primeiroTela].id);
}

function carregarDashboard(nomeTela, reportId) {
    // Atualizar o título
    const titulo = document.getElementById('titulo-tela');
    if (titulo) {
        titulo.innerText = mapeamentoRelatorios[nomeTela].nome;
    }

    const container = document.getElementById('reportContainer');

    // Usar reportEmbed em vez de view
    const iframeUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}&autoAuth=true`;

    container.innerHTML = `
        <iframe 
            title="Power BI Report" 
            width="100%" 
            height="100%" 
            src="${iframeUrl}" 
            frameborder="0" 
            allowFullScreen="true">
        </iframe>
    `;
}

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token_site');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
});

// Mostrar link de admin se for administrador
if (dadosUsuario.cargo === 'ADMINISTRADOR') {
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.style.display = 'block';
    }
}