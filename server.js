require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ROTA: Login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Buscar usuário no Supabase
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('ativo', 1)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        // Validar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida" });
        }

        // Gerar token JWT
        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            cargo: usuario.cargo,
            telas: usuario.telas_permitidas,
            filial: usuario.filial,
            nivel_acesso: usuario.nivel_acesso  // ← ADICIONADO
        }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            usuario: {
                nome: usuario.nome,
                cargo: usuario.cargo,
                filial: usuario.filial,
                telas: usuario.telas_permitidas
            }
        });
    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
});

// ROTA: Listar usuários (apenas para administrador)
app.get('/api/usuarios', verificarToken, async (req, res) => {
    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('id, nome, email, cargo, filial');

        if (error) throw error;
        res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).json({ error: erro.message });
    }
});

// ROTA: Listar todos os usuários com mais detalhes
app.get('/api/listar-usuarios', verificarToken, async (req, res) => {
    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('id, nome, email, cargo, filial')
            .order('nome', { ascending: true });

        if (error) throw error;
        res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).json({ erro: "Erro ao listar usuários" });
    }
});

// ROTA: Atualizar usuário
app.post('/api/atualizar-usuario', verificarToken, async (req, res) => {
    const { email, nome, cargo, filial } = req.body;

    try {
        const { error } = await supabase
            .from('usuarios')
            .update({ nome, cargo, filial, updated_at: new Date() })
            .eq('email', email);

        if (error) throw error;
        res.json({ mensagem: "Usuário atualizado com sucesso!" });
    } catch (erro) {
        console.error('Erro ao atualizar usuário:', erro);
        res.status(500).json({ erro: "Erro ao atualizar usuário" });
    }
});

// ROTA: Deletar usuário
app.delete('/api/deletar-usuario/:email', verificarToken, async (req, res) => {
    const { email } = req.params;

    try {
        // Verificar se o usuário existe
        const { data: usuario, error: erroVerificacao } = await supabase
            .from('usuarios')
            .select('id, nome')
            .eq('email', email)
            .maybeSingle();

        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Deletar auditoria do usuário primeiro (foreign key)
        await supabase
            .from('auditoria')
            .delete()
            .eq('usuario_id', usuario.id);

        // Deletar usuário
        const { error: erroDeletar } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', usuario.id);

        if (erroDeletar) throw erroDeletar;
        
        res.json({ 
            mensagem: `Usuário ${usuario.nome} (${email}) deletado com sucesso!`
        });
    } catch (erro) {
        console.error('Erro ao deletar usuário:', erro);
        res.status(500).json({ erro: "Erro ao deletar usuário" });
    }
});

// ROTA: Desativar usuário (alternativa mais segura que deletar)
app.post('/api/desativar-usuario', verificarToken, async (req, res) => {
    const { email } = req.body;

    try {
        const { error } = await supabase
            .from('usuarios')
            .update({ ativo: 0 })
            .eq('email', email);

        if (error) throw error;
        res.json({ mensagem: "Usuário desativado com sucesso!" });
    } catch (erro) {
        console.error('Erro ao desativar usuário:', erro);
        res.status(500).json({ erro: "Erro ao desativar usuário" });
    }
});

// ======================== POWER BI ========================

// Configuração do Power BI
const powerbiConfig = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    tenantId: process.env.TENANT_ID,
    workspaceId: process.env.WORKSPACE_ID,
    reportId: '1d05ac29-60f7-45e3-bbf9-0a7aa8e45a9e'
};

// Função para obter token de acesso Power BI
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
        console.error('Erro ao obter token Power BI:', error.message);
        throw error;
    }
}

// ROTA: Obter Token de Embed do Power BI (APENAS DIRETORIA)
app.post('/api/obter-relatorio', verificarToken, verificarDiretoria, async (req, res) => {
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

// ======================== MIDDLEWARES ========================

// Middleware para autenticar token JWT
function verificarToken(req, res, next) {
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

// Middleware para autenticar token JWT (alternativo)
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

// ==================== MIDDLEWARE DE PERMISSÕES ====================

// Verificar se é diretoria ou admin
function verificarDiretoria(req, res, next) {
    if (req.user.nivel_acesso !== 'diretoria' && req.user.nivel_acesso !== 'admin') {
        return res.status(403).json({ 
            erro: 'Acesso negado. Apenas diretoria e administradores podem acessar.' 
        });
    }
    next();
}

// Verificar se é gerente ou superior
function verificarGerente(req, res, next) {
    const permitidos = ['gerente', 'diretoria', 'admin'];
    if (!permitidos.includes(req.user.nivel_acesso)) {
        return res.status(403).json({ 
            erro: 'Acesso negado. Apenas gerentes e superiores.' 
        });
    }
    next();
}

// Verificar se é admin
function verificarAdmin(req, res, next) {
    if (req.user.nivel_acesso !== 'admin') {
        return res.status(403).json({ 
            erro: 'Acesso negado. Apenas administradores.' 
        });
    }
    next();
}

// Iniciar servidor
app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
});