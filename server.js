const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');       
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// Chiave segreta del server
const JWT_SECRET = "la-mia-chiave-segretissima-2026";

app.use(cors());
app.use(express.json());

// ==========================================
// 🛡️ ROTTE DI AUTENTICAZIONE & SICUREZZA
// ==========================================

// 1. REGISTRAZIONE NUOVO UTENTE (SIGNUP)
app.post('/api/auth/register', async function(req, res) {
    try {
        const { email, password } = req.body;

        // Controllo: l'utente esiste già?
        const utenteEsistente = await prisma.utente.findUnique({
            where: { email: email }
        });

        if (utenteEsistente) {
            return res.status(400).json({ errore: "Email già registrata nel sistema!" });
        }

        // 👈 LA MAGIA DI BCRYPT: Frulliamo la password!
        const salt = await bcrypt.genSalt(10); // Aggiunge del "sale" (caratteri casuali anti-hacker)
        const passwordHash = await bcrypt.hash(password, salt); // Genera l'hash a senso unico

        // Salviamo l'utente nel Database con la password CIFRATA
        const nuovoUtente = await prisma.utente.create({
            data: {
                email: email,
                password: passwordHash // Salviamo il frullato!
            }
        });

        console.log(`👤 Nuovo utente registrato con successo: ${nuovoUtente.email}`);
        res.status(201).json({ messaggio: "Utente registrato con successo!" });

    } catch (errore) {
        console.error("Errore nella registrazione:", errore);
        res.status(500).json({ errore: "Errore durante la registrazione" });
    }
});

// 2. ACCESSO UTENTE (LOGIN)
app.post('/api/auth/login', async function(req, res) {
    try {
        const { email, password } = req.body;

        // Cerchiamo l'utente nel database
        const utente = await prisma.utente.findUnique({
            where: { email: email }
        });

        // Se l'email non esiste nel DB
        if (!utente) {
            return res.status(400).json({ errore: "Credenziali non valide!" });
        }

        // 👈 VERIFICA DELLA PASSWORD: Confrontiamo la parola con il frullato nel DB!
        const passwordValida = await bcrypt.compare(password, utente.password);

        if (!passwordValida) {
            return res.status(400).json({ errore: "Credenziali non valide!" });
        }

        // 👈 EMISSIONE DEL BRACCIALETTO VIP (Token JWT)
        const token = jwt.sign(
            { id: utente.id, email: utente.email }, // Dati dentro il token
            JWT_SECRET,                             // Chiave per sigillarlo
            { expiresIn: '1h' }                     // Il token scade dopo 1 ora per sicurezza
        );

        console.log(`🔓 Login effettuato con successo per: ${utente.email}`);
        res.json({
            messaggio: "Login effettuato con successo!",
            token: token // Inviamo il token al client!
        });

    } catch (errore) {
        console.error("Errore nel login:", errore);
        res.status(500).json({ errore: "Errore durante il login" });
    }
});

// ==========================================
// ROTTE PROGETTI (Già esistenti)
// ==========================================
app.get('/api/progetti', async function(req, res) {
    const progetti = await prisma.progetto.findMany();
    res.json(progetti);
});

app.post('/api/progetti', async function(req, res) {
    const nuovo = await prisma.progetto.create({
        data: req.body
    });
    res.status(201).json(nuovo);
});

app.listen(PORT, function() {
    console.log(`🚀 Server Sicuro attivo su http://localhost:${PORT}`);
});