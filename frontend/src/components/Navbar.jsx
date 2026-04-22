function Navbar({ currentRoute, routes }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f5ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
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

        <nav className="flex flex-wrap gap-1">
          {Object.entries(routes).map(([key, route]) => {
            const isActive = currentRoute === key

            return (
              <a
                key={key}
                href={`#${key}`}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-stone-950 text-white hover:bg-stone-900'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
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
