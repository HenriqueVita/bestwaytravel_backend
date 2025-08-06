import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import clientesRoutes from './routes/clientes.js';
import orcamentosRoutes from './routes/orcamentos.js';
import vendasRoutes from './routes/vendas.js';
import faturasRoutes from './routes/faturas.js';
import pagamentosRoutes from './routes/pagamentos.js';
import usuariosRoutes from './routes/usuarios.js';
import destinosRoutes from './routes/destinos.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/clientes', clientesRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/faturas', faturasRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/destinos', destinosRoutes);

app.get('/', (req, res) => {
  res.send('API da Agência de Viagens está no ar!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
