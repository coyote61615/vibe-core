import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // IMPORTANTE para Render e outros serviços que exigem SSL
});

app.use(cors());
app.use(express.json());

// Criar tabela produtos se não existir
async function criarTabela() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco NUMERIC(10, 2) NOT NULL CHECK(preco >= 0),
        imagem TEXT
      );
    `);
    console.log("Tabela produtos pronta.");
  } catch (error) {
    console.error("Erro ao criar tabela:", error);
  }
}

criarTabela();

// GET todos produtos
app.get("/produtos", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// POST novo produto
app.post("/produtos", async (req, res) => {
  try {
    const { nome, preco, imagem } = req.body;
    if (!nome || preco == null || preco < 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }
    const resultado = await pool.query(
      "INSERT INTO produtos (nome, preco, imagem) VALUES ($1, $2, $3) RETURNING *",
      [nome, preco, imagem || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
});

// PUT editar produto
app.put("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, imagem } = req.body;
    if (!nome || preco == null || preco < 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }
    const resultado = await pool.query(
      "UPDATE produtos SET nome = $1, preco = $2, imagem = $3 WHERE id = $4 RETURNING *",
      [nome, preco, imagem || null, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    res.status(500).json({ error: "Erro ao editar produto" });
  }
});

// DELETE produto
app.delete("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ message: "Produto excluído" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

