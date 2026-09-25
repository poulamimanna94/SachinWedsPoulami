import { CSSProperties } from 'react'

type EntryGateProps = {
  opening: boolean
  onOpen: () => void
  tr: (en: string, hi: string, bn: string) => string
}

// Pearls strung along a quadratic curve from (x0,y0) through (cx,cy) to (x1,y1).
const pearlStrand = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1
    return { x, y, r: 2.6 + Math.sin(t * Math.PI) * 1.6 }
  })

const Rose = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 6 }, (_, i) => (
      <ellipse key={i} cx="0" cy="-15" rx="14" ry="17" fill="url(#gate-petal)" stroke="#997A15" strokeWidth=".8" transform={`rotate(${i * 60})`} />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <ellipse key={i} cx="0" cy="-8" rx="9" ry="11" fill="url(#gate-petal)" stroke="#997A15" strokeWidth=".8" transform={`rotate(${i * 72 + 30})`} />
    ))}
    <circle r="8" fill="#F3E5AB" stroke="#997A15" strokeWidth=".8" />
    <path d="M-4 0 C-4 -5 4 -5 4 0 C4 3 -1 4 -2 1" fill="none" stroke="#997A15" strokeWidth=".9" />
  </g>
)

const Leaf = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <path
    d="M0 0 C10 -10 30 -10 44 0 C30 10 10 10 0 0 Z M4 0 L40 0"
    transform={`translate(${x} ${y}) rotate(${r})`}
    fill="#B8922A"
    stroke="#7A5E10"
    strokeWidth=".8"
  />
)

// One floral + pearl corner cluster; flipped with CSS for the other corners.
const FloralCorner = ({ className }: { className: string }) => (
  <svg className={`gate-floral ${className}`} viewBox="0 0 220 260" aria-hidden="true">
    <Leaf x={70} y={40} r={20} />
    <Leaf x={30} y={110} r={70} />
    <Leaf x={110} y={60} r={-20} />
    <Leaf x={20} y={170} r={95} />
    {pearlStrand(8, 40, 60, 150, 20, 250, 22).map((p, i) => (
      <circle key={`a${i}`} cx={p.x} cy={p.y} r={p.r} fill="url(#gate-pearl)" />
    ))}
    {pearlStrand(90, 8, 150, 50, 200, 20, 14).map((p, i) => (
      <circle key={`b${i}`} cx={p.x} cy={p.y} r={p.r * .8} fill="url(#gate-pearl)" />
    ))}
    <Rose x={50} y={52} s={1.35} />
    <Rose x={112} y={30} s={.8} />
    <Rose x={28} y={128} s={.75} />
    <circle cx="88" cy="92" r="5" fill="url(#gate-pearl)" />
    <circle cx="140" cy="80" r="3.5" fill="url(#gate-pearl)" />
    <circle cx="60" cy="190" r="4" fill="url(#gate-pearl)" />
  </svg>
)

// Wavy-edged wax seal; each door carries one half so the seal splits as they open.
const sealPath = (() => {
  const points = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2
    const r = 46 + Math.sin(a * 12) * 2.4 + Math.sin(a * 5) * 1.2
    return `${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`
  })
  return `M${points.join(' L')} Z`
})()

const WaxSeal = () => (
  <svg className="gate-seal-art" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <radialGradient id="gate-wax" cx="38%" cy="32%" r="75%">
        <stop offset="0" stopColor="#F3E5AB" />
        <stop offset=".5" stopColor="#D4AF37" />
        <stop offset="1" stopColor="#8A6A12" />
      </radialGradient>
    </defs>
    <path d={sealPath} fill="url(#gate-wax)" />
    <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="2.4" />
    <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,250,230,.6)" strokeWidth=".8" transform="translate(-.6 -.6)" />
    <circle cx="50" cy="50" r="29" fill="none" stroke="#4A0E17" strokeWidth=".6" strokeDasharray="1.5 2" />
    <text x="50" y="57" textAnchor="middle" className="gate-seal-monogram">P&amp;S</text>
  </svg>
)

export default function EntryGate({ opening, onOpen, tr }: EntryGateProps) {
  return (
    <div
      className={`entry-gate ${opening ? 'entry-gate-opening' : ''}`}
      role="dialog"
      aria-label="Open wedding invitation"
      onClick={opening ? undefined : onOpen}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <radialGradient id="gate-petal" cx="50%" cy="30%" r="80%">
            <stop offset="0" stopColor="#F3E5AB" />
            <stop offset="1" stopColor="#C9A03A" />
          </radialGradient>
          <radialGradient id="gate-pearl" cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#FFFBEA" />
            <stop offset=".6" stopColor="#E9D8A0" />
            <stop offset="1" stopColor="#A8862A" />
          </radialGradient>
        </defs>
      </svg>

      <div className="gate-glow" aria-hidden="true" />
      <div className="gate-door gate-door-left" aria-hidden="true">
        <FloralCorner className="gate-floral-tl" />
        <FloralCorner className="gate-floral-bl" />
        <div className="gate-seal-half gate-seal-half-left"><WaxSeal /></div>
      </div>
      <div className="gate-door gate-door-right" aria-hidden="true">
        <FloralCorner className="gate-floral-tr" />
        <FloralCorner className="gate-floral-br" />
        <div className="gate-seal-half gate-seal-half-right"><WaxSeal /></div>
      </div>

      <div className="gate-sparkles" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>

      <div className="gate-copy gate-copy-top">
        <p className="gate-kicker gate-reveal" style={{ '--d': 0 } as CSSProperties}>{tr('You are cordially invited', 'आप सादर आमंत्रित हैं', 'আপনাকে সাদর আমন্ত্রণ')}</p>
        <h1 className="gate-names">
          <span className="gate-name gate-reveal" style={{ '--d': 1 } as CSSProperties}>Poulami</span>
          <span className="gate-amp gate-reveal" style={{ '--d': 2 } as CSSProperties}>&amp;</span>
          <span className="gate-name gate-reveal" style={{ '--d': 3 } as CSSProperties}>Sachin</span>
        </h1>
      </div>

      <button
        type="button"
        className="gate-seal-button"
        onClick={(e) => { e.stopPropagation(); if (!opening) onOpen() }}
        disabled={opening}
        aria-label={tr('Open Invitation', 'निमंत्रण खोलें', 'নিমন্ত্রণপত্র খুলুন')}
      >
        <span className="gate-seal-ring" aria-hidden="true" />
      </button>

      <div className="gate-copy gate-copy-bottom">
        <p className="gate-tap gate-reveal" style={{ '--d': 4 } as CSSProperties}>{tr('Tap the seal to open', 'खोलने के लिए मुहर पर टैप करें', 'খুলতে সিলমোহরে ট্যাপ করুন')}</p>
        <p className="gate-hint gate-reveal" style={{ '--d': 5 } as CSSProperties}><i className="fas fa-music" /> {tr('Best with sound on', 'ध्वनि चालू रखें', 'সাউন্ড চালু রাখুন')}</p>
      </div>
    </div>
  )
}
