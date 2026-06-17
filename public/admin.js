const tokenSite = localStorage.getItem('token_site');

if (!tokenSite) {
    window.location.href = '/login.html';
}

let usuarioEmEdicao = null;

// Carregar lista de usuários  
async function carregarUsuarios() {
    try {
        const res = await fetch('/api/listar-usuarios', {
            headers: {
                'Authorization': `Bearer ${tokenSite}`
            }
        });

        if (!res.ok) {
            console.error('Status:', res.status);
            mostrarMensagem('Erro ao carregar usuários', 'erro');
            return;
        }

        const usuarios = await res.json();
        renderizarUsuarios(usuarios);
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro na conexão', 'erro');
    }
}

function renderizarUsuarios(usuarios) {
    const container = document.getElementById('usuarios-list');

    if (usuarios.length === 0) {
        container.innerHTML = '<p style="color: #a0aec0;">Nenhum usuário encontrado</p>';
        return;
    }

    container.innerHTML = usuarios.map(usuario => `
        <div class="usuario-card">
            <div class="usuario-info">
                <h3>${usuario.nome}</h3>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Cargo:</strong> ${usuario.cargo}</p>
                <p><strong>Filial:</strong> ${usuario.filial}</p>
            </div>
            <div class="usuario-actions">
                <button class="btn-editar" onclick="abrirModal('${usuario.email}', '${usuario.cargo}', '${usuario.filial}', '${usuario.nome}')">
                    Editar
                </button>
            </div>
        </div>
    `).join('');
}

function abrirModal(email, cargo, filial, nome) {
    usuarioEmEdicao = email;
    document.getElementById('edit-nome').value = nome;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-cargo').value = cargo;
    document.getElementById('edit-filial').value = filial;
    document.getElementById('modal-edicao').classList.add('active');
}

function fecharModal() {
    document.getElementById('modal-edicao').classList.remove('active');
    usuarioEmEdicao = null;
}

// Salvar alterações
document.getElementById('form-edicao').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('edit-nome').value;
    const cargo = document.getElementById('edit-cargo').value;
    const filial = document.getElementById('edit-filial').value;

    try {
        const res = await fetch('/api/atualizar-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenSite}`
            },
            body: JSON.stringify({
                email: usuarioEmEdicao,
                nome,
                cargo,
                filial
            })
        });

        if (!res.ok) {
            mostrarMensagem('Erro ao atualizar usuário', 'erro');
            return;
        }

        mostrarMensagem('Usuário atualizado com sucesso!', 'sucesso');
        fecharModal();
        carregarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensagem('Erro na conexão', 'erro');
    }
});

function mostrarMensagem(texto, tipo) {
    const msg = document.getElementById('mensagem');
    msg.textContent = texto;
    msg.className = `mensagem ${tipo} active`;

    setTimeout(() => {
        msg.classList.remove('active');
    }, 3000);
}

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token_site');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
});

// Carregar usuários ao abrir a página
window.addEventListener('load', carregarUsuarios);