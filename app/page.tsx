import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import ModuleCard from '@/components/landing/ModuleCard'
import EnrolForm from '@/components/landing/EnrolForm'
import { MODULES } from '@/lib/content'

export default function LandingPage() {
  return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '36px 24px 64px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '16px', borderBottom: '1px solid var(--bg2)' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--g1)' }}>Cornerstone<sup style={{ fontSize: '9px' }}>EU</sup></div>
          <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Empowering Divergent Thinkers</div>
        </div>
        <a href="/login" style={{ fontSize: '13px', color: 'var(--g2)', textDecoration: 'none', fontWeight: 500 }}>Log in</a>
      </header>

      <Hero />
      <Stats />

      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '16px' }}>Full Curriculum</p>
      {MODULES.map((m, i) => <ModuleCard key={m.id} module={m} index={i} />)}

      <div style={{ margin: '40px 0 0' }}>
        <EnrolForm />
      </div>
    </main>
  )
}
