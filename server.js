const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./db'); // MySQL bağlantısı

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// Basit test
app.get('/', (req, res) => {
    res.send('Adisyon Sistemi Backend Çalışıyor!');
});

// ==================
// Kullanıcı Endpoints
// ==================
app.get('/users', (req, res) => {
    db.query('SELECT * FROM kullanicilar', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/users', (req, res) => {
    const { isim, email, sifre, rol } = req.body;
    const sql = 'INSERT INTO kullanicilar (isim, email, sifre, rol) VALUES (?, ?, ?, ?)';
    db.query(sql, [isim, email, sifre, rol], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Kullanıcı eklendi!');
    });
});

// ==================
// Masa Endpoints
// ==================
app.get('/masalar', (req, res) => {
    db.query('SELECT * FROM masalar', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/masalar', (req, res) => {
    const { numara } = req.body;
    const sql = 'INSERT INTO masalar (numara, durum) VALUES (?, "bos")';
    db.query(sql, [numara], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Masa eklendi!');
    });
});

app.put('/masalar/:id', (req, res) => {
    const { durum } = req.body;
    const temizDurum = (durum || '').trim().toLowerCase();
    if (temizDurum !== 'bos' && temizDurum !== 'dolu') {
        return res.status(400).send("Geçersiz durum değeri!");
    }

    db.query("UPDATE masalar SET durum=? WHERE numara=?",
        [temizDurum, req.params.id],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Veritabanı hatası!");
            } else {
                res.send("Masa durumu güncellendi.");
            }
        }
    );
});


app.delete('/masalar/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM masalar WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Masa silindi!');
    });
});

// ==================
// Ürün Endpoints
// ==================
app.get('/urunler', (req, res) => {
    db.query('SELECT * FROM urunler', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/urunler', (req, res) => {
    const { isim, kategori, fiyat, stok } = req.body;
    const sql = 'INSERT INTO urunler (isim, kategori, fiyat, stok) VALUES (?, ?, ?, ?)';
    db.query(sql, [isim, kategori, fiyat, stok], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Ürün eklendi!');
    });
});

app.put('/urunler/:id', (req, res) => {
    const { id } = req.params;
    const { isim, kategori, fiyat, stok } = req.body;
    const sql = 'UPDATE urunler SET isim=?, kategori=?, fiyat=?, stok=? WHERE id=?';
    db.query(sql, [isim, kategori, fiyat, stok, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Ürün güncellendi!');
    });
});

app.delete('/urunler/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM urunler WHERE id=?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Ürün silindi!');
    });
});

// ==================
// Sipariş Endpoints
// ==================
app.get('/siparisler', (req, res) => {
    const sql = `
        SELECT s.id, s.masa_id, s.kullanici_id, s.toplam_tutar, s.durum, s.created_at,
               sd.urun_id, sd.adet, sd.ara_tutar, u.isim AS urun_adi
        FROM siparisler s
        JOIN siparis_detay sd ON s.id = sd.siparis_id
        JOIN urunler u ON sd.urun_id = u.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("SQL HATASI:", err); // Konsola yazsın
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// Masa bazlı siparişleri listele
app.get('/siparisler/masa/:masa_id', (req, res) => {
    const { masa_id } = req.params;
    const sql = `
        SELECT s.id, s.toplam_tutar, s.durum, s.created_at,
               sd.urun_id, sd.adet, sd.ara_tutar, u.isim AS urun_adi
        FROM siparisler s
        JOIN siparis_detay sd ON s.id = sd.siparis_id
        JOIN urunler u ON sd.urun_id = u.id
        WHERE s.masa_id = ?
    `;
    db.query(sql, [masa_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Yeni sipariş ekle
app.post('/siparisler', (req, res) => {
    const { masa_id, kullanici_id, urunler } = req.body;
    console.log("GELEN BODY:", req.body); // Ekrana bas

    if (!urunler || urunler.length === 0) {
        return res.status(400).send('Sipariş boş olamaz.');
    }

    const sqlSiparis = 'INSERT INTO siparisler (masa_id, kullanici_id, toplam_tutar, durum) VALUES (?, ?, 0, "hazırlanıyor")';
    db.query(sqlSiparis, [masa_id, kullanici_id || null], (err, result) => {
        if (err) {
            console.error("SİPARİŞ EKLEME HATASI:", err);
            return res.status(500).json({ error: err.message });
        }
        const siparis_id = result.insertId;
        let toplam = 0;

        const detayQueries = urunler.map(u => {
            return new Promise((resolve, reject) => {
                db.query('SELECT fiyat FROM urunler WHERE id=?', [u.urun_id], (err, rows) => {
                    if (err) return reject(err);
                    if (!rows || rows.length === 0) return reject(new Error("Ürün bulunamadı"));
                    const ara_tutar = rows[0].fiyat * u.adet;
                    toplam += ara_tutar;
                    db.query(
                        'INSERT INTO siparis_detay (siparis_id, urun_id, adet, ara_tutar) VALUES (?, ?, ?, ?)',
                        [siparis_id, u.urun_id, u.adet, ara_tutar],
                        (err2) => {
                            if (err2) reject(err2);
                            else resolve();
                        }
                    );
                });
            });
        });

        Promise.all(detayQueries)
            .then(() => {
                db.query('UPDATE siparisler SET toplam_tutar=? WHERE id=?', [toplam, siparis_id]);
                db.query('UPDATE masalar SET durum="dolu" WHERE id=?', [masa_id]);
                res.send('Sipariş oluşturuldu!');
            })
            .catch(err => {
                console.error("DETAY EKLEME HATASI:", err);
                res.status(500).json({ error: err.message });
            });
    });
});


// Sipariş durumunu güncelle (hazırlanıyor, teslim edildi)
app.put('/siparisler/:id/durum', (req, res) => {
    const { id } = req.params;
    const { durum } = req.body;
    db.query('UPDATE siparisler SET durum=? WHERE id=?', [durum, id], (err) => {
        if (err) return res.status(500).send(err);

        // Sipariş teslim edildiyse masayı boşalt
        if (durum === 'teslim edildi') {
            db.query('UPDATE masalar SET durum="bos" WHERE id=(SELECT masa_id FROM siparisler WHERE id=?)', [id]);
        }

        res.send('Sipariş durumu güncellendi!');
    });
});

// ==================
// Server Başlat
// ==================
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));
