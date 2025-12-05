'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setShowPopup(true);

    setName('');
    setEmail('');
    setMessage('');

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <main style={{ padding: '40px'}}>
      <h1>Kontak kami</h1>
      <p>
        Butuh bantuan dengan sistem POS kami? Jangan ragu untuk menghubungi kami melalui informasi di bawah ini. Tim dukungan kami selalu siap membantu Anda.
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
        <div
          style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '280px',
          }}
        >
          <h2>🕒 Jam Kerja</h2>
          <ul>
            <li>Senin - Jumat: 09:00 - 18:00</li>
            <br />
            <li>Sabtu: 10:00 - 15:00</li>
            <br />
            <li>Minggu & Hari Libur: Tutup</li>
          </ul>
        </div>

        <div
          style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '280px',
          }}
        >
          <h2>📞 Kontak & Info</h2>
          <ul>
            <li>Email: support@posmart.com</li>
            <li>Phone: +62 123-3456-7890</li>
            <li>WhatsApp: +62 098-9876-5432</li>
          </ul>

          <p style={{ marginTop: '10px' }}>
            <strong>Alamat Kantor:</strong><br />
            Jl. Terbesar dan Terkenal No. 45,<br />
            Kota Besar, Indonesia
          </p>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      {/* form */}
      <section>
        <h2>Kirim Pesan kepada Kami</h2>

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
            placeholder="Nama Kamu"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email kamu"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            placeholder="Isi Pesan"
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">Send Message</button>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
          *Pesan Anda akan dikirim langsung ke tim dukungan kami.
          </p>
        </form>
      </section>

      {/* Popup Message */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: 'grey',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
          }}
        >
         Pesan berhasil dikirim!
        </div>
      )}
    </main>
  );
}
