const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./portal.db', (err) => {
    if (err) console.error(err);
    else console.log('Conectado ao SQLite');
});

db.serialize(() => {
    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            cargo TEXT NOT NULL,
            telas_permitidas TEXT NOT NULL,
            filial TEXT NOT NULL,
            ativo INTEGER DEFAULT 1
        )
    `);

    // Tabela de relatórios (mapeamento de IDs do Power BI)
    db.run(`
        CREATE TABLE IF NOT EXISTS relatorios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chave TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            report_id TEXT NOT NULL,
            descricao TEXT
        )
    `);

    // Tabela de auditoria (log de acessos)
    db.run(`
        CREATE TABLE IF NOT EXISTS auditoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            relatorio TEXT,
            data_acesso DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);

    console.log('Tabelas criadas com sucesso!');
});

db.close();