require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const db = new sqlite3.Database('./portal.db');

// ROTA: Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    db.get("SELECT * FROM usuarios WHERE email = ? AND ativo = 1", [email], async (err, usuario) => {
        if (err || !usuario) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida" });
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            cargo: usuario.cargo,
            telas: JSON.parse(usuario.telas_permitidas),
            filial: usuario.filial
        }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            usuario: {
                nome: usuario.nome,
                cargo: usuario.cargo,
                filial: usuario.filial,  // ADICIONE ESSA LINHA
                telas: JSON.parse(usuario.telas_permitidas)
            }
        });
    });
});

// ROTA: Obter Token de Embed do Power BI
app.post('/api/obter-relatorio', authenticateToken, async (req, res) => {
    try {
        console.log('Obtendo token Power BI...');
        const accessToken = await obterTokenPowerBI();
        console.log('Token obtido com sucesso');

        const response = await axios.post(
            `https://api.powerbi.com/v1.0/myorg/groups/${powerbiConfig.workspaceId}/reports/${powerbiConfig.reportId}/GenerateToken`,
            {
                accessLevel: 'View',
                allowSaveAs: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            embedToken: response.data.token,
            reportId: powerbiConfig.reportId,
            workspaceId: powerbiConfig.workspaceId,
            embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${powerbiConfig.reportId}&groupId=${powerbiConfig.workspaceId}`
        });
    } catch (error) {
        console.error('Erro completo:', error.response?.data || error.message);
        res.status(500).json({ erro: error.response?.data || error.message });
    }
});

// ROTA: Listar usuários (apenas para administrador)
app.get('/api/usuarios', (req, res) => {
    db.all("SELECT id, nome, email, cargo, filial FROM usuarios", (err, usuarios) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(usuarios);
    });
});

// Configuração do Power BI
const powerbiConfig = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    tenantId: process.env.TENANT_ID,
    workspaceId: process.env.WORKSPACE_ID,
    reportId: '1d05ac29-60f7-45e3-bbf9-0a7aa8e45a9e'
};

// Função para obter token de acesso
async function obterTokenPowerBI() {
    try {
        const response = await axios.post(
            `https://login.microsoftonline.com/${powerbiConfig.tenantId}/oauth2/v2.0/token`,
            {
                grant_type: 'client_credentials',
                client_id: powerbiConfig.clientId,
                client_secret: powerbiConfig.clientSecret,
                scope: 'https://analysis.windows.net/powerbi/api/.default'
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error.message);
        throw error;
    }
}

// Middleware para autenticar token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ erro: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// Endpoint para obter o token de embed
app.post('/api/obter-relatorio', authenticateToken, async (req, res) => {
    try {
        const accessToken = await obterTokenPowerBI();

        const response = await axios.post(
            `https://api.powerbi.com/v1.0/myorg/groups/${powerbiConfig.workspaceId}/reports/${powerbiConfig.reportId}/GenerateToken`,
            {
                accessLevel: 'View',
                allowSaveAs: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            embedToken: response.data.token,
            reportId: powerbiConfig.reportId,
            workspaceId: powerbiConfig.workspaceId,
            embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${powerbiConfig.reportId}&groupId=${powerbiConfig.workspaceId}`
        });
    } catch (error) {
        console.error('Erro ao obter token:', error.message);
        res.status(500).json({ erro: 'Erro ao obter token do Power BI' });
    }
});


// Função para obter token de acesso
async function obterTokenPowerBI() {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', powerbiConfig.clientId);
        params.append('client_secret', powerbiConfig.clientSecret);
        params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');

        const response = await axios.post(
            `https://login.microsoftonline.com/${powerbiConfig.tenantId}/oauth2/v2.0/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error.message);
        throw error;
    }
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
});

// Verificar token (middleware)
function verificarToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }
    // Aqui você valida o token se necessário
    next();
}

// Listar todos os usuários
app.get('/api/listar-usuarios', verificarToken, (req, res) => {
    db.all("SELECT id, nome, email, cargo, filial FROM usuarios ORDER BY nome", (err, usuarios) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: "Erro ao listar usuários" });
        }
        res.json(usuarios);
    });
});

// Atualizar usuário
app.post('/api/atualizar-usuario', verificarToken, (req, res) => {
    const { email, nome, cargo, filial } = req.body;

    db.run(
        "UPDATE usuarios SET nome = ?, cargo = ?, filial = ? WHERE email = ?",
        [nome, cargo, filial, email],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: "Erro ao atualizar usuário" });
            }
            res.json({ mensagem: "Usuário atualizado com sucesso!" });
        }
    );
});