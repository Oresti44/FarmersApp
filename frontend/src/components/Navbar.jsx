function Navbar({ currentRoute, routes }) {
  return (
    <header className="sticky top-5 z-20">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_24px_80px_rgba(82,97,69,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <a
            href="#dashboard"
            className="text-lg font-semibold tracking-tight text-stone-950"
          >
            FarmersApp
          </a>
          <p className="text-sm text-stone-500">
            Farm operations workspace
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {Object.entries(routes).map(([key, route]) => {
            const isActive = currentRoute === key

            return (
              <a
                key={key}
                href={`#${key}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {route.label}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
