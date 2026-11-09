const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Koneksi Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'db_prioritas_asset'
});

db.connect(err => {
    if (err) {
        console.error('Koneksi database gagal:', err);
        return;
    }
    console.log('Terhubung ke database MySQL!');
});

const BULAN = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agt', 'sep', 'okt', 'nov', 'des'];
const KOLOM_BULAN = [...BULAN.map(m => `${m}_qty`), ...BULAN.map(m => `${m}_real`)];
const KOLOM_ASSET = ['tahun', 'prioritas_ke', 'departemen', 'nama_asset', 'alokasi', 'qty', 'harga_satuan', ...KOLOM_BULAN];

const KOLOM_REAL = BULAN.map(m => `${m}_real`);

function nilaiKolom(b, kolom) {
    return kolom.map(k => {
        if (k === 'tahun') return b.tahun || new Date().getFullYear();
        if (KOLOM_BULAN.includes(k)) return b[k] || 0;
        return b[k];
    });
}

// Token login (ditandatangani HMAC, tanpa library tambahan). Ganti rahasianya lewat variabel APP_SECRET.
const SECRET = process.env.APP_SECRET || 'ganti-rahasia-ini-dengan-teks-acak';

function buatToken(user) {
    const payload = Buffer.from(JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role || 'admin',
        departemen: user.departemen || null,
        exp: Date.now() + 12 * 60 * 60 * 1000
    })).toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    return payload + '.' + sig;
}

function auth(req, res, next) {
    const h = req.headers.authorization || '';
    const [payload, sig] = (h.startsWith('Bearer ') ? h.slice(7) : '').split('.');
    const tolak = (pesan) => res.status(401).json({ success: false, message: pesan });
    if (!payload || !sig) return tolak('Silakan login dulu.');

    const benar = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    const a = Buffer.from(sig), b = Buffer.from(benar);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return tolak('Sesi tidak valid, silakan login lagi.');

    let data;
    try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch (e) { return tolak('Sesi tidak valid, silakan login lagi.'); }
    if (!data.exp || data.exp < Date.now()) return tolak('Sesi sudah habis, silakan login lagi.');

    // Peran dan departemen selalu dibaca dari database, jadi perubahan admin langsung berlaku
    db.query('SELECT username, role, departemen FROM users WHERE id = ?', [data.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return tolak('Akun tidak ditemukan, silakan login lagi.');
        req.user = { ...data, username: rows[0].username, role: rows[0].role || 'admin', departemen: rows[0].departemen || null };
        next();
    });
}

function hanyaAdmin(req, res, next) {
    if (req.user.role === 'admin') return next();
    res.status(403).json({ success: false, message: 'Hanya admin yang boleh melakukan ini.' });
}

// Riwayat perubahan: dicatat otomatis ke tabel riwayat_perubahan (lihat buat_tabel_riwayat.sql)
function catat(user, aksi, objek, objekId, ringkasan, detail) {
    const sql = 'INSERT INTO riwayat_perubahan (user_id, username, role, aksi, objek, objek_id, ringkasan, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const nilai = [user.id || null, user.username, user.role, aksi, objek, objekId || null, ringkasan || null, detail ? JSON.stringify(detail) : null];
    db.query(sql, nilai, (err) => {
        if (err) console.error('Gagal mencatat riwayat:', err.message);
    });
}

function samaNilai(a, b) {
    if (a === null || a === undefined) a = '';
    if (b === null || b === undefined) b = '';
    if (a === b) return true;
    if ((a === '' && b !== '' && Number(b) === 0) || (b === '' && a !== '' && Number(a) === 0)) return true;
    const na = Number(a), nb = Number(b);
    if (a !== '' && b !== '' && !isNaN(na) && !isNaN(nb)) return na === nb;
    return String(a) === String(b);
}

// Daftar kolom yang berubah: [{ k: kolom, l: nilai lama, b: nilai baru }]
function bedaData(lama, kolom, baru) {
    const hasil = [];
    kolom.forEach((k, i) => {
        if (!samaNilai(lama[k], baru[i])) hasil.push({ k, l: lama[k] === undefined ? null : lama[k], b: baru[i] });
    });
    return hasil;
}

