function Navbar({ currentRoute, onLogout, routes, session }) {
  const isWorker = session?.user?.role === 'worker'

  return (
    <header className="sticky top-0 z-30 border-b border-[#b7d387]/45 bg-[#f4ecd9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <a href="#dashboard" className="text-lg font-semibold tracking-tight text-[#22331f]">
          Farm Insight
        </a>

        <nav className="flex flex-wrap gap-1">
          {!isWorker
            ? Object.entries(routes).map(([key, route]) => {
                const isActive = currentRoute === key

                return (
                  <a
                    key={key}
                    href={`#${key}`}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#b7d387] text-[#22331f] shadow-sm hover:bg-[#6d9143]'
                        : 'text-[#22331f]/75 hover:bg-white/60 hover:text-[#22331f]'
                    }`}
                  >
                    {route.label}
                  </a>
                )
              })
            : null}
          {session ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-[#6d9143]/60 bg-white/55 px-3 py-2 text-sm font-semibold text-[#22331f] transition hover:bg-white"
            >
              Log out
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
