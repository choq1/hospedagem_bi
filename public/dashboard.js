const tokenSite = localStorage.getItem('token_site');
const dadosUsuario = JSON.parse(localStorage.getItem('usuario'));

if (!tokenSite) {
    window.location.href = '/login.html';
}

// ==================== DECODIFICAR NIVEL_ACESSO ====================
let nivelAcesso = 'analista'; // valor padrão

if (tokenSite) {
    try {
        const payload = JSON.parse(atob(tokenSite.split('.')[1]));
        nivelAcesso = payload.nivel_acesso || 'analista';
        console.log('Nível de acesso:', nivelAcesso);
    } catch (erro) {
        console.error('Erro ao decodificar token:', erro);
    }
}

// IDs do seu Power BI (Grupo Caminho)
const groupId = 'e4509305-8a1a-4853-894a-f5ba07b18314';
const tenantId = 'common';

// Mapeamento dos relatórios com os IDs corretos
const mapeamentoRelatorios = {
    'vendas': { 
        nome: 'VENDAS', 
        link: 'https://app.powerbi.com/view?r=eyJrIjoiNzliZTZhNzktMWNjNC00NzQ5LWI1M2MtZmFiZTUyM2I0MTFjIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    },
    'pos-vendas': { 
        nome: 'PÓS-VENDAS', 
        link: 'https://app.powerbi.com/view?r=eyJrIjoiNzliZTZhNzktMWNjNC00NzQ5LWI1M2MtZmFiZTUyM2I0MTFjIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    },
    'dre': { 
        nome: 'DRE', 
        link: 'https://app.powerbi.com/view?r=eyJrIjoiMzIwMzViM2EtYTc0Ny00YmM2LWE5OGQtMTkwYWU3MWRhYzEzIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    }
};

// Adicionar DRE apenas se for diretoria ou admin
if (nivelAcesso === 'diretoria' || nivelAcesso === 'admin') {
    mapeamentoRelatorios['dre'] = { 
        nome: 'DRE', 
        link: 'https://app.powerbi.com/view?r=eyJrIjoiMzIwMzViM2EtYTc0Ny00YmM2LWE5OGQtMTkwYWU3MWRhYzEzIiwidCI6ImY0Njg5MWUzLWEyYjctNGZjZS04ODc4LTFlZjU5YWZiNTFlMSJ9'
    };
}

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
        carregarDashboard(tela, mapeamentoRelatorios[tela].link);
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
    carregarDashboard(primeiroTela, mapeamentoRelatorios[primeiroTela].link);
}

function carregarDashboard(nomeTela, link) {
    const titulo = document.getElementById('titulo-tela');
    if (titulo) {
        titulo.innerText = mapeamentoRelatorios[nomeTela].nome;
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