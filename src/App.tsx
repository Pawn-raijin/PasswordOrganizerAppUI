import { useState, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'forgot'
  | 'home'
  | 'vault'
  | 'detail'
  | 'add'
  | 'edit'
  | 'search'
  | 'generator'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'about'
  | 'help'

type Category = 'social' | 'banking' | 'email' | 'shopping' | 'work' | 'other'

interface Password {
  id: string
  title: string
  username: string
  password: string
  website: string
  category: Category
  strength: 'weak' | 'fair' | 'strong' | 'excellent'
  lastUpdated: string
  favorite: boolean
  notes: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_PASSWORDS: Password[] = [
  { id: '1', title: 'Gmail', username: 'alex.morgan@gmail.com', password: 'Tr0ub4dor&3', website: 'gmail.com', category: 'email', strength: 'strong', lastUpdated: '2 days ago', favorite: true, notes: 'Primary email account' },
  { id: '2', title: 'Chase Bank', username: 'alexmorgan92', password: 'B@nk$ecure2024!', website: 'chase.com', category: 'banking', strength: 'excellent', lastUpdated: '1 week ago', favorite: true, notes: 'Joint account' },
  { id: '3', title: 'Instagram', username: '@alex.morgan', password: 'Gr@m2024!', website: 'instagram.com', category: 'social', strength: 'strong', lastUpdated: '3 days ago', favorite: false, notes: '' },
  { id: '4', title: 'Amazon', username: 'alex.morgan@gmail.com', password: 'Shop1ng!', website: 'amazon.com', category: 'shopping', strength: 'fair', lastUpdated: '2 weeks ago', favorite: false, notes: 'Prime account' },
  { id: '5', title: 'Slack – Acme Corp', username: 'alex.morgan@acme.io', password: 'W0rk#Sl4ck2024', website: 'acme.slack.com', category: 'work', strength: 'excellent', lastUpdated: '1 day ago', favorite: true, notes: 'Work workspace' },
  { id: '6', title: 'Netflix', username: 'alex.morgan@gmail.com', password: 'Str3am!ng', website: 'netflix.com', category: 'other', strength: 'fair', lastUpdated: '1 month ago', favorite: false, notes: 'Family plan' },
  { id: '7', title: 'Twitter / X', username: '@alexmorgan', password: 'Tw33t$2024!', website: 'x.com', category: 'social', strength: 'strong', lastUpdated: '5 days ago', favorite: false, notes: '' },
  { id: '8', title: 'LinkedIn', username: 'alex-morgan', password: 'L1nked!n24', website: 'linkedin.com', category: 'work', strength: 'strong', lastUpdated: '3 weeks ago', favorite: false, notes: 'Professional profile' },
]

const CATEGORY_META: Record<Category, { label: string; color: string; bg: string; icon: string }> = {
  social:   { label: 'Social',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: '👥' },
  banking:  { label: 'Banking',  color: '#34D399', bg: 'rgba(52,211,153,0.12)',  icon: '🏦' },
  email:    { label: 'Email',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  icon: '✉️' },
  shopping: { label: 'Shopping', color: '#F472B6', bg: 'rgba(244,114,182,0.12)', icon: '🛍️' },
  work:     { label: 'Work',     color: '#FCD34D', bg: 'rgba(252,211,77,0.12)',  icon: '💼' },
  other:    { label: 'Other',    color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', icon: '🔖' },
}

const STRENGTH_META = {
  weak:      { color: '#EF4444', label: 'Weak',      bars: 1 },
  fair:      { color: '#F97316', label: 'Fair',      bars: 2 },
  strong:    { color: '#EAB308', label: 'Strong',    bars: 3 },
  excellent: { color: '#22C55E', label: 'Excellent', bars: 4 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function maskPassword(pw: string) {
  return '•'.repeat(pw.length)
}

function StrengthBars({ level }: { level: Password['strength'] }) {
  const meta = STRENGTH_META[level]
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            height: 4,
            width: 20,
            borderRadius: 2,
            background: i <= meta.bars ? meta.color : 'rgba(255,255,255,0.12)',
            transition: 'background 0.3s ease',
          }}
        />
      ))}
      <span style={{ fontSize: 11, color: meta.color, fontFamily: 'JetBrains Mono', marginLeft: 4 }}>
        {meta.label}
      </span>
    </div>
  )
}

function CategoryChip({ cat }: { cat: Category }) {
  const m = CATEGORY_META[cat]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: m.bg, color: m.color,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    }}>
      {m.icon} {m.label}
    </span>
  )
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function BottomNav({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const items = [
    { id: 'home' as Screen, icon: HomeIcon, label: 'Home' },
    { id: 'vault' as Screen, icon: VaultIcon, label: 'Vault' },
    { id: 'generator' as Screen, icon: GenIcon, label: 'Generate' },
    { id: 'notifications' as Screen, icon: BellIcon, label: 'Alerts' },
    { id: 'profile' as Screen, icon: ProfileIcon, label: 'Profile' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: 393, zIndex: 100,
      background: 'rgba(13,17,33,0.95)',
      backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 8px 24px',
    }}>
      {items.map(({ id, icon: Icon, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onNav(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? '#00BCB4' : 'rgba(255,255,255,0.4)',
              padding: '4px 12px',
              transition: 'color 0.2s ease',
            }}
          >
            <div style={{
              position: 'relative',
              background: isActive ? 'rgba(0,188,180,0.15)' : 'transparent',
              borderRadius: 12, padding: '6px 16px',
              transition: 'background 0.2s ease',
            }}>
              <Icon size={22} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.03em' }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function HomeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function VaultIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/>
    </svg>
  )
}
function GenIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}
function BellIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )
}
function ProfileIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function LockIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  )
}
function EyeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function EyeOffIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
function CopyIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  )
}
function ShieldIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function SearchIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function PlusIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function BackIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function EditIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function TrashIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}
function FingerprintIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10a2 2 0 010 4"/><path d="M12 6a6 6 0 016 6c0 1.5-.3 3-.8 4.2"/><path d="M5.8 16.2A6 6 0 016 12a6 6 0 016-6"/><path d="M12 10v10"/><path d="M8.7 19.3A10 10 0 0112 2c5.5 0 10 4.5 10 10 0 2.5-.9 4.8-2.4 6.5"/><path d="M2 12c0-2.4.8-4.6 2.1-6.4"/>
    </svg>
  )
}
function StarIcon({ size = 16, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FCD34D' : 'none'} stroke={filled ? '#FCD34D' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
function RefreshIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  )
}
function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function WarningIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
function KeyIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  )
}
function GlobeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  )
}
function SettingsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

