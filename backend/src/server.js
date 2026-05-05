const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// A URL de conexão usa o nome do serviço definido no docker-compose ('mongo_db')
const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo_db:27017/monapp';

mongoose
  .connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

app.get('/', (req, res) => res.send('API do MonApp Rodando!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));
