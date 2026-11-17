const express = require('express');
const cors = require('cors');

// Importiamo il client del database PRISMA!
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

// Middleware fondamentali
app.use(cors());
// 👈 QUESTO È IL TRADUTTORE: permette al server di capire il JSON inviato nel body delle POST!
app.use(express.json());

// 1. ROTTA GET: Leggere tutti i progetti direttamente dal Database!
app.get('/api/progetti', async function(req, res) {
    try {
        // Chiediamo al Database tutti i record salvati
        const progettiDalDb = await prisma.progetto.findMany();
        res.json(progettiDalDb);
    } catch (error) {
        console.error("Errore nel database:", error);
        res.status(500).json({ errore: "Errore nel recupero dei dati" });
    }
    
});

// ROTTA POST: Salva il nuovo progetto in modo permanente nel Database!
app.post('/api/progetti', async function(req, res) {
    try {
        const { titolo, descrizione } = req.body;
        // Inseriamo il record nel Database SQL
        const nuovoProgettoSalvato = await prisma.progetto.create({
            data: {
                titolo: titolo,
                descrizione: descrizione
            }
        });
        console.log("💾 Progetto salvato permanentemente nel Database:", nuovoProgettoSalvato);
        res.status(201).json(nuovoProgettoSalvato);
    } catch (error) {
        console.error("Errore nel salvataggio:", error);
        res.status(500).json({ errore: "Impossibile salvare nel database" });
    }
});

// Avvio del server
app.listen(PORT, function() {
    console.log(`🚀 Server Full-Stack con Database attivo su http://localhost:${PORT}`);
});