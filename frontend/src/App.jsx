function App() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f4eed7_0%,#f7faf2_45%,#d8ead3_100%)] text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-12">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-700/20 bg-white/70 px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-900 shadow-sm backdrop-blur">
            FarmersApp starter
          </p>
          <h1 className="max-w-2xl font-serif text-5xl leading-tight tracking-tight text-stone-950 sm:text-6xl">
            React, Django, PostgreSQL, and Tailwind are ready for the first real feature.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            This workspace starts with a frontend shell, a backend API root, PostgreSQL-ready
            environment settings, and just enough structure to begin building farm, product,
            and order flows without cleaning up generated demo code first.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-stone-900/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(34,60,39,0.12)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Frontend</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">Vite + React</h2>
            <p className="mt-3 text-stone-700">
              Fast local dev server, Tailwind styling, and a clean entry point in <code>src/App.jsx</code>.
            </p>
          </article>
          <article className="rounded-3xl border border-stone-900/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(34,60,39,0.12)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Backend</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">Django + DRF</h2>
            <p className="mt-3 text-stone-700">
              Env-driven settings, CORS configured for the frontend, and a starter health endpoint under <code>/api/health/</code>.
            </p>
          </article>
          <article className="rounded-3xl border border-stone-900/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(34,60,39,0.12)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Database</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">PostgreSQL-ready</h2>
            <p className="mt-3 text-stone-700">
              Fill in <code>backend/.env</code>, create the database, then run migrations when you are ready.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
