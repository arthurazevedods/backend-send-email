const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Configuração do CORS
const corsOptions = {
    origin: process.env.FRONT_END_URL || "https://arthurazevedods.vercel.app/", // URL do frontend
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200, // Para navegadores mais antigos
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // E-mail do remetente
        pass: process.env.EMAIL_PASS, // Senha do remetente
    },
});

// Rota para enviar e-mail
app.post('/send-email', (req, res) => {
    const { name, email, phone, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // E-mail do destinatário
        subject: 'Novo contato do formulário',
        text: `
            Nome: ${name}
            Email: ${email}
            Telefone: ${phone}
            Mensagem: ${message}
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, error: error.toString() });
        }
        res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
    });
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});