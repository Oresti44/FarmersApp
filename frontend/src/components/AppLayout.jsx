import Navbar from './Navbar.jsx'

function AppLayout({ children, currentRoute, onLogout, routes, session }) {
  const isWorkspaceRoute =
    currentRoute === 'work' || currentRoute === 'plants' || currentRoute === 'finance' || currentRoute === 'inventory'

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4e8_0%,#eef3dd_46%,#dce8bd_100%)] text-[#22331f]">
      <div className="absolute inset-x-0 top-0 -z-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(109,145,67,0.22),transparent_42%),radial-gradient(circle_at_top_right,rgba(183,211,135,0.28),transparent_36%)]" />
      <div className="relative z-10 min-h-screen">
        <Navbar currentRoute={currentRoute} onLogout={onLogout} routes={routes} session={session} />
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

