const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nunes_sports',
    password: 'postgres',
    port: 5432,
});

// Teste de conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('✅ Conexão OK. Hora do PostgreSQL:', res.rows[0].now);
  }
});

// Rota POST para criar produtos
app.post('/produtos', async (req, res) => {
    const { nome, codigo, descricao, preco } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO produtos (nome, codigo, descricao, preco) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, codigo, descricao, preco]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// Rota GET para obter um único produto

app.get('/produtos/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM produtos WHERE id = $1', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                error: `Produto com ID ${req.params.id} não encontrado`,
                suggestion: 'Recarregue a lista de produtos'
            });
        }
        
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ 
            error: 'Erro ao buscar produto',
            details: err.message
        });
    }
});
// Rota GET para listar produtos
app.get('/produtos', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, nome, codigo, descricao, CAST(preco AS FLOAT) as preco FROM produtos ORDER BY id');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Rota PUT para atualizar produtos
app.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, codigo, descricao, preco } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE produtos SET nome = $1, codigo = $2, descricao = $3, preco = $4 WHERE id = $5 RETURNING *',
            [nome, codigo, descricao, preco, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// Rota DELETE para remover produtos
app.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM produtos WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir produto' });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

