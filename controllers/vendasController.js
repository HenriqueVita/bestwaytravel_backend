const db = require('../db');

exports.getAllVendas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vendas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendaById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vendas WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Venda não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVenda = async (req, res) => {
  const { orcamento_id, cliente_id, valor_final, data_venda, observacoes } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO vendas (orcamento_id, cliente_id, valor_final, data_venda, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orcamento_id, cliente_id, valor_final, data_venda, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVenda = async (req, res) => {
  const { orcamento_id, cliente_id, valor_final, data_venda, observacoes } = req.body;
  try {
    const result = await db.query(
      'UPDATE vendas SET orcamento_id=$1, cliente_id=$2, valor_final=$3, data_venda=$4, observacoes=$5 WHERE id=$6 RETURNING *',
      [orcamento_id, cliente_id, valor_final, data_venda, observacoes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Venda não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVenda = async (req, res) => {
  try {
    await db.query('DELETE FROM vendas WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