// ─── Phone Shell ─────────────────────────────────────────────────────────────
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 393, height: 852,
      background: '#0d1121',
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)',
      flexShrink: 0,
    }}>
      {/* Status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 24px 8px',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#e8eaf0' }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 16, height: 10, border: '1.5px solid #e8eaf0', borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '80%', background: '#22C55E', borderRadius: 1 }}/>
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5L1 9.5M8 2.5L15 9.5" stroke="none"/>
            <path fillRule="evenodd" d="M8 0C5.1 0 2.5 1.2.8 3.1l1.4 1.4C3.5 2.9 5.6 2 8 2s4.5.9 5.8 2.5l1.4-1.4C13.5 1.2 10.9 0 8 0zM8 4c-2.1 0-4 .9-5.3 2.4l1.4 1.4C5 6.7 6.4 6 8 6s3 .7 3.9 1.8l1.4-1.4C12 4.9 10.1 4 8 4zm0 4c-1.1 0-2.1.5-2.8 1.2L8 12l2.8-2.8C10.1 8.5 9.1 8 8 8z" fill="#e8eaf0"/>
          </svg>
        </div>
      </div>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, background: '#000',
        borderRadius: 20, zIndex: 300,
      }}/>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 56 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <div
      onClick={onNext}
      style={{
        minHeight: 796, background: 'linear-gradient(160deg, #0d1121 0%, #0f2027 50%, #0d1121 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: '40px 24px', gap: 24,
      }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'linear-gradient(135deg, #00BCB4 0%, #0077B6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,188,180,0.5)',
        }}>
          <LockIcon size={48} color="white" />
        </div>
        <div style={{
          position: 'absolute', inset: -16, borderRadius: 44,
          border: '2px solid rgba(0,188,180,0.2)',
          animation: 'pulse-ring 2s ease-out infinite',
        }}/>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
          VaultKey
        </h1>
        <p style={{ color: '#00BCB4', fontSize: 14, margin: '6px 0 0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Password Organizer
        </p>
      </div>
      <div style={{ position: 'absolute', bottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: i === 0 ? 20 : 8, height: 8,
              borderRadius: 4, background: i === 0 ? '#00BCB4' : 'rgba(255,255,255,0.2)',
            }}/>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Tap to continue</p>
      </div>
    </div>
  )
}

function OnboardingScreen({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState(0)
  const slides = [
    {
      icon: <ShieldIcon size={64} color="#00BCB4" />,
      title: 'Bank-Grade Security',
      desc: 'AES-256 encryption protects every password. Your data never leaves your device without your consent.',
    },
    {
      icon: <FingerprintIcon size={64} />,
      title: 'Biometric Access',
      desc: 'Unlock instantly with Face ID or fingerprint. No master password to forget.',
    },
    {
      icon: <KeyIcon size={64} />,
      title: 'Smart Password Generator',
      desc: 'Create unique, unbreakable passwords for every account in one tap.',
    },
  ]
  const slide = slides[step]
  return (
    <div style={{ minHeight: 796, background: '#0d1121', display: 'flex', flexDirection: 'column', padding: '32px 24px 40px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        <div style={{
          width: 140, height: 140, borderRadius: 40,
          background: 'rgba(0,188,180,0.08)',
          border: '1px solid rgba(0,188,180,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {slide.icon}
        </div>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{slide.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{slide.desc}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            height: 8, width: i === step ? 24 : 8, borderRadius: 4,
            background: i === step ? '#00BCB4' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
          }}/>
        ))}
      </div>
      <button
        onClick={() => step < slides.length - 1 ? setStep(step + 1) : onNext()}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,188,180,0.4)',
          fontFamily: 'Nunito',
        }}
      >
        {step < slides.length - 1 ? 'Next' : 'Get Started'}
      </button>
      {step < slides.length - 1 && (
        <button onClick={onNext} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          fontSize: 14, cursor: 'pointer', marginTop: 12, fontFamily: 'Nunito',
        }}>
          Skip
        </button>
      )}
    </div>
  )
}

function LoginScreen({ onLogin, onSignup, onForgot }: { onLogin: () => void; onSignup: () => void; onForgot: () => void }) {
  const [email, setEmail] = useState('alex.morgan@gmail.com')
  const [password, setPassword] = useState('MyMasterPass!')
  const [showPw, setShowPw] = useState(false)
  return (
    <div style={{ minHeight: 796, background: '#0d1121', display: 'flex', flexDirection: 'column', padding: '24px 24px 40px' }}>
      <div style={{ marginBottom: 32, marginTop: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: '0 0 24px rgba(0,188,180,0.4)',
        }}>
          <LockIcon size={28} color="white" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>Welcome back</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '6px 0 0' }}>Unlock your vault to continue</p>
      </div>

      {/* Biometric button */}
      <div
        onClick={onLogin}
        style={{
          background: 'rgba(0,188,180,0.06)', border: '1.5px dashed rgba(0,188,180,0.4)',
          borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer',
        }}
      >
        <div style={{ color: '#00BCB4' }}><FingerprintIcon size={40} /></div>
        <span style={{ color: '#00BCB4', fontSize: 14, fontWeight: 600 }}>Use Biometrics</span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Face ID or Fingerprint</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>or sign in with master password</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Master Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onForgot}
        style={{ background: 'none', border: 'none', color: '#00BCB4', fontSize: 13, cursor: 'pointer', textAlign: 'right', marginBottom: 20, fontFamily: 'Nunito', padding: 0 }}
      >
        Forgot password?
      </button>

      <button
        onClick={onLogin}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,188,180,0.4)', fontFamily: 'Nunito',
        }}
      >
        Unlock Vault
      </button>

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 20 }}>
        New here?{' '}
        <button onClick={onSignup} style={{ background: 'none', border: 'none', color: '#00BCB4', fontSize: 14, cursor: 'pointer', fontWeight: 600, fontFamily: 'Nunito' }}>
          Create an account
        </button>
      </p>
    </div>
  )
}

