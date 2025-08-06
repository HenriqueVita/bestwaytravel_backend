const db = require('../db');

// GET /api/clientes
exports.getAllClientes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/clientes/:id
exports.getClienteById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/clientes
exports.createCliente = async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/clientes/:id
exports.updateCliente = async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const result = await db.query(
      'UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *',
      [nome, email, telefone, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/clientes/:id
exports.deleteCliente = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
