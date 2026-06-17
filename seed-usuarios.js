const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./portal.db');

const usuarios = [
    {
    nome: 'Administrador',
    email: 'admin@caminho.com.br',
    senha: 'admin5583', // MUDE ISSO DEPOIS!
    cargo: 'ADMINISTRADOR',
    filial: 'Sistema',
    ativo: 1,
    telas: ['vendas', 'pos-vendas', 'dre']
    },
    {
        nome: 'José Antônio',
        email: 'jav@caminho.com.br',
        senha: '123456',
        cargo: 'CEO',
        telas: ['pós-venda', 'vendas', 'dre'],
        filial: 'Matriz'
    },
    {
        nome: 'Alfredo Alves',
        email: 'alfredo@caminho.com.br',
        senha: '123456',
        cargo: 'Gerente',
        telas: ['pós-venda', 'vendas', 'dre'],
        filial: 'Araçatuba'
    },
    {
        nome: 'André Junqueira',
        email: 'andre@caminho.com.br',
        senha: '123456',
        cargo: 'Analista',
        telas: ['vendas', 'pós-venda', 'dre'],
        filial: 'Piracicaba'
    },
    {
        nome: 'Gabriel Herculano',
        email: 'gabriel@caminho.com.br',
        senha: '123456',
        cargo: 'Analista',
        telas: ['pós-venda', 'vendas', 'dre'],
        filial: 'Ram Araçatuba'
    },
    {
        nome: 'Thais Souza',
        email: 'thais@caminho.com.br',
        senha: '123456',
        cargo: 'Analista',
        telas: ['pós-venda', 'vendas', 'dre'],
        filial: 'Ram Araçatuba'
    },
    {
        nome: 'Raphaela Gonçalves',
        email: 'raphaela@caminho.com.br',
        senha: '123456',
        cargo: 'Assistente Adm. - Diretoria',
        telas: ['pós-venda', 'vendas', 'dre'],
        filial: 'Ram Araçatuba'
    },    
    {
        nome: 'Haryele Neves',
        email: 'haryele@caminho.com.br',
        senha: '123456',
        cargo: 'Assistente Adm. - Diretoria',
        telas: ['pós-venda', 'vendas', 'dre'],
        filial: 'Ram Araçatuba'
    }    
];

// Função auxiliar para processar as inserções de forma estritamente sequencial
async function rodarSeed() {
    for (const user of usuarios) {
        try {
            // 1. Verifica se o e-mail já existe no banco
            const existe = await new Promise((resolve, reject) => {
                db.get(`SELECT id FROM usuarios WHERE email = ?`, [user.email], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (existe) {
                console.log(`⚠️ Usuário ${user.nome} (${user.email}) já existe. Pulando...`);
                continue;
            }

            // 2. Se não existir, gera o hash da senha e insere
            const senhaHash = await bcrypt.hash(user.senha, 10);
            
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO usuarios (nome, email, senha_hash, cargo, telas_permitidas, filial) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [user.nome, user.email, senhaHash, user.cargo, JSON.stringify(user.telas), user.filial],
                    function(err) {
                        if (err) reject(err);
                        else {
                            console.log(`✓ Usuário ${user.nome} inserido com sucesso!`);
                            resolve();
                        }
                    }
                );
            });

        } catch (erro) {
            console.error(`❌ Erro ao processar ${user.nome}:`, erro.message);
        }
    }
    
    // Fecha o banco somente após o término de todas as operações do laço
    db.close(() => console.log('Conexão com o banco fechada.'));
}

rodarSeed();
