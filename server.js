const express = require("express");
const path = require("path");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(cors());

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, "public")));

// Endpoint untuk membuat shortlink
app.post("/shorten", async (req, res) => {
    const { longUrl, slug } = req.body;
    if (!longUrl) return res.status(400).json({ error: "URL tidak boleh kosong" });

    const shortId = slug || Math.random().toString(36).substring(7);
    const shortUrl = `${req.protocol}://${req.get("host")}/${shortId}`;

    await db.collection("shortlinks").doc(shortId).set({ longUrl });

    res.json({ shortUrl });
});

// Endpoint untuk mengarahkan user ke URL asli
app.get("/:slug", async (req, res) => {
    const slug = req.params.slug;
    const doc = await db.collection("shortlinks").doc(slug).get();

    if (!doc.exists) {
        return res.status(404).send("Link tidak ditemukan.");
    }

    res.redirect(doc.data().longUrl);
});

// Jalankan server di port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
