function PageShell({ eyebrow, title }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/78 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
        {title}
      </h1>
    </section>
  )
}

export default PageShell
