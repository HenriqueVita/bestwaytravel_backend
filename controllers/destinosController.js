const db = require('../db');

exports.getAllDestinos = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM destinos ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDestinoById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM destinos WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Destino não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDestino = async (req, res) => {
  const { nome, pais, preco_medio } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO destinos (nome, pais, preco_medio) VALUES ($1, $2, $3) RETURNING *',
      [nome, pais, preco_medio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDestino = async (req, res) => {
  const { nome, pais, preco_medio } = req.body;
  try {
    const result = await db.query(
      'UPDATE destinos SET nome=$1, pais=$2, preco_medio=$3 WHERE id=$4 RETURNING *',
      [nome, pais, preco_medio, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Destino não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDestino = async (req, res) => {
  try {
    await db.query('DELETE FROM destinos WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
