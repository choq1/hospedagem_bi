const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./portal.db');

// Lista com todos os IDs que você deseja apagar
const idsParaExcluir = []; 

// Cria as interrogações correspondentes para a query (?, ?, ?, ?)
const placeholders = idsParaExcluir.map(() => '?').join(',');

db.run(`DELETE FROM usuarios WHERE id IN (${placeholders})`, idsParaExcluir, function(err) {
  if (err) {
    return console.error("Erro ao deletar:", err.message);
  }
  // Exibe a quantidade exata de linhas afetadas e removidas do banco
  console.log(`Sucesso! Foram deletados ${this.changes} usuários.`);
});

db.close();
