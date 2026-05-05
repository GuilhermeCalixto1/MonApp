# Usa uma imagem leve do Node.js
FROM node:20-slim

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração de pacotes primeiro
# Isso acelera o build caso você mude o código mas não as bibliotecas
COPY package*.json ./

# Instala as dependências usando o npm
RUN npm install

# Copia o restante dos arquivos do seu backend
COPY . .

# Expõe a porta que o servidor vai rodar
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]