const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Exemplo de leitura dos produtos
db.all("SELECT * FROM produtos", [], (err, rows) => {
  if (err) {
    console.error("Erro ao consultar banco:", err.message);
    return;
  }
  console.log("Produtos cadastrados:");
  console.log(rows);
});

db.close();
