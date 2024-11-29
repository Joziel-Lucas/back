import { MongoClient } from 'mongodb';

async function conectarAoBanco(stringConexao) {
  let mongoClient;

  try {
    mongoClient = new MongoClient(stringConexao);
    console.log('Conectando ao banco de dados...');
    await mongoClient.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    
    return mongoClient;
  } catch (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro);
    throw erro;
  }
}

export default conectarAoBanco;
