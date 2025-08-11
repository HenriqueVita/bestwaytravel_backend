// routes/dashboard.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/financeiro', async (req, res) => {
  try {
    // Saldo total
    const { rows: saldoRows } = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN tipo='receita' THEN valor ELSE -valor END),0) AS saldo_total
      FROM lancamentos
      WHERE status = 'pago'
    `);

    // Receitas e despesas do mês atual
    const { rows: fluxoRows } = await pool.query(`
      SELECT tipo, COALESCE(SUM(valor),0) AS total
      FROM lancamentos
      WHERE date_trunc('month', data_vencimento) = date_trunc('month', CURRENT_DATE)
      GROUP BY tipo
    `);

    // Vendas do mês atual
    const { rows: vendasRows } = await pool.query(`
      SELECT COUNT(*)::int AS total_vendas,
             COALESCE(SUM(valor_total),0) AS valor_vendas,
             COALESCE(SUM(valor_comissao),0) AS total_comissao
      FROM vendas
      WHERE date_trunc('month', data_venda) = date_trunc('month', CURRENT_DATE)
    `);

    // Próximos pagamentos (despesas a vencer)
    const { rows: proximosPagamentos } = await pool.query(`
      SELECT descricao, valor, data_vencimento
      FROM lancamentos
      WHERE tipo='despesa' AND status='pendente'
      ORDER BY data_vencimento ASC
      LIMIT 5
    `);

    // Próximos recebimentos (receitas a receber)
    const { rows: proximosRecebimentos } = await pool.query(`
      SELECT descricao, valor, data_vencimento
      FROM lancamentos
      WHERE tipo='receita' AND status='pendente'
      ORDER BY data_vencimento ASC
      LIMIT 5
    `);

    res.json({
      saldo_total: saldoRows[0].saldo_total,
      fluxo_mes: fluxoRows,
      vendas_mes: vendasRows[0],
      proximos_pagamentos: proximosPagamentos,
      proximos_recebimentos: proximosRecebimentos
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