function SignupScreen({ onBack, onSignup }: { onBack: () => void; onSignup: () => void }) {
  const [showPw, setShowPw] = useState(false)
  return (
    <div style={{ minHeight: 796, background: '#0d1121', padding: '16px 24px 40px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <BackIcon /> <span style={{ fontSize: 14, fontFamily: 'Nunito' }}>Back</span>
      </button>
      <div style={{ marginBottom: 28, marginTop: 16 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>Create Account</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '6px 0 0' }}>Set up your secure vault</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {['Full Name', 'Email Address'].map(label => (
          <div key={label}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
            <input
              defaultValue={label === 'Full Name' ? 'Alex Morgan' : 'alex.morgan@gmail.com'}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Master Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              defaultValue="MyStr0ng!Pass"
              style={{
                width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div style={{ marginTop: 8 }}>
            <StrengthBars level="strong" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Confirm Password</label>
          <input
            type="password"
            defaultValue="MyStr0ng!Pass"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{
          background: 'rgba(0,188,180,0.06)', border: '1px solid rgba(0,188,180,0.2)',
          borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: '#00BCB4', marginTop: 1 }}><ShieldIcon size={16} color="#00BCB4" /></div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            Your master password is never stored. We can't recover it if lost. Store it safely.
          </p>
        </div>
      </div>
      <button
        onClick={onSignup}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none', marginTop: 24,
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,188,180,0.4)', fontFamily: 'Nunito',
        }}
      >
        Create Vault
      </button>
    </div>
  )
}

function ForgotScreen({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <div style={{ minHeight: 796, background: '#0d1121', padding: '16px 24px 40px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <BackIcon /> <span style={{ fontSize: 14, fontFamily: 'Nunito' }}>Back</span>
      </button>
      <div style={{ marginBottom: 28, marginTop: 16 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>Reset Password</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '6px 0 0' }}>We'll send a reset link to your email</p>
      </div>
      {!sent ? (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email Address</label>
          <input
            defaultValue="alex.morgan@gmail.com"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none', boxSizing: 'border-box',
              marginBottom: 20,
            }}
          />
          <button
            onClick={() => setSent(true)}
            style={{
              width: '100%', padding: '16px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito',
            }}
          >
            Send Reset Link
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <CheckIcon size={36} />
          </div>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Check your email</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>
            We sent a reset link to<br /><strong style={{ color: '#00BCB4' }}>alex.morgan@gmail.com</strong>
          </p>
          <button onClick={onBack} style={{
            background: 'none', border: '1px solid rgba(0,188,180,0.4)', color: '#00BCB4',
            borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Nunito', marginTop: 24,
          }}>
            Back to Login
          </button>
        </div>
      )}
    </div>
  )
}

function HomeScreen({ onNav, onDetail }: { onNav: (s: Screen) => void; onDetail: (p: Password) => void }) {
  const stats = [
    { label: 'Total Saved', value: '8', color: '#00BCB4', icon: <LockIcon size={18} color="#00BCB4" /> },
    { label: 'Weak', value: '1', color: '#EF4444', icon: <WarningIcon size={18} /> },
    { label: 'Categories', value: '6', color: '#A78BFA', icon: <KeyIcon size={18} /> },
  ]
  const recent = MOCK_PASSWORDS.slice(0, 4)
  const alerts = [
    { msg: 'Amazon password is weak', color: '#F97316', icon: <WarningIcon size={16} /> },
    { msg: 'Netflix password not updated in 30+ days', color: '#EAB308', icon: <WarningIcon size={16} /> },
  ]

  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0f1e35 0%, #0d1121 100%)',
        padding: '16px 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>Good morning,</p>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '2px 0 0' }}>Alex Morgan 👋</h2>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onNav('search')}
              style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <SearchIcon size={18} />
            </button>
            <button
              onClick={() => onNav('notifications')}
              style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              <BellIcon size={18} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #0d1121' }}/>
            </button>
          </div>
        </div>

        {/* Security score */}
        <div style={{
          marginTop: 16, background: 'rgba(0,188,180,0.08)',
          border: '1px solid rgba(0,188,180,0.2)', borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(0,188,180,0.15)" strokeWidth="5"/>
              <circle cx="26" cy="26" r="22" fill="none" stroke="#00BCB4" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22 * 0.78} ${2 * Math.PI * 22}`}
                strokeLinecap="round" transform="rotate(-90 26 26)"/>
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00BCB4', fontSize: 13, fontWeight: 800 }}>78</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Security Score</span>
              <span style={{ color: '#EAB308', fontSize: 12, fontWeight: 600 }}>Good</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '4px 0 0', lineHeight: 1.4 }}>
              2 weak passwords need attention
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.map((a, i) => (
          <div key={i} style={{
            background: `rgba(${a.color === '#F97316' ? '249,115,22' : '234,179,8'},0.08)`,
            border: `1px solid rgba(${a.color === '#F97316' ? '249,115,22' : '234,179,8'},0.2)`,
            borderRadius: 12, padding: '10px 14px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: a.color }}>{a.icon}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{a.msg}</span>
          </div>
        ))}

        {/* Quick actions */}
        <div style={{ marginBottom: 24, marginTop: 8 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { label: 'Add Password', icon: <PlusIcon size={18} />, color: '#00BCB4', action: () => onNav('add') },
              { label: 'Generate', icon: <GenIcon size={18} />, color: '#A78BFA', action: () => onNav('generator') },
              { label: 'Search', icon: <SearchIcon size={18} />, color: '#60A5FA', action: () => onNav('search') },
            ].map(q => (
              <button
                key={q.label}
                onClick={q.action}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '14px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', color: q.color, flexShrink: 0, fontFamily: 'Nunito',
                }}
              >
                {q.icon}
                <span style={{ fontSize: 12, fontWeight: 600 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>Recent</h3>
            <button onClick={() => onNav('vault')} style={{ background: 'none', border: 'none', color: '#00BCB4', fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito' }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map(pw => (
              <PasswordCard key={pw.id} pw={pw} onPress={() => onDetail(pw)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordCard({ pw, onPress }: { pw: Password; onPress: () => void }) {
  const cat = CATEGORY_META[pw.category]
  const initials = pw.title.substring(0, 2).toUpperCase()
  return (
    <div
      onClick={onPress}
      className="card-hover"
      style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 13,
        background: cat.bg, border: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {cat.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pw.title}</span>
          {pw.favorite && <StarIcon size={13} filled />}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
          {pw.username.length > 22 ? pw.username.substring(0, 22) + '…' : pw.username}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STRENGTH_META[pw.strength].color }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{pw.lastUpdated}</span>
      </div>
    </div>
  )
}

function VaultScreen({ onNav, onDetail }: { onNav: (s: Screen) => void; onDetail: (p: Password) => void }) {
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'strength'>('name')
  const categories: ('all' | Category)[] = ['all', 'social', 'banking', 'email', 'shopping', 'work', 'other']

  const filtered = MOCK_PASSWORDS.filter(p => activeFilter === 'all' || p.category === activeFilter)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    if (sortBy === 'strength') {
      const order = { excellent: 0, strong: 1, fair: 2, weak: 3 }
      return order[a.strength] - order[b.strength]
    }
    return 0
  })

  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 100 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>Vault</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onNav('search')}
              style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <SearchIcon size={17} />
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, color: 'rgba(255,255,255,0.7)', fontSize: 12,
                padding: '0 10px', height: 38, cursor: 'pointer', fontFamily: 'Nunito', outline: 'none',
              }}
            >
              <option value="name">A–Z</option>
              <option value="strength">Strength</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(cat => {
            const isActive = activeFilter === cat
            const meta = cat !== 'all' ? CATEGORY_META[cat] : null
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none',
                  background: isActive ? (meta ? meta.bg : 'rgba(0,188,180,0.15)') : 'rgba(255,255,255,0.05)',
                  color: isActive ? (meta ? meta.color : '#00BCB4') : 'rgba(255,255,255,0.4)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  fontFamily: 'Nunito', letterSpacing: '0.02em',
                  borderColor: isActive ? (meta ? meta.color : '#00BCB4') : 'transparent',
                  borderWidth: 1, borderStyle: 'solid',
                }}
              >
                {cat === 'all' ? 'All' : meta!.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(pw => (
          <PasswordCard key={pw.id} pw={pw} onPress={() => onDetail(pw)} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => onNav('add')}
        style={{
          position: 'fixed', bottom: 88, right: 24,
          width: 56, height: 56, borderRadius: 18,
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,188,180,0.5)', color: '#fff', zIndex: 50,
        }}
      >
        <PlusIcon size={26} />
      </button>
    </div>
  )
}

function DetailScreen({ pw, onBack, onEdit, onDelete }: { pw: Password; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const [showPw, setShowPw] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleCopy = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const cat = CATEGORY_META[pw.category]

  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0f2027 0%, #0d1121 100%)',
        padding: '12px 20px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BackIcon /> <span style={{ fontSize: 14, fontFamily: 'Nunito' }}>Back</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EditIcon size={16} />
            </button>
            <button onClick={() => setShowDeleteDialog(true)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: cat.bg, border: `1px solid rgba(255,255,255,0.1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            {cat.icon}
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>{pw.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <CategoryChip cat={pw.category} />
              {pw.favorite && <StarIcon size={14} filled />}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <StrengthBars level={pw.strength} />

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Username */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Username / Email</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#e8eaf0', fontSize: 14, fontFamily: 'JetBrains Mono' }}>{pw.username}</span>
              <button
                onClick={() => handleCopy('username', pw.username)}
                style={{ background: copied === 'username' ? 'rgba(0,188,180,0.2)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: copied === 'username' ? '#00BCB4' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Nunito' }}
              >
                {copied === 'username' ? <CheckIcon size={14} /> : <CopyIcon />}
                {copied === 'username' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Password */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Password</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#e8eaf0', fontSize: 14, fontFamily: 'JetBrains Mono', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {showPw ? pw.password : maskPassword(pw.password)}
              </span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => setShowPw(!showPw)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
                <button
                  onClick={() => handleCopy('password', pw.password)}
                  style={{ background: copied === 'password' ? 'rgba(0,188,180,0.2)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: copied === 'password' ? '#00BCB4' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Nunito' }}
                >
                  {copied === 'password' ? <CheckIcon size={14} /> : <CopyIcon />}
                  {copied === 'password' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Website */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Website</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GlobeIcon size={14} />
              <span style={{ color: '#60A5FA', fontSize: 14 }}>{pw.website}</span>
            </div>
          </div>

          {pw.notes && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Notes</label>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>{pw.notes}</p>
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Last Updated</label>
              <span style={{ color: '#e8eaf0', fontSize: 14 }}>{pw.lastUpdated}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: '1px solid rgba(0,188,180,0.4)',
            background: 'rgba(0,188,180,0.08)', color: '#00BCB4',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20, fontFamily: 'Nunito',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <EditIcon size={18} /> Edit Password
        </button>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', zIndex: 500, borderRadius: 48,
        }}>
          <div className="slide-up" style={{
            width: '100%', background: '#141a2e',
            borderRadius: '24px 24px 0 0', padding: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18, background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <TrashIcon size={22} />
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Delete Password?</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
                "{pw.title}" will be permanently removed from your vault.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteDialog(false)}
                style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteDialog(false); onBack() }}
                style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#EF4444', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddEditScreen({ pw, onBack, onSave }: { pw?: Password; onBack: () => void; onSave: () => void }) {
  const [title, setTitle] = useState(pw?.title ?? '')
  const [username, setUsername] = useState(pw?.username ?? '')
  const [password, setPassword] = useState(pw?.password ?? '')
  const [website, setWebsite] = useState(pw?.website ?? '')
  const [category, setCategory] = useState<Category>(pw?.category ?? 'other')
  const [notes, setNotes] = useState(pw?.notes ?? '')
  const [showPw, setShowPw] = useState(false)

  const strengthLevel: Password['strength'] =
    password.length >= 16 && /[!@#$%^&*]/.test(password) && /[0-9]/.test(password) ? 'excellent'
    : password.length >= 12 ? 'strong'
    : password.length >= 8 ? 'fair'
    : 'weak'

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    setPassword(Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
  }

  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 40 }}>
      <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>
          {pw ? 'Edit Password' : 'Add Password'}
        </h2>
      </div>
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Title', value: title, set: setTitle, placeholder: 'e.g. Gmail, GitHub…' },
          { label: 'Username / Email', value: username, set: setUsername, placeholder: 'your@email.com' },
          { label: 'Website', value: website, set: setWebsite, placeholder: 'example.com' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
            <input
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        {/* Password field */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter or generate a password"
              style={{
                width: '100%', padding: '13px 100px 13px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8eaf0', fontSize: 14, fontFamily: 'JetBrains Mono', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
              <button onClick={() => setShowPw(!showPw)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
              </button>
              <button onClick={generatePassword} style={{ background: 'rgba(0,188,180,0.15)', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#00BCB4', display: 'flex', alignItems: 'center' }}>
                <RefreshIcon size={15} />
              </button>
            </div>
          </div>
          {password && (
            <div style={{ marginTop: 8 }}>
              <StrengthBars level={strengthLevel} />
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(CATEGORY_META) as Category[]).map(cat => {
              const m = CATEGORY_META[cat]
              const isActive = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '7px 14px', borderRadius: 20,
                    background: isActive ? m.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? m.color : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? m.color : 'rgba(255,255,255,0.5)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito',
                  }}
                >
                  {m.icon} {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any notes about this account…"
            rows={3}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaf0', fontSize: 14, fontFamily: 'Nunito', outline: 'none',
              resize: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={onSave}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none', marginTop: 4,
            background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito',
            boxShadow: '0 4px 20px rgba(0,188,180,0.4)',
          }}
        >
          {pw ? 'Save Changes' : 'Add to Vault'}
        </button>
      </div>
    </div>
  )
}

function SearchScreen({ onBack, onDetail }: { onBack: () => void; onDetail: (p: Password) => void }) {
  const [query, setQuery] = useState('')
  const results = query.length > 0
    ? MOCK_PASSWORDS.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.username.toLowerCase().includes(query.toLowerCase()) ||
        p.website.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 100 }}>
      <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
            <SearchIcon size={18} />
          </div>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search passwords…"
            style={{
              width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaf0', fontSize: 15, fontFamily: 'Nunito', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {query.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Search by name, username, or website</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No results found</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 8px' }}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            {results.map(pw => (
              <PasswordCard key={pw.id} pw={pw} onPress={() => onDetail(pw)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GeneratorScreen() {
  const [length, setLength] = useState(16)
  const [useUpper, setUseUpper] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [generated, setGenerated] = useState('K7#mPq2$vR9nLw!x')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyz'
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (useNumbers) chars += '0123456789'
    if (useSymbols) chars += '!@#$%^&*'
    setGenerated(Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
    setCopied(false)
  }

  const strength: Password['strength'] =
    length >= 16 && useSymbols && useNumbers ? 'excellent'
    : length >= 12 ? 'strong'
    : length >= 8 ? 'fair' : 'weak'

  const Toggle = ({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
      <span style={{ color: '#e8eaf0', fontSize: 14 }}>{label}</span>
      <div
        onClick={() => set(!value)}
        style={{
          width: 48, height: 26, borderRadius: 13,
          background: value ? 'linear-gradient(135deg, #00BCB4, #0077B6)' : 'rgba(255,255,255,0.1)',
          position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: value ? 25 : 3, width: 20, height: 20,
          borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}/>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: 796, background: '#0d1121', padding: '16px 20px', paddingBottom: 100 }}>
      <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 20px' }}>Password Generator</h2>

      {/* Generated password display */}
      <div style={{
        background: 'rgba(0,188,180,0.06)', border: '1.5px solid rgba(0,188,180,0.2)',
        borderRadius: 16, padding: '20px 16px', marginBottom: 8,
      }}>
        <p style={{ color: '#00BCB4', fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 600, margin: '0 0 12px', wordBreak: 'break-all', letterSpacing: '0.05em' }}>
          {generated}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { navigator.clipboard.writeText(generated).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(0,188,180,0.15)',
              color: copied ? '#22C55E' : '#00BCB4',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {copied ? <><CheckIcon size={14} /> Copied!</> : <><CopyIcon size={14} /> Copy</>}
          </button>
          <button
            onClick={generate}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <RefreshIcon size={14} /> Regenerate
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <StrengthBars level={strength} />
      </div>

      {/* Length slider */}
      <div style={{ marginBottom: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ color: '#e8eaf0', fontSize: 14 }}>Length</span>
          <span style={{ color: '#00BCB4', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{length}</span>
        </div>
        <input
          type="range" min={8} max={32} value={length}
          onChange={e => setLength(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#00BCB4' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <Toggle label="Uppercase Letters (A–Z)" value={useUpper} set={setUseUpper} />
        <Toggle label="Numbers (0–9)" value={useNumbers} set={setUseNumbers} />
        <Toggle label="Symbols (!@#$%^&*)" value={useSymbols} set={setUseSymbols} />
      </div>

      <button
        onClick={generate}
        style={{
          width: '100%', padding: '15px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito',
          boxShadow: '0 4px 20px rgba(0,188,180,0.4)',
        }}
      >
        Generate New Password
      </button>
    </div>
  )
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const notifications = [
    { id: 1, type: 'warning', title: 'Weak Password Detected', body: 'Amazon password is too weak. Update it now.', time: '2h ago', color: '#EF4444' },
    { id: 2, type: 'info', title: 'Password Age Alert', body: 'Netflix password hasn\'t been updated in 32 days.', time: '5h ago', color: '#F97316' },
    { id: 3, type: 'success', title: 'Vault Backup Complete', body: 'Your vault was successfully backed up to the cloud.', time: '1d ago', color: '#22C55E' },
    { id: 4, type: 'info', title: 'New Login Detected', body: 'Slack was accessed from a new device.', time: '2d ago', color: '#60A5FA' },
    { id: 5, type: 'warning', title: 'Duplicate Password', body: 'Gmail and Amazon share the same password.', time: '3d ago', color: '#EAB308' },
  ]
  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 100 }}>
      <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Notifications</h2>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
            borderLeft: `3px solid ${n.color}`,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{n.title}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{n.time}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileScreen({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0f1e35 0%, #0d1121 100%)',
        padding: '16px 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 20px' }}>Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 22,
            background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 20px rgba(0,188,180,0.4)',
          }}>
            AM
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Alex Morgan</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '2px 0 0' }}>alex.morgan@gmail.com</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ background: 'rgba(0,188,180,0.15)', color: '#00BCB4', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Pro Plan</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Passwords', value: '8' },
            { label: 'Security Score', value: '78%' },
            { label: 'Categories', value: '6' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '14px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#00BCB4', fontFamily: 'JetBrains Mono' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu items */}
        {[
          { label: 'Settings', icon: <SettingsIcon size={18} />, action: () => onNav('settings') },
          { label: 'Help & Support', icon: <span style={{ fontSize: 18 }}>💬</span>, action: () => onNav('help') },
          { label: 'About VaultKey', icon: <ShieldIcon size={18} />, action: () => onNav('about') },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 16px', borderRadius: 14, marginBottom: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer', color: '#e8eaf0', fontFamily: 'Nunito', fontSize: 14, fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.icon}</span>
              {item.label}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18 }}>›</span>
          </button>
        ))}

        <button style={{
          width: '100%', padding: '14px', borderRadius: 14, marginTop: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#EF4444', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito',
        }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [biometric, setBiometric] = useState(true)
  const [autoLock, setAutoLock] = useState(true)
  const [cloudSync, setCloudSync] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const Toggle = ({ value, set }: { value: boolean; set: (v: boolean) => void }) => (
    <div onClick={() => set(!value)} style={{
      width: 48, height: 26, borderRadius: 13,
      background: value ? 'linear-gradient(135deg, #00BCB4, #0077B6)' : 'rgba(255,255,255,0.1)',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 25 : 3, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}/>
    </div>
  )

  const Row = ({ label, sub, value, set }: { label: string; sub: string; value: boolean; set: (v: boolean) => void }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px', background: 'rgba(255,255,255,0.04)',
      borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8,
    }}>
      <div>
        <div style={{ color: '#e8eaf0', fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{sub}</div>
      </div>
      <Toggle value={value} set={set} />
    </div>
  )

  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 40 }}>
      <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Settings</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Security</h4>
        <Row label="Biometric Unlock" sub="Use Face ID or Fingerprint" value={biometric} set={setBiometric} />
        <Row label="Auto-Lock" sub="Lock after 5 minutes of inactivity" value={autoLock} set={setAutoLock} />
        <h4 style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>Sync & Backup</h4>
        <Row label="Cloud Sync" sub="Sync vault across devices" value={cloudSync} set={setCloudSync} />
        <h4 style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>Appearance</h4>
        <Row label="Dark Mode" sub="Always on dark theme" value={darkMode} set={setDarkMode} />
        <h4 style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 10px' }}>Data</h4>
        {['Export Vault', 'Clear All Data'].map(label => (
          <button
            key={label}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.04)', color: label === 'Clear All Data' ? '#EF4444' : '#e8eaf0',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'Nunito',
              marginBottom: 8, display: 'block',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 40 }}>
      <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>About</h2>
      </div>
      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{
          width: 88, height: 88, borderRadius: 28,
          background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, boxShadow: '0 0 32px rgba(0,188,180,0.4)',
        }}>
          <LockIcon size={44} color="white" />
        </div>
        <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>VaultKey</h2>
        <p style={{ color: '#00BCB4', fontSize: 13, fontWeight: 600, margin: '0 0 20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password Organizer</p>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, maxWidth: 280, margin: '0 0 32px' }}>
          Secure, simple, and private. VaultKey uses AES-256 encryption to protect your passwords. Your master password is never stored or transmitted.
        </p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Version', value: '2.4.1' },
            { label: 'Build', value: '20240805' },
            { label: 'Encryption', value: 'AES-256' },
            { label: 'License', value: 'MIT' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '13px 16px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{label}</span>
              <span style={{ color: '#e8eaf0', fontSize: 14, fontFamily: 'JetBrains Mono' }}>{value}</span>
            </div>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 24 }}>© 2024 VaultKey. All rights reserved.</p>
      </div>
    </div>
  )
}

function HelpScreen({ onBack }: { onBack: () => void }) {
  const faqs = [
    { q: 'How is my data encrypted?', a: 'VaultKey uses AES-256 encryption. Your master password is hashed locally and never stored on our servers.' },
    { q: 'What if I forget my master password?', a: 'We cannot recover it for you — this is by design. Store your master password in a secure offline location.' },
    { q: 'Can I sync across devices?', a: 'Yes! Enable Cloud Sync in Settings to securely sync your vault across all your devices.' },
    { q: 'How do I import passwords?', a: 'Go to Settings > Export/Import and select a CSV from your browser or another password manager.' },
  ]
  return (
    <div style={{ minHeight: 796, background: '#0d1121', paddingBottom: 40 }}>
      <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Help & Support</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{
          background: 'rgba(0,188,180,0.06)', border: '1px solid rgba(0,188,180,0.2)',
          borderRadius: 16, padding: '16px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 32 }}>💬</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Contact Support</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>support@vaultkey.app</div>
          </div>
        </div>

        <h4 style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>FAQs</h4>
        {faqs.map((faq, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 8,
          }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{faq.q}</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────
const NAV_SCREENS: Screen[] = ['home', 'vault', 'generator', 'notifications', 'profile']

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [selectedPw, setSelectedPw] = useState<Password | null>(null)
  const [prevScreen, setPrevScreen] = useState<Screen>('home')

  const go = useCallback((s: Screen) => {
    setPrevScreen(screen)
    setScreen(s)
  }, [screen])

  const goBack = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const handleDetail = useCallback((pw: Password) => {
    setSelectedPw(pw)
    go('detail')
  }, [go])

  // Screens that get bottom nav
  const showNav = NAV_SCREENS.includes(screen)

  // All phones side-scrollable for the showcase
  const PHONES: { id: Screen; label: string }[] = [
    { id: 'splash', label: 'Splash' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'login', label: 'Login' },
    { id: 'signup', label: 'Sign Up' },
    { id: 'forgot', label: 'Forgot PW' },
    { id: 'home', label: 'Dashboard' },
    { id: 'vault', label: 'Vault' },
    { id: 'detail', label: 'Detail' },
    { id: 'add', label: 'Add/Edit' },
    { id: 'search', label: 'Search' },
    { id: 'generator', label: 'Generator' },
    { id: 'notifications', label: 'Alerts' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    { id: 'about', label: 'About' },
    { id: 'help', label: 'Help' },
  ]

  function renderScreen(s: Screen) {
    switch (s) {
      case 'splash': return <SplashScreen onNext={() => {}} />
      case 'onboarding': return <OnboardingScreen onNext={() => {}} />
      case 'login': return <LoginScreen onLogin={() => {}} onSignup={() => {}} onForgot={() => {}} />
      case 'signup': return <SignupScreen onBack={() => {}} onSignup={() => {}} />
      case 'forgot': return <ForgotScreen onBack={() => {}} />
      case 'home': return <HomeScreen onNav={() => {}} onDetail={() => {}} />
      case 'vault': return <VaultScreen onNav={() => {}} onDetail={() => {}} />
      case 'detail': return <DetailScreen pw={MOCK_PASSWORDS[1]} onBack={() => {}} onEdit={() => {}} onDelete={() => {}} />
      case 'add': return <AddEditScreen onBack={() => {}} onSave={() => {}} />
      case 'search': return <SearchScreen onBack={() => {}} onDetail={() => {}} />
      case 'generator': return <GeneratorScreen />
      case 'notifications': return <NotificationsScreen onBack={() => {}} />
      case 'profile': return <ProfileScreen onNav={() => {}} />
      case 'settings': return <SettingsScreen onBack={() => {}} />
      case 'about': return <AboutScreen onBack={() => {}} />
      case 'help': return <HelpScreen onBack={() => {}} />
    }
  }

  // Interactive single phone view
  function renderInteractiveScreen() {
    switch (screen) {
      case 'splash': return <SplashScreen onNext={() => go('onboarding')} />
      case 'onboarding': return <OnboardingScreen onNext={() => go('login')} />
      case 'login': return <LoginScreen onLogin={() => go('home')} onSignup={() => go('signup')} onForgot={() => go('forgot')} />
      case 'signup': return <SignupScreen onBack={() => go('login')} onSignup={() => go('login')} />
      case 'forgot': return <ForgotScreen onBack={() => go('login')} />
      case 'home': return <HomeScreen onNav={go} onDetail={handleDetail} />
      case 'vault': return <VaultScreen onNav={go} onDetail={handleDetail} />
      case 'detail': return <DetailScreen pw={selectedPw ?? MOCK_PASSWORDS[1]} onBack={goBack} onEdit={() => go('edit')} onDelete={goBack} />
      case 'edit': return <AddEditScreen pw={selectedPw ?? MOCK_PASSWORDS[1]} onBack={goBack} onSave={goBack} />
      case 'add': return <AddEditScreen onBack={goBack} onSave={goBack} />
      case 'search': return <SearchScreen onBack={goBack} onDetail={handleDetail} />
      case 'generator': return <GeneratorScreen />
      case 'notifications': return <NotificationsScreen onBack={goBack} />
      case 'profile': return <ProfileScreen onNav={go} />
      case 'settings': return <SettingsScreen onBack={goBack} />
      case 'about': return <AboutScreen onBack={goBack} />
      case 'help': return <HelpScreen onBack={goBack} />
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060912',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 24px 60px',
      fontFamily: 'Nunito, system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13,
            background: 'linear-gradient(135deg, #00BCB4, #0077B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,188,180,0.4)',
          }}>
            <LockIcon size={20} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>VaultKey</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
          Password Organizer — Android Material Design 3 UI Kit
        </p>
      </div>

      {/* Interactive Phone */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Interactive Preview
        </p>
        <PhoneShell>
          {renderInteractiveScreen()}
          {showNav && <BottomNav active={screen} onNav={go} />}
        </PhoneShell>
      </div>

      {/* Screen showcase */}
      <div style={{ width: '100%', maxWidth: 1600 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          All Screens — {PHONES.length} screens
        </p>
        <div style={{
          display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16,
          scrollbarWidth: 'none',
        }}>
          {PHONES.map(({ id, label }) => (
            <div key={id} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 200, height: 432, background: '#0d1121', borderRadius: 28,
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
                transform: 'scale(1)', transition: 'transform 0.2s',
                cursor: 'pointer',
              }}
                onClick={() => { setSelectedPw(MOCK_PASSWORDS[1]); go(id) }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              >
                {/* Mini status bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px 4px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(13,17,33,0.8)' }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: '#e8eaf0' }}>9:41</span>
                  <div style={{ width: 36, height: 10, background: '#000', borderRadius: 6 }}/>
                  <span style={{ fontSize: 8, color: '#e8eaf0' }}>●●●</span>
                </div>
                <div style={{ position: 'absolute', inset: 0, transform: 'scale(0.51)', transformOrigin: 'top left', width: '196%', height: '196%', pointerEvents: 'none' }}>
                  {renderScreen(id)}
                  {NAV_SCREENS.includes(id) && <BottomNav active={id} onNav={() => {}} />}
                </div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Design system */}
      <div style={{ width: '100%', maxWidth: 900, marginTop: 64 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, textAlign: 'center', margin: '0 0 32px' }}>Design System</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>

          {/* Colors */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>Color Palette</h4>
            {[
              { name: 'Primary', hex: '#00BCB4', bg: '#00BCB4' },
              { name: 'Secondary', hex: '#0077B6', bg: '#0077B6' },
              { name: 'Accent', hex: '#A78BFA', bg: '#A78BFA' },
              { name: 'Surface', hex: '#141a2e', bg: '#141a2e' },
              { name: 'Background', hex: '#0d1121', bg: '#0d1121' },
              { name: 'Success', hex: '#22C55E', bg: '#22C55E' },
              { name: 'Error', hex: '#EF4444', bg: '#EF4444' },
              { name: 'Warning', hex: '#F97316', bg: '#F97316' },
            ].map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}/>
                <div>
                  <div style={{ color: '#e8eaf0', fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'JetBrains Mono' }}>{c.hex}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>Typography</h4>
            {[
              { label: 'Display', size: 28, weight: 800, text: 'VaultKey', font: 'Nunito' },
              { label: 'Heading', size: 22, weight: 800, text: 'Dashboard', font: 'Nunito' },
              { label: 'Title', size: 18, weight: 700, text: 'My Passwords', font: 'Nunito' },
              { label: 'Body', size: 15, weight: 400, text: 'Manage your vault', font: 'Nunito' },
              { label: 'Caption', size: 12, weight: 600, text: 'Last updated 2d ago', font: 'Nunito' },
              { label: 'Mono', size: 14, weight: 500, text: 'K7#mPq2$vR9n', font: 'JetBrains Mono' },
            ].map(t => (
              <div key={t.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'JetBrains Mono' }}>{t.size}px {t.weight}</span>
                </div>
                <div style={{ color: '#e8eaf0', fontSize: t.size, fontWeight: t.weight, fontFamily: t.font, lineHeight: 1.2 }}>{t.text}</div>
              </div>
            ))}
          </div>

          {/* Components */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>Components</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00BCB4, #0077B6)', color: '#fff', fontWeight: 700, fontFamily: 'Nunito', cursor: 'pointer', fontSize: 14 }}>
                Primary Button
              </button>
              <button style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(0,188,180,0.4)', background: 'rgba(0,188,180,0.08)', color: '#00BCB4', fontWeight: 600, fontFamily: 'Nunito', cursor: 'pointer', fontSize: 14 }}>
                Outlined Button
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <CategoryChip cat="banking" />
                <CategoryChip cat="social" />
                <CategoryChip cat="work" />
              </div>
              <StrengthBars level="excellent" />
              <StrengthBars level="fair" />
              <div style={{
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <CheckIcon size={16} />
                <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>Password copied!</span>
              </div>
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <WarningIcon size={16} />
                <span style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>Weak password detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
