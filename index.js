const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Configuração do CORS
const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Segurança adicional com Helmet
app.use(helmet());

// Limite de taxa para evitar ataques de força bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
});
app.use(limiter);

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
app.post('/send-email', [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('phone').notEmpty().withMessage('Telefone é obrigatório'),
    body('message').notEmpty().withMessage('Mensagem é obrigatória'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Erro de validação:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
    }

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
            console.error('Erro ao enviar e-mail:', error);
            return res.status(500).json({ success: false, error: error.toString() });
        }
        console.log('E-mail enviado com sucesso:', info.response);
        res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
    });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro global:', err.stack);
    res.status(500).json({ success: false, error: 'Algo deu errado!' });
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});