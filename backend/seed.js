const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run("DELETE FROM produtos"); // limpa tabela antes de inserir

  const stmt = db.prepare("INSERT INTO produtos (nome, preco, descricao, imagem) VALUES (?, ?, ?, ?)");

  stmt.run("Camiseta Vibe Core", 59.90, "Camiseta básica com logo", "https://via.placeholder.com/150");
  stmt.run("Boné Vibe Core", 39.90, "Boné preto estiloso", "https://via.placeholder.com/150");
  stmt.run("Chaveiro Vibe Core", 9.90, "Chaveiro personalizado", "https://via.placeholder.com/150");

  stmt.finalize();

  console.log("🛒 Produtos adicionados com sucesso!");
});

db.close();
