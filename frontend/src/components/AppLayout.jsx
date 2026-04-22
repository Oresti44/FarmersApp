import Navbar from './Navbar.jsx'

function AppLayout({ children, currentRoute, routes }) {
  const isWorkspaceRoute = currentRoute === 'work' || currentRoute === 'plants'

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f5ef_0%,#f2f6ef_48%,#ecf0e7_100%)] text-stone-900">
      <div className="absolute inset-x-0 top-0 -z-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(155,188,141,0.25),transparent_42%),radial-gradient(circle_at_top_right,rgba(229,209,181,0.32),transparent_36%)]" />
      <div className="relative z-10 min-h-screen">
        <Navbar currentRoute={currentRoute} routes={routes} />
        <main
          className={
            isWorkspaceRoute
              ? 'min-h-[calc(100vh-4.75rem)]'
              : 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'
          }
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
