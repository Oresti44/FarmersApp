import { useState } from 'react'

import authApi from '../api/authApi.js'

function inputClassName() {
  return 'w-full rounded-md border border-[#b7d387]/70 bg-white px-4 py-3 text-sm text-[#22331f] outline-none transition focus:border-[#6d9143]'
}

function AuthShell({ children, description, eyebrow, title }) {
  return (
    <section className="mx-auto max-w-2xl rounded-[32px] border border-[#dfe6ca] bg-white/92 p-6 shadow-[0_24px_80px_rgba(34,51,31,0.1)] backdrop-blur sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d9143]">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#22331f]">{title}</h1>
      {description ? <p className="mt-3 max-w-xl text-sm leading-7 text-[#22331f]/72">{description}</p> : null}
      {children}
    </section>
  )
}

function FarmPicker({ farms, onSelect }) {
  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm font-semibold text-[#22331f]">Choose the farm you want to operate.</p>
      <div className="grid gap-3">
        {farms.map((farm) => (
          <button
            key={farm.id}
            type="button"
            onClick={() => onSelect(farm)}
            className="rounded-[24px] border border-[#b7d387] bg-[#f7f3e8]/70 px-4 py-4 text-left transition hover:border-[#6d9143] hover:bg-[#eef4e5]"
          >
            <span className="block font-semibold text-[#22331f]">{farm.name}</span>
            <span className="mt-1 block text-sm text-[#22331f]/65">
              {farm.location_text || 'No location set'}
            </span>
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
      <AuthShell
        eyebrow="Farm selection"
        title="Select workspace"
        description="Pick the farm workspace you want to manage in this session."
      >
        <FarmPicker
          farms={pendingSession.farms}
          onSelect={(farm) => onAuthenticated({ user: pendingSession.user, farm })}
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Login"
      title="Access your farm workspace"
      description="Review today's work, stock, crop progress, and task verification from one operational dashboard."
    >
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/65">
            Email
          </span>
          <input
            className={inputClassName()}
            type="email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/65">
            Password
          </span>
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
          className="rounded-md bg-[#6d9143] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d7d38] disabled:opacity-70"
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
    <AuthShell
      eyebrow="Sign up"
      title="Create a manager workspace"
      description="Set up a shared farm workspace for managers and workers, then start tracking operations from day one."
    >
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/65">
            Full name
          </span>
          <input
            className={inputClassName()}
            value={draft.full_name}
            onChange={(event) => setDraft((current) => ({ ...current, full_name: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/65">
            Email
          </span>
          <input
            className={inputClassName()}
            type="email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/65">
            Password
          </span>
          <input
            className={inputClassName()}
            type="password"
            value={draft.password}
            onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/65">
            Farm name
          </span>
          <input
            className={inputClassName()}
            value={draft.farm_name}
            onChange={(event) => setDraft((current) => ({ ...current, farm_name: event.target.value }))}
          />
        </label>
        {error ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#6d9143] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d7d38] disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthShell>
  )
}

export { LoginPage, SignupPage }
