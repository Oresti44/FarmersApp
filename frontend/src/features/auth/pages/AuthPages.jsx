import { useState } from 'react'

import authApi from '../api/authApi.js'

function inputClassName() {
  return 'w-full rounded-md border border-[#8ACBD0]/70 bg-white px-4 py-3 text-sm text-[#170C79] outline-none transition focus:border-[#56B6C6]'
}

function AuthShell({ children, eyebrow, title }) {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-white/80 bg-white/88 p-6 shadow-[0_24px_80px_rgba(23,12,121,0.12)] backdrop-blur sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#56B6C6]">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#170C79]">{title}</h1>
      {children}
    </section>
  )
}

function FarmPicker({ farms, onSelect }) {
  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm font-semibold text-[#170C79]">Choose the farm you want to operate.</p>
      <div className="grid gap-3">
        {farms.map((farm) => (
          <button
            key={farm.id}
            type="button"
            onClick={() => onSelect(farm)}
            className="rounded-lg border border-[#8ACBD0] bg-[#EFE3CA]/55 px-4 py-4 text-left transition hover:border-[#56B6C6] hover:bg-[#8ACBD0]/25"
          >
            <span className="block font-semibold text-[#170C79]">{farm.name}</span>
            <span className="mt-1 block text-sm text-[#170C79]/65">{farm.location_text || 'No location set'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function LoginPage({ onAuthenticated }) {
  const [draft, setDraft] = useState({ email: '', password: '' })
  const [pendingSession, setPendingSession] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.login(draft)
      if (response.user.role === 'worker') {
        onAuthenticated({ user: response.user, farm: null })
        return
      }
      setPendingSession(response)
    } catch (caughtError) {
      setError(caughtError.message || 'Unable to log in.')
    } finally {
      setLoading(false)
    }
  }

  if (pendingSession) {
    return (
      <AuthShell eyebrow="Farm selection" title="Select workspace">
        <FarmPicker
          farms={pendingSession.farms}
          onSelect={(farm) => onAuthenticated({ user: pendingSession.user, farm })}
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="Login" title="Access your farm workspace">
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">Email</span>
          <input
            className={inputClassName()}
            type="email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">Password</span>
          <input
            className={inputClassName()}
            type="password"
            value={draft.password}
            onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        {error ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#56B6C6] px-5 py-3 text-sm font-semibold text-[#170C79] transition hover:bg-[#8ACBD0] disabled:opacity-70"
        >
          {loading ? 'Checking account...' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}

function SignupPage({ onAuthenticated }) {
  const [draft, setDraft] = useState({
    full_name: '',
    email: '',
    password: '',
    farm_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.signup({ ...draft, role: 'manager' })
      onAuthenticated({ user: response.user, farm: response.farms[0] || null })
    } catch (caughtError) {
      setError(caughtError.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Sign up" title="Create a manager workspace">
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">Full name</span>
          <input className={inputClassName()} value={draft.full_name} onChange={(event) => setDraft((current) => ({ ...current, full_name: event.target.value }))} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">Email</span>
          <input className={inputClassName()} type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">Password</span>
          <input className={inputClassName()} type="password" value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">Farm name</span>
          <input className={inputClassName()} value={draft.farm_name} onChange={(event) => setDraft((current) => ({ ...current, farm_name: event.target.value }))} />
        </label>
        {error ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#56B6C6] px-5 py-3 text-sm font-semibold text-[#170C79] transition hover:bg-[#8ACBD0] disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthShell>
  )
}

export { LoginPage, SignupPage }
