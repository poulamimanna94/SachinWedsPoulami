import { CSSProperties } from 'react'

type EntryGateProps = {
  opening: boolean
  onOpen: () => void
  tr: (en: string, hi: string, bn: string) => string
}

// Wavy-edged wax seal with the P&S monogram.
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

// The painting (Vrindavan ghat, Howrah Bridge, topor, kulo, alta hands) is split
// down the middle into two doors that swing open when the seal is tapped.
const Artwork = () => (
  <div className="gate-art-inner">
    <div className="gate-art-backdrop" />
    <div className="gate-art" />
  </div>
)

export default function EntryGate({ opening, onOpen, tr }: EntryGateProps) {
  return (
    <div
      className={`entry-gate ${opening ? 'entry-gate-opening' : ''}`}
      role="dialog"
      aria-label="Open wedding invitation"
      onClick={opening ? undefined : onOpen}
    >
      <div className="gate-glow" aria-hidden="true" />
      <div className="gate-door gate-door-left" aria-hidden="true"><Artwork /></div>
      <div className="gate-door gate-door-right" aria-hidden="true"><Artwork /></div>

      <div className="gate-sparkles" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>

      {/* Text and seal sit in the empty maroon space of the painting. */}
      <div className="gate-frame">
        <div className="gate-halo" aria-hidden="true" />
        <p className="gate-kicker gate-reveal" style={{ '--d': 0 } as CSSProperties}>{tr('You are cordially invited', 'आप सादर आमंत्रित हैं', 'আপনাকে সাদর আমন্ত্রণ')}</p>
        <h1 className="gate-names">
          <span className="gate-name gate-reveal" style={{ '--d': 1 } as CSSProperties}>Poulami</span>
          <span className="gate-amp gate-reveal" style={{ '--d': 2 } as CSSProperties}>&amp;</span>
          <span className="gate-name gate-reveal" style={{ '--d': 3 } as CSSProperties}>Sachin</span>
        </h1>

        <div className="gate-seal"><WaxSeal /></div>
        <button
          type="button"
          className="gate-seal-button"
          onClick={(e) => { e.stopPropagation(); if (!opening) onOpen() }}
          disabled={opening}
          aria-label={tr('Open Invitation', 'निमंत्रण खोलें', 'নিমন্ত্রণপত্র খুলুন')}
        >
          <span className="gate-seal-ring" aria-hidden="true" />
        </button>

        <div className="gate-tapband" aria-hidden="true" />
        <p className="gate-tap gate-reveal" style={{ '--d': 4 } as CSSProperties}>{tr('Tap the seal to open', 'खोलने के लिए मुहर पर टैप करें', 'খুলতে সিলমোহরে ট্যাপ করুন')}</p>
        <p className="gate-hint gate-reveal" style={{ '--d': 5 } as CSSProperties}><i className="fas fa-music" /> {tr('Best with sound on', 'ध्वनि चालू रखें', 'সাউন্ড চালু রাখুন')}</p>
      </div>
    </div>
  )
}
