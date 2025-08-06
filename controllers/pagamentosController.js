import db from '../db/index.js';

export async function getAllPagamentos(req, res) {
  try {
    const result = await db.query('SELECT * FROM pagamentos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPagamentoById(req, res) {
  try {
    const result = await db.query('SELECT * FROM pagamentos WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPagamento(req, res) {
  const { fatura_id, data_pagamento, valor_pago, forma_pagamento } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO pagamentos (fatura_id, data_pagamento, valor_pago, forma_pagamento) VALUES ($1, $2, $3, $4) RETURNING *',
      [fatura_id, data_pagamento, valor_pago, forma_pagamento]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePagamento(req, res) {
  const { fatura_id, data_pagamento, valor_pago, forma_pagamento } = req.body;
  try {
    const result = await db.query(
      'UPDATE pagamentos SET fatura_id=$1, data_pagamento=$2, valor_pago=$3, forma_pagamento=$4 WHERE id=$5 RETURNING *',
      [fatura_id, data_pagamento, valor_pago, forma_pagamento, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePagamento(req, res) {
  try {
    await db.query('DELETE FROM pagamentos WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
