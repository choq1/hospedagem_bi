require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para deletar um usuário pelo email
async function deletarUsuario(email) {
    try {
        console.log(`\n🔍 Procurando usuário com email: ${email}`);
        
        // 1. Encontrar o usuário
        const { data: usuario, error: erroFind } = await supabase
            .from('usuarios')
            .select('id, nome, email')
            .eq('email', email)
            .maybeSingle();

        if (!usuario) {
            console.error(`❌ Usuário com email "${email}" não encontrado!`);
            return;
        }

        console.log(`✓ Usuário encontrado: ${usuario.nome}`);

        // 2. Deletar registros de auditoria
        console.log(`🗑️ Deletando registros de auditoria...`);
        const { error: erroAuditoria } = await supabase
            .from('auditoria')
            .delete()
            .eq('usuario_id', usuario.id);

        if (erroAuditoria) {
            console.error('❌ Erro ao deletar auditoria:', erroAuditoria.message);
            return;
        }
        console.log('✓ Registros de auditoria deletados');

        // 3. Deletar usuário
        console.log(`🔨 Deletando usuário...`);
        const { error: erroDeletar } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', usuario.id);

        if (erroDeletar) {
            console.error('❌ Erro ao deletar usuário:', erroDeletar.message);
            return;
        }

        console.log(`\n✅ Usuário ${usuario.nome} (${email}) deletado com sucesso!\n`);

    } catch (erro) {
        console.error('❌ Erro:', erro.message);
    }
}

// Função para desativar um usuário (mais seguro que deletar)
async function desativarUsuario(email) {
    try {
        console.log(`\n🔍 Procurando usuário com email: ${email}`);
        
        // 1. Encontrar o usuário
        const { data: usuario, error: erroFind } = await supabase
            .from('usuarios')
            .select('id, nome, email, ativo')
            .eq('email', email)
            .maybeSingle();

        if (!usuario) {
            console.error(`❌ Usuário com email "${email}" não encontrado!`);
            return;
        }

        if (usuario.ativo === 0) {
            console.log(`⚠️ Usuário ${usuario.nome} já está desativado.`);
            return;
        }

        console.log(`✓ Usuário encontrado: ${usuario.nome}`);

        // 2. Desativar usuário
        console.log(`⏸️ Desativando usuário...`);
        const { error: erroAtualizar } = await supabase
            .from('usuarios')
            .update({ ativo: 0 })
            .eq('id', usuario.id);

        if (erroAtualizar) {
            console.error('❌ Erro ao desativar:', erroAtualizar.message);
            return;
        }

        console.log(`\n✅ Usuário ${usuario.nome} foi desativado com sucesso!`);
        console.log('⚠️ Ele ainda pode ser reativado depois.\n');

    } catch (erro) {
        console.error('❌ Erro:', erro.message);
    }
}

// Script para rodar a partir da linha de comando
const comando = process.argv[2];
const email = process.argv[3];

if (!comando || !email) {
    console.log(`
📝 USO:
  node delete-usuario.js <comando> <email>

📌 COMANDOS:
  delete   - Deletar permanentemente o usuário
  disable  - Desativar o usuário (ele pode ser reativado)

📋 EXEMPLOS:
  node delete-usuario.js delete admin@caminho.com.br
  node delete-usuario.js disable alfred@caminho.com.br
    `);
    process.exit(1);
}

if (comando === 'delete') {
    deletarUsuario(email);
} else if (comando === 'disable') {
    desativarUsuario(email);
} else {
    console.error(`❌ Comando desconhecido: "${comando}". Use "delete" ou "disable".`);
    process.exit(1);
}
