'use client';

import { useState } from 'react';

export default function CustomerServicePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setShowPopup(true);

    setRating(0);
    setName('');
    setEmail('');
    setMessage('');

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <main style={{ padding: '40px'}}>
      <h1>Layanan Pelanggan</h1>
      <p>
        Halaman ini akan menyediakan bantuan, panduan, serta solusi untuk memastikan
        bahwa sistem POS Anda selalu berjalan dengan lancar.
      </p>

      <hr style={{ margin: '30px 0' }} />

      {/* info */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}
      >
        {/* faq */}
        <div
          style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '280px',
          }}
        >
          <h2>❓ Pertanyaan yang Sering Ditanyakan(FAQ)</h2>

          <p><strong>1. Apa itu sistem POS?</strong></p>
          <p>
            POS adalah sistem untuk membantu transaksi penjualan, pengelolaan
            stok, laporan keuangan, dan manajemen pelanggan.
          </p>

          <p><strong>2. Apakah bisa digunakan di lebih dari satu perangkat?</strong></p>
          <p>
            Ya, sistem POS kami mendukung penggunaan multi-perangkat dalam satu
            akun.
          </p>

          <p><strong>3. Apakah sistem POS harus selalu online?</strong></p>
          <p>
            Internet dibutuhkan untuk sinkronisasi data, Jadi sistem POS itu perlu selalu online
          </p>

          <p><strong>4. Bagaimana cara mendaftarkan akun?</strong></p>
          <p>
            Anda dapat menggunakan fitur register pada halaman login kami.
          </p>
        </div>

        {/* layanan */}
        <div
          style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '280px',
          }}
        >
          <h2>🛠 Layanan Dukungan</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>✅ Bantuan Live Chat</li>
            <li>✅ Dukungan Teknis Jarak Jauh</li>
            <li>✅ Instalasi & Pelatihan di Lokasi</li>
            <li>✅ Pembaruan & Pemeliharaan Sistem</li>
          </ul>

          <p style={{ marginTop: '15px' }}>
            <strong>📞 Dukungan Darurat:</strong><br />
            Hotline: +62 811-2222-9999<br />
            Email: emergency@posmart.com
          </p>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      {/* saran */}
      <section>
        <h2>Kotak Saran</h2>
        <p>
          Bantu kami meningkatkan sistem POS dengan memberikan saran, masukan,
          atau permintaan fitur baru.
        </p>

        {/* ⭐ STAR RATING */}
        <div style={{ marginBottom: '12px' }}>
          <p><strong>Penilaian Layanan:</strong></p>
          <div style={{ display: 'flex', gap: '6px', fontSize: '24px', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  color: star <= rating ? 'gold' : '#ccc',
                }}
              >
                ★
              </span>
            ))}
          </div>
          {rating > 0 && <p>Anda memberi {rating} bintang</p>}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
          }}
        >
          <input
            type="text"
            placeholder="Nama (Opsional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email (Opsional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            placeholder="Tulis saran Anda di sini..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">
            Kirim Masukan
          </button>
        </form>
      </section>

      {/* ✅ POPUP MESSAGE */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: 'black',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
          }}
        >
           Masukan berhasil dikirim!
        </div>
      )}
    </main>
  );
}
