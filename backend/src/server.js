const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ADICIONE ESTA LINHA: Ela importa as regras que você criou no arquivo do model
const Transaction = require('./models/Transaction');

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo_db:27017/monapp';

mongoose
  .connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

app.get('/', (req, res) => res.send('API do MonApp Rodando!'));

// ADICIONE ESTA ROTA TAMBÉM: Para você conseguir ver a lista de gastos depois
app.get('/transactions', async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

// ROTA PARA SALVAR NOVA TRANSAÇÃO
app.post('/transactions', async (req, res) => {
  try {
    const { description, amount, type, category } = req.body;

    const newTransaction = new Transaction({
      description,
      amount,
      type,
      category,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao salvar no banco!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));
