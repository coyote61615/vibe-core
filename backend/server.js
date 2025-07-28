require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(bodyParser.json());

// Cria tabela produtos se não existir
const createTable = `
  CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    imagem TEXT
  );
`;

pool.query(createTable)
  .then(() => console.log("Tabela 'produtos' pronta."))
  .catch(err => console.error("Erro ao criar tabela:", err));

app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.post("/produtos", async (req, res) => {
  const { nome, preco, imagem } = req.body;
  const img = imagem && imagem.trim() !== "" ? imagem : null;
  if (!nome || typeof nome !== "string" || !preco || isNaN(preco)) {
    return res.status(400).json({ error: "Nome e preço são obrigatórios e válidos." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO produtos (nome, preco, imagem) VALUES ($1, $2, $3) RETURNING id",
      [nome, preco, img]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
});

app.put("/produtos/:id", async (req, res) => {
  const { nome, preco, imagem } = req.body;
  const img = imagem && imagem.trim() !== "" ? imagem : null;
  const { id } = req.params;

  if (!nome || typeof nome !== "string" || !preco || isNaN(preco)) {
    return res.status(400).json({ error: "Nome e preço são obrigatórios e válidos." });
  }

  try {
    const result = await pool.query(
      "UPDATE produtos SET nome = $1, preco = $2, imagem = $3 WHERE id = $4",
      [nome, preco, img, id]
    );
    res.json({ updated: result.rowCount });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

app.delete("/produtos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error("Erro ao deletar produto:", err);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
