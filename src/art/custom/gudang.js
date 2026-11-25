// CONTOH paket adegan. Salin file ini untuk membuat paket sendiri, lalu daftarkan di custom/index.js.
//
// latar : (u, t, header) => ({ anchor:{x,y,s}, props:{bayangan:{x,y,s}, mata:{x,y,s}}, svg })
//         u = awalan id unik untuk gradien/filter, t = waktu animasi (detik).
//         anchor = tempat kaki tokoh (posisi kiri). Kanvas 1080 x 1920.
// objek : ({ x, y, s, t, u, bg }) => svg     (bg = hasil latar di atas, dipakai untuk menaruh objek)
import { W, H, lin, rad, r2 } from '../util.js'

export default {
  latar: {
    gudang: (u, t) => ({
      anchor: { x: 300, y: 1580, s: 1 },
      props: { bayangan: { x: 880, y: 1300, s: 1 }, mata: { x: 540, y: 900, s: 1.2 } },
      svg: `<defs>${lin(u + 'gw', 0, 0, 0, 1, [[0, '#3b3a3f'], [1, '#1f1e22']])}${rad(u + 'gl', 0.5, 0.5, 0.5, [[0, '#ffe2a0', 0.4], [1, '#ffe2a0', 0]])}</defs>` +
        `<rect width="${W}" height="1300" fill="url(#${u}gw)"/><rect y="1300" width="${W}" height="${H - 1300}" fill="#2a2724"/>` +
        `<rect x="60" y="500" width="320" height="800" fill="#4a3a2a"/><g stroke="#2b1e12" stroke-width="10"><line x1="60" y1="700" x2="380" y2="700"/><line x1="60" y1="900" x2="380" y2="900"/><line x1="60" y1="1100" x2="380" y2="1100"/></g>` +
        `<rect x="80" y="760" width="120" height="130" fill="#9b7a50"/><rect x="220" y="800" width="130" height="90" fill="#8a6a42"/><rect x="90" y="1130" width="150" height="160" fill="#9b7a50"/>` +
        `<line x1="760" y1="0" x2="760" y2="260" stroke="#111" stroke-width="5"/><path d="M700,260 h120 l-20,-50 h-80z" fill="#c9b27a"/><circle cx="760" cy="300" r="${r2(230 + Math.sin(t * 8) * 6)}" fill="url(#${u}gl)"/>`,
    }),
  },
  objek: {
    kardus: ({ x = 800, y = 1560, s = 1 }) =>
      `<g transform="translate(${x},${y}) scale(${s})"><rect x="-90" y="-130" width="180" height="130" fill="#b58b57" stroke="#6b4e2c" stroke-width="6"/><rect x="-18" y="-130" width="36" height="130" fill="#d8c08f"/></g>`,
  },
}
