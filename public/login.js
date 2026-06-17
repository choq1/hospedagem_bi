const form = document.getElementById('form-login');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const manterConectado = document.getElementById('manter-conectado');

// Verificar se há sessão salva
window.addEventListener('load', () => {
    const sessaoSalva = localStorage.getItem('sessao_salva');
    if (sessaoSalva) {
        const usuario = JSON.parse(sessaoSalva);
        emailInput.value = usuario.email;
        manterConectado.checked = true;
    }
});



function togglePassword() {
    const senhaInput = document.getElementById('senha');
    const toggleIcon = document.querySelector('.toggle-password');

    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        toggleIcon.innerHTML = '<img src="not-visible.png" alt="Esconder senha">';
    } else {
        senhaInput.type = 'password';
        toggleIcon.innerHTML = '<img src="visual.png" alt="Mostrar senha">';
    }
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const senha = senhaInput.value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        console.log("Dados recebidos do servidor:", data);

        if (response.ok) {
            // Salvar token
            localStorage.setItem('token_site', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Se "Manter conectado" estiver marcado, salvar sessão
            if (manterConectado.checked) {
                localStorage.setItem('sessao_salva', JSON.stringify({ email }));
            } else {
                localStorage.removeItem('sessao_salva');
            }

            // Redirecionar para dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert(data.mensagem || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error(error);
        alert('Erro na conexão');
    }


    // Listar todos os usuários
app.get('/api/listar-usuarios', verificarToken, (req, res) => {
    db.all("SELECT id, nome, email, cargo, filial FROM usuarios ORDER BY nome", (err, usuarios) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao listar usuários" });
        }
        res.json(usuarios);
    });
});

// Atualizar usuário
app.post('/api/atualizar-usuario', verificarToken, (req, res) => {
    const { email, cargo, filial } = req.body;

    db.run(
        "UPDATE usuarios SET cargo = ?, filial = ? WHERE email = ?",
        [cargo, filial, email],
        function(err) {
            if (err) {
                return res.status(500).json({ erro: "Erro ao atualizar usuário" });
            }
            res.json({ mensagem: "Usuário atualizado com sucesso!" });
        }
    );
});
    
});