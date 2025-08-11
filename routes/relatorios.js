// src/routes/relatorios.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// fluxo de caixa agrupado (por mês)
router.get('/fluxo', async (req, res, next) => {
  try {
    const { start, end } = req.query;

    // SQL que agrupa por mês/ano
    let q = `
      SELECT to_char(date_trunc('month', data_vencimento), 'Mon YYYY') as mes,
             SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receita,
             SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesa
      FROM lancamentos
    `;
    const params = [];
    const where = [];
    if (start) { params.push(start); where.push(`data_vencimento >= $${params.length}`); }
    if (end) { params.push(end); where.push(`data_vencimento <= $${params.length}`); }
    if (where.length) q += ' WHERE ' + where.join(' AND ');
    q += ' GROUP BY date_trunc(\'month\', data_vencimento) ORDER BY date_trunc(\'month\', data_vencimento) ASC';

    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// relatório diário consolidado (por data): ?date=YYYY-MM-DD (padrão: hoje)
router.get('/caixa-diario', async (req, res, next) => {
  try {
    const { date } = req.query;
    const day = date ? date : new Date().toISOString().split('T')[0];

    // total entradas e saídas no dia
    const q = `
      SELECT
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_saidas
      FROM lancamentos
      WHERE date(data_vencimento) = $1
    `;
    const { rows } = await db.query(q, [day]);
    const totals = rows[0];

    // obter caixa aberto no dia (se houver)
    const { rows: caixaRows } = await db.query(
      `SELECT * FROM caixa WHERE date(data_abertura) = $1 ORDER BY data_abertura DESC LIMIT 1`, [day]
    );

    res.json({
      data: day,
      caixa: caixaRows[0] || null,
      totalEntradas: parseFloat(totals.total_entradas || 0),
      totalSaidas: parseFloat(totals.total_saidas || 0),
      saldoPrevisto: ( (caixaRows[0] ? parseFloat(caixaRows[0].saldo_inicial) : 0) + parseFloat(totals.total_entradas || 0) - parseFloat(totals.total_saidas || 0) )
    });
  } catch (err) {
    next(err);
  }
});

// despesas por categoria
router.get('/categorias', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    let q = `SELECT categoria, SUM(valor) as total FROM lancamentos WHERE tipo = 'despesa'`;
    const params = [];
    const where = [];
    if (start) { params.push(start); where.push(`data_vencimento >= $${params.length}`); }
    if (end) { params.push(end); where.push(`data_vencimento <= $${params.length}`); }
    if (where.length) q += ' AND ' + where.join(' AND ');
    q += ' GROUP BY categoria ORDER BY total DESC';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
