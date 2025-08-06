const db = require('../db');

exports.getAllFaturas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM faturas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFaturaById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM faturas WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Fatura não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFatura = async (req, res) => {
  const { venda_id, valor, vencimento, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO faturas (venda_id, valor, vencimento, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [venda_id, valor, vencimento, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFatura = async (req, res) => {
  const { venda_id, valor, vencimento, status } = req.body;
  try {
    const result = await db.query(
      'UPDATE faturas SET venda_id=$1, valor=$2, vencimento=$3, status=$4 WHERE id=$5 RETURNING *',
      [venda_id, valor, vencimento, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Fatura não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFatura = async (req, res) => {
  try {
    await db.query('DELETE FROM faturas WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
