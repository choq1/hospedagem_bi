require('dotenv').config();

async function criarTabelas() {
    try {
        console.log('📝 SQL PARA CRIAR AS TABELAS NO SUPABASE\n');
        console.log('Copie todo o SQL abaixo e cole no SQL Editor do Supabase:\n');
        console.log('='.repeat(80));
        
        const sql = `-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    cargo TEXT NOT NULL,
    telas_permitidas JSONB NOT NULL,
    filial TEXT NOT NULL,
    ativo INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de relatórios (mapeamento de IDs do Power BI)
CREATE TABLE IF NOT EXISTS relatorios (
    id BIGSERIAL PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    report_id TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de auditoria (log de acessos)
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    relatorio TEXT,
    data_acesso TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_data ON auditoria(data_acesso);`;
        
        console.log(sql);
        console.log('\n' + '='.repeat(80));
        console.log('\n✅ PRÓXIMOS PASSOS:');
        console.log('1. Acesse: https://app.supabase.com/');
        console.log('2. Selecione seu projeto "portal-bi"');
        console.log('3. Vá para "SQL Editor" no menu esquerdo');
        console.log('4. Clique em "New Query"');
        console.log('5. Cole o SQL acima');
        console.log('6. Clique em "Run" ou aperte Ctrl+Enter');
        console.log('7. Aguarde a confirmação de sucesso\n');
        
    } catch (erro) {
        console.error('❌ Erro:', erro.message);
    }
}

criarTabelas();