// API: Ambil semua data asset (Read)
app.get('/api/assets', auth, (req, res) => {
    db.query('SELECT * FROM prioritas_asset ORDER BY tahun DESC, prioritas_ke, id ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API: Tambah data asset baru (Create)
// Admin bebas; pengguna biasa hanya boleh menambah budget untuk departemennya sendiri (tanpa realisasi)
app.post('/api/assets', auth, (req, res) => {
    const b = req.body;

    if (req.user.role !== 'admin') {
        if (!req.user.departemen) {
            return res.status(403).json({ success: false, message: 'Akun Anda belum punya departemen.' });
        }
        b.departemen = req.user.departemen;
        KOLOM_REAL.forEach(k => { b[k] = 0; });
    }

    const query = `INSERT INTO prioritas_asset (${KOLOM_ASSET.join(', ')})
        VALUES (${KOLOM_ASSET.map(() => '?').join(', ')})`;

    db.query(query, nilaiKolom(b, KOLOM_ASSET), (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        catat(req.user, 'tambah', 'asset', result.insertId, `${b.nama_asset} (${b.departemen})`,
            { tahun: b.tahun || new Date().getFullYear(), qty: b.qty, harga_satuan: b.harga_satuan });
        res.json({ message: 'Data asset berhasil disimpan!', id: result.insertId });
    });
});

// API: Update data asset (Update)
// Pengguna biasa hanya boleh mengubah data departemennya sendiri, dan kolom realisasi tidak disentuh
app.put('/api/assets/:id', auth, (req, res) => {
    const id = req.params.id;
    const b = req.body;
    const admin = req.user.role === 'admin';

    db.query('SELECT * FROM prioritas_asset WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });

        const lama = rows[0];
        if (!admin && lama.departemen !== req.user.departemen) {
            return res.status(403).json({ success: false, message: 'Anda hanya boleh mengubah data departemen sendiri.' });
        }
        if (!admin) b.departemen = req.user.departemen;

        const kolom = admin ? KOLOM_ASSET : KOLOM_ASSET.filter(k => !KOLOM_REAL.includes(k));
        const baru = nilaiKolom(b, kolom);
        const query = `UPDATE prioritas_asset SET ${kolom.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;

        db.query(query, [...baru, id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const perubahan = bedaData(lama, kolom, baru);
            if (perubahan.length > 0) {
                catat(req.user, 'ubah', 'asset', id, `${lama.nama_asset} (${lama.departemen})`, perubahan);
            }
            res.json({ message: 'Data asset berhasil diperbarui!' });
        });
    });
});

// API: Hapus data asset (Delete) - hanya admin
app.delete('/api/assets/:id', auth, hanyaAdmin, (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM prioritas_asset WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const lama = rows[0];

        db.query('DELETE FROM prioritas_asset WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (lama) {
                catat(req.user, 'hapus', 'asset', id, `${lama.nama_asset} (${lama.departemen})`,
                    { tahun: lama.tahun, qty: lama.qty, harga_satuan: lama.harga_satuan });
            }
            res.json({ message: 'Data asset berhasil dihapus!' });
        });
    });
});

// API: Register akun baru - hanya admin
app.post('/api/register', auth, hanyaAdmin, async (req, res) => {
    const { username, password } = req.body;
    const role = req.body.role === 'user' ? 'user' : 'admin';
    const departemen = role === 'user' ? (req.body.departemen || '').trim() : null;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
    }
    if (role === 'user' && !departemen) {
        return res.status(400).json({ success: false, message: 'Pilih departemen untuk akun pengguna!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, password, role, departemen) VALUES (?, ?, ?, ?)';
        db.query(query, [username, hashedPassword, role, departemen], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: 'Username sudah digunakan, silakan pilih yang lain!' });
                }
                return res.status(500).json({ error: err.message });
            }
            catat(req.user, 'tambah', 'akun', result.insertId, `${username} (${role}${departemen ? ', ' + departemen : ''})`, null);
            res.json({ success: true, message: 'Akun berhasil dibuat!' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengenkripsi password.' });
    }
});

// API: Daftar akun - hanya admin
app.get('/api/users', auth, hanyaAdmin, (req, res) => {
    db.query('SELECT id, username, role, departemen FROM users ORDER BY role, username', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API: Ubah username, password, jenis, dan departemen akun lain - hanya admin
app.put('/api/users/:id', auth, hanyaAdmin, (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE id = ?', [req.params.id], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Akun tidak ditemukan!' });
        }

        try {
            const user = rows[0];
            const usernameBaru = (username || '').trim() || user.username;
            const role = ['admin', 'user'].includes(req.body.role) ? req.body.role : (user.role || 'admin');
            const departemen = role === 'user' ? ((req.body.departemen || '').trim() || user.departemen) : null;

            if (role === 'user' && !departemen) {
                return res.status(400).json({ success: false, message: 'Pilih departemen untuk akun pengguna!' });
            }
            if (user.id === req.user.id && role !== 'admin') {
                return res.status(400).json({ success: false, message: 'Anda tidak bisa menurunkan akun Anda sendiri.' });
            }

            const passwordBaru = password ? await bcrypt.hash(password, 10) : user.password;

            db.query('UPDATE users SET username = ?, password = ?, role = ?, departemen = ? WHERE id = ?', [usernameBaru, passwordBaru, role, departemen, user.id], (err2) => {
                if (err2) {
                    if (err2.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ success: false, message: 'Username sudah digunakan, silakan pilih yang lain!' });
                    }
                    return res.status(500).json({ error: err2.message });
                }
                const perubahan = [];
                if (usernameBaru !== user.username) perubahan.push({ k: 'username', l: user.username, b: usernameBaru });
                if (role !== (user.role || 'admin')) perubahan.push({ k: 'jenis', l: user.role || 'admin', b: role });
                if ((departemen || '') !== (user.departemen || '')) perubahan.push({ k: 'departemen', l: user.departemen || '', b: departemen || '' });
                if (password) perubahan.push({ k: 'password', l: '', b: '(diubah)' });
                if (perubahan.length > 0) catat(req.user, 'ubah', 'akun', user.id, user.username, perubahan);
                res.json({ success: true, message: 'Akun berhasil diperbarui!' });
            });
        } catch (e) {
            res.status(500).json({ error: 'Gagal memproses password.' });
        }
    });
});

// API: Riwayat perubahan - hanya admin (500 data terbaru)
app.get('/api/riwayat', auth, hanyaAdmin, (req, res) => {
    const sql = 'SELECT id, waktu, username, role, aksi, objek, objek_id, ringkasan, detail FROM riwayat_perubahan ORDER BY id DESC LIMIT 500';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const user = results[0];

            // Cocokkan password input dengan password hash di database
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.json({
                    success: true,
                    message: 'Login berhasil!',
                    token: buatToken(user),
                    user: { id: user.id, username: user.username, role: user.role || 'admin', departemen: user.departemen || null }
                });
            } else {
                res.status(401).json({ success: false, message: 'Username atau password salah!' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Username atau password salah!' });
        }
    });
});

// API: Edit akun yang sedang login
app.put('/api/account', auth, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Pengguna tidak bisa mengubah username atau password sendiri. Hubungi admin.' });
    }

    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Password saat ini wajib diisi!' });
    }

    db.query('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Akun tidak ditemukan!' });
        }

        try {
            const user = results[0];

            // Password saat ini harus cocok dulu sebelum akun boleh diubah
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(403).json({ success: false, message: 'Password saat ini salah!' });
            }

            const usernameBaru = (newUsername || '').trim() || user.username;
            const passwordBaru = newPassword ? await bcrypt.hash(newPassword, 10) : user.password;

            db.query('UPDATE users SET username = ?, password = ? WHERE id = ?', [usernameBaru, passwordBaru, user.id], (err2) => {
                if (err2) {
                    if (err2.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ success: false, message: 'Username sudah digunakan, silakan pilih yang lain!' });
                    }
                    return res.status(500).json({ error: err2.message });
                }
                const baru = { ...user, username: usernameBaru };
                const perubahan = [];
                if (usernameBaru !== user.username) perubahan.push({ k: 'username', l: user.username, b: usernameBaru });
                if (newPassword) perubahan.push({ k: 'password', l: '', b: '(diubah)' });
                if (perubahan.length > 0) catat(req.user, 'ubah', 'akun', user.id, user.username, perubahan);
                res.json({
                    success: true,
                    message: 'Akun berhasil diperbarui!',
                    token: buatToken(baru),
                    user: { id: user.id, username: usernameBaru, role: user.role || 'admin', departemen: user.departemen || null }
                });
            });
        } catch (e) {
            res.status(500).json({ error: 'Gagal memproses password.' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server berjalan pada http://localhost:3000');
});