function Navbar({ currentRoute, onLogout, routes, session }) {
  const isWorker = session?.user?.role === 'worker'

  return (
    <header className="sticky top-0 z-30 border-b border-[#8ACBD0]/45 bg-[#EFE3CA]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <a
            href="#dashboard"
            className="text-lg font-semibold tracking-tight text-[#170C79]"
          >
            FarmersApp
          </a>
          <p className="text-sm text-[#170C79]/65">
            {session?.farm?.name || (isWorker ? 'Worker task workspace' : 'Farm operations workspace')}
          </p>
        </div>

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
                        ? 'bg-[#8ACBD0] text-[#170C79] shadow-sm hover:bg-[#56B6C6]'
                        : 'text-[#170C79]/75 hover:bg-white/60 hover:text-[#170C79]'
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
              className="rounded-md border border-[#56B6C6]/60 bg-white/55 px-3 py-2 text-sm font-semibold text-[#170C79] transition hover:bg-white"
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
