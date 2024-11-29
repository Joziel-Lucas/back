import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import conectarAoBanco from './src/config/db.js';

// Carrega as variáveis de ambiente do .env
dotenv.config();

// Configuração do multer para upload de arquivos na pasta 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta onde as imagens serão armazenadas
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome único para o arquivo
  }
});

const upload = multer({ storage: storage });

async function startServer() {
  try {
    const conexao = await conectarAoBanco(process.env.STRING_CONEXAO);
    console.log("Conectado ao banco de dados com sucesso!");

    const app = express();
    app.use(express.json());
    app.use(express.static('uploads')); // Permitir acesso público aos arquivos na pasta 'uploads'

    // Função para obter todos os posts
    async function getTodosPosts() {
      const db = conexao.db("Cluster0"); // Altere para o nome correto do seu banco
      const colecao = db.collection("posts");
      return await colecao.find().toArray();
    }

    // Rota para retornar todos os posts
    app.get("/posts", async (req, res) => {
      try {
        const posts = await getTodosPosts();
        res.status(200).json(posts);
      } catch (error) {
        res.status(500).json({ error: "Erro ao buscar posts." });
      }
    });

    // Rota para upload de imagem e salvar referência no banco
    app.post("/posts", upload.single('imagem'), async (req, res) => {
      try {
        const { descricao } = req.body;
        const imagem = req.file.path;

        const db = conexao.db("Cluster0");
        const colecao = db.collection("posts");

        const novoPost = {
          descricao,
          imagem
        };

        await colecao.insertOne(novoPost);

        res.status(201).json({ message: "Post criado com sucesso!", post: novoPost });
      } catch (error) {
        res.status(500).json({ error: "Erro ao criar post." });
      }
    });

    // Iniciar o servidor
    app.listen(3000, () => {
      console.log("Servidor escutando na porta 3000...");
    });

  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);
    process.exit(1);
  }
}

startServer();
