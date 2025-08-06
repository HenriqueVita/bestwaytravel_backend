import db from '../db/index.js';

export async function getAllOrcamentos(req, res) {
  try {
    const result = await db.query('SELECT * FROM orcamentos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrcamentoById(req, res) {
  try {
    const result = await db.query('SELECT * FROM orcamentos WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createOrcamento(req, res) {
  const { cliente_id, destino, data_viagem, valor_estipulado, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO orcamentos (cliente_id, destino, data_viagem, valor_estipulado, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cliente_id, destino, data_viagem, valor_estipulado, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateOrcamento(req, res) {
  const { cliente_id, destino, data_viagem, valor_estipulado, status } = req.body;
  try {
    const result = await db.query(
      'UPDATE orcamentos SET cliente_id=$1, destino=$2, data_viagem=$3, valor_estipulado=$4, status=$5 WHERE id=$6 RETURNING *',
      [cliente_id, destino, data_viagem, valor_estipulado, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteOrcamento(req, res) {
  try {
    await db.query('DELETE FROM orcamentos WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
