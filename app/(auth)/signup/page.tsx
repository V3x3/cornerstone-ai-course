import EnrolForm from '@/components/landing/EnrolForm'

export default function SignupPage() {
  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <a href="/" style={{ fontSize: '13px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>← Back</a>
      <EnrolForm />
    </main>
  )
}
