import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FinancePage from './pages/FinancePage.jsx'
import PlantsPage from './features/plants/pages/PlantsPage.jsx'
import TasksPage from './features/tasks/pages/TasksPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'

const routes = {
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

function getRouteFromHash() {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase()
  return routes[hash] ? hash : defaultRoute
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash)

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = defaultRoute
    }

    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const CurrentPage = routes[currentRoute].component

  return (
    <AppLayout currentRoute={currentRoute} routes={routes}>
      <CurrentPage />
    </AppLayout>
  )
}

export default App
