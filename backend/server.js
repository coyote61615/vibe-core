require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Configura o Pool com SSL para o Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Criação da tabela (caso não exista)
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

// Rotas
app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/produtos", async (req, res) => {
  const { nome, preco, imagem } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO produtos (nome, preco, imagem) VALUES ($1, $2, $3) RETURNING id",
      [nome, preco, imagem]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/produtos/:id", async (req, res) => {
  const { nome, preco, imagem } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE produtos SET nome = $1, preco = $2, imagem = $3 WHERE id = $4",
      [nome, preco, imagem, id]
    );
    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/produtos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
