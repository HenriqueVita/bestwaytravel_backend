import db from '../db/index.js';

export async function getAllLancamentos (req, res, next) {
  try {
    const { start, end, tipo, status } = req.query;
    let where = [];
    let params = [];

    if (start) {
      params.push(start);
      where.push(`data_vencimento >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      where.push(`data_vencimento <= $${params.length}`);
    }
    if (tipo) {
      params.push(tipo);
      where.push(`tipo = $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }

    const q = `
      SELECT * FROM lancamentos
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY data_vencimento DESC
    `;
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getLancamentosById (req, res, next) {
  try {
    const { rows } = await db.query('SELECT * FROM lancamentos WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createLancamento(req, res, next) {
  try {
    const { tipo, descricao, categoria, valor, dataVencimento, status, data } = req.body;

    if (!tipo || !descricao || !categoria || !valor || !dataVencimento || !status) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // verificar caixa aberto
    const { rows: caixaAberto } = await db.query("SELECT * FROM caixa WHERE status = 'aberto' ORDER BY data_abertura DESC LIMIT 1");
    if (!caixaAberto[0]) {
      return res.status(400).json({ error: 'Não é possível lançar. Não há caixa aberto.' });
    }

    const insertQ = `
      INSERT INTO lancamentos (tipo, descricao, categoria, valor, data_vencimento, status, data)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `;
    const params = [tipo, descricao, categoria, valor, dataVencimento, status, data];
    const { rows } = await db.query(insertQ, params);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateLancamento(req, res, next) {
  try {
    const fields = [];
    const params = [];
    let idx = 1;
    for (const key of ['tipo','descricao','categoria','valor','dataVencimento','dataPagamento','status']) {
      if (req.body[key] !== undefined) {
        const col = key === 'dataVencimento' ? 'data_vencimento' : (key === 'dataPagamento' ? 'data_pagamento' : key);
        fields.push(`${col} = $${idx}`);
        params.push(req.body[key]);
        idx++;
      }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    params.push(req.params.id);
    const q = `UPDATE lancamentos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const { rows } = await db.query(q, params);
    if (!rows[0]) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteLancamento (req, res, next) {
  try {
    const { rows } = await db.query('DELETE FROM lancamentos WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json({ message: 'Lançamento deletado', lancamento: rows[0] });
  } catch (err) {
    next(err);
  }
}