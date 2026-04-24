import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FinancePage from './pages/FinancePage.jsx'
import PlantsPage from './features/plants/pages/PlantsPage.jsx'
import TasksPage from './features/tasks/pages/TasksPage.jsx'
import WorkerTasksPage from './features/tasks/pages/WorkerTasksPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import { LoginPage, SignupPage } from './features/auth/pages/AuthPages.jsx'

const publicRoutes = {
  dashboard: {
    label: 'Home',
    component: DashboardPage,
  },
  login: {
    label: 'Login',
    component: LoginPage,
  },
  signup: {
    label: 'Sign up',
    component: SignupPage,
  },
}

const managerRoutes = {
  dashboard: {
    label: 'Dashboard',
    component: DashboardPage,
  },
  finance: {
    label: 'Finance',
    component: FinancePage,
  },
  inventory: {
    label: 'Inventory',
    component: InventoryPage,
  },
  work: {
    label: 'Tasks',
    component: TasksPage,
  },
  plants: {
    label: 'Plants',
    component: PlantsPage,
  },
}

const defaultRoute = 'dashboard'

function readSession() {
  try {
    return JSON.parse(window.localStorage.getItem('farmersapp_session')) || null
  } catch {
    return null
  }
}

function getRouteFromHash(routes) {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase()
  return routes[hash] ? hash : defaultRoute
}

function App() {
  const [session, setSession] = useState(readSession)
  const routes = session?.user?.role === 'manager' ? managerRoutes : publicRoutes
  const [currentRoute, setCurrentRoute] = useState(() => getRouteFromHash(routes))

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = defaultRoute
    }

    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash(routes))
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [routes])

  function persistSession(nextSession) {
    setSession(nextSession)
    window.localStorage.setItem('farmersapp_session', JSON.stringify(nextSession))
    window.location.hash = nextSession.user.role === 'worker' ? 'worker-tasks' : 'dashboard'
  }

  function logout() {
    setSession(null)
    window.localStorage.removeItem('farmersapp_session')
    window.location.hash = 'dashboard'
  }

  if (session?.user?.role === 'worker') {
    return (
      <AppLayout currentRoute="worker-tasks" onLogout={logout} routes={{}} session={session}>
        <WorkerTasksPage session={session} />
      </AppLayout>
    )
  }

  const safeRoute = routes[currentRoute] ? currentRoute : defaultRoute
  const CurrentPage = routes[safeRoute].component

  return (
    <AppLayout currentRoute={safeRoute} onLogout={logout} routes={routes} session={session}>
      <CurrentPage onAuthenticated={persistSession} session={session} />
    </AppLayout>
  )
}

export default App
