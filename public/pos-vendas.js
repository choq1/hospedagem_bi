// Carrega dados do usuário logado
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosUsuario();
    carregarRelatorioPosVendas();
});

function carregarDadosUsuario() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioLogado);

    // Atualiza dados do perfil
    document.getElementById('profile-name').textContent = usuario.nome || 'Usuário';
    document.getElementById('profile-cargo').textContent = usuario.cargo || 'CARGO';
    document.getElementById('profile-filial').textContent = usuario.filial || 'Filial';

    // Gera iniciais para o avatar
    const iniciais = usuario.nome
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    document.getElementById('profile-avatar').textContent = iniciais;
}

function carregarRelatorioPosVendas() {
    const reportId = process.env.VENDAS_REPORT_ID;
    const groupId = process.env.VENDAS_GROUP_ID;
    const tenantId = process.env.VENDAS_TENANT_ID;

    const iframeUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}&autoAuth=true&ctid=${tenantId}`;

    document.getElementById('powerbi-iframe').src = iframeUrl;
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('tokenSite');
    window.location.href = 'login.html';
}