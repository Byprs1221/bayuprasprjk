Untuk project test satu ini , mungkin beberapa solusi yang sudah saya temukan agar alur Task A1 dan A3 bekerja dengan baik

Untuk Task A1 :

Jika di tugas tersebut ingin melakukan blok token yang sebelumnya sudah masuk , maka butuh beberapa code yang dibutuhkan

Untuk db.js

Di database tersebut hanya ada 1 database yang bernama "user", maka, untuk menampung token yang ingin di revoke
Maka dibuatkanlah table untuk "revoke_token" , gunanya agar nanti yang akan digunakan untuk menampung token yang sudah direvoke
Dan kenapa ada jti disitu, karena itu adalah Javascript Token Identifier, yang berfungsi untuk men generate sebuah token ketika si
user login melalui database id tersebut

Untuk kurang lebih seperti ini 

 CREATE TABLE IF NOT EXISTS revoke_token (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      jti           TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_revoke_token_jti ON revoke_token (jti);

 Dan untuk menghubungkan database tersebut, maka ada beberapa file yang harus dikonfigurasi
 Seperti : 
 
 authenticate.js ( sebagai alur untuk mengautentifikasi user yang login/logut ) 
 auth.controller.js ( sebagai pengendali jalannya backend dari tugas login/logout )
 auth.routes.js ( sebagai jembatan controller untuk port 4000 yang nantinya akan digunakan untuk menguji coba apakah
 bisa atau tidaknya di backend )
 
 untuk authenticate.js, saya mengisi code seperti berikut , agar mengecek/validasi ada tidaknya token tersebut
 
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, jti: payload.jti };
  
    const revoke = db.prepare('SELECT id FROM revoke_token WHERE jti = ?').get(payload.jti);

    if (revoke) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

 
 Lalu untuk auth.controller.js , sebelumnya beberapa masih ada yang kosong , untuk menghubungkan satu sama lain
 maka saya isi dengan code sebagai berikut
 
     const jti = crypto.randomUUID();
    const token = signToken({ sub: user.id, email: user.email, jti });
	
 Kenapa demikian?
 karena nantinya
 
 const jti akan memanggil si table jti tersebut , yang nantinya akan diterjemakan dari table id melalu crypto=randomUUID
 dan const token = signToken nantinya akan menghasilkan sebuah token yang berada ketika si user tersebut sudah login
 
 dan untuk funcion logoutnya , saya menggunakan ini :
 
 export async function logout(req, res) {
  try {
    const user = req.user;
    
    if (!user.jti) {
      return res.status(400).json({ error: 'Token tidak valid atau versi lama. Silakan login ulang.' });
    }

    db.prepare(`
      INSERT INTO revoke_token (jti) VALUES (?)
    `).run(user.jti);

    return res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.log("Logout Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

Keterangannya :

Untuk auth.routes.js , agar logout bisa terhubung dengan backend , saya telah menambahkan

routes.post('/logout', authentication, logout);

karena nantinya akan digunakan untuk menggunakan metode POST /api/auth/logout

Task A3 :

Untuk task A3 sebenarnya ada beberapa module yang harus di install , seperti express-rate-limit, dan penggunaannya seperti berikut

pada bagian middleware , saya isi dengan code seperti ini

import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Terlalu banyak percobaan login yang gagal. Silakan coba lagi setelah 15 menit.',
  },
});
 
 lalu pada bagian auth.route.js, saya tambahkan ini diatas tepat dibawah 
 
 import { loginLimiter } from '../middleware/loginLimiter.js';

lalu pada urutan route.post login , saya tambahkan loginLimiter, sehingga menjadi seperti ini

router.post('/login', loginLimiter, login);
 
 
 