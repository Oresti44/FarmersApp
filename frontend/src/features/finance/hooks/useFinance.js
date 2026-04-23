import { useCallback, useEffect, useState } from 'react'

import financeApi from '../api/financeApi.js'

function useFinance(filters = {}) {
  const [dashboard, setDashboard] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [expenseRecords, setExpenseRecords] = useState([])
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [salesDeals, setSalesDeals] = useState([])
  const [salesDeliveries, setSalesDeliveries] = useState([])
  const [partners, setPartners] = useState([])
  const [expenseCategories, setExpenseCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async function refreshFinance(active = true) {
    setLoading(true)
    setError('')

    try {
      const [
        dashboardData,
        transactionData,
        expenseData,
        recurringData,
        salesDealData,
        deliveryData,
        partnerData,
        categoryData,
      ] = await Promise.all([
        financeApi.dashboard(filters),
        financeApi.listTransactions(filters),
        financeApi.listExpenseRecords(filters),
        financeApi.listRecurringExpenses(filters),
        financeApi.listSalesDeals(filters),
        financeApi.listSalesDeliveries(filters),
        financeApi.listPartners({}),
        financeApi.listExpenseCategories({}),
      ])

      if (!active) {
        return
      }

      setDashboard(dashboardData)
      setTransactions(transactionData)
      setExpenseRecords(expenseData)
      setRecurringExpenses(recurringData)
      setSalesDeals(salesDealData)
      setSalesDeliveries(deliveryData)
      setPartners(partnerData)
      setExpenseCategories(categoryData)
    } catch (caughtError) {
      if (active) {
        setError(caughtError.message || 'Unable to load finance data.')
      }
    } finally {
      if (active) {
        setLoading(false)
      }
    }
  }, [filters])

  useEffect(() => {
    let active = true

    refresh(active)

    return () => {
      active = false
    }
  }, [refresh])

  return {
    dashboard,
    error,
    expenseCategories,
    expenseRecords,
    loading,
    partners,
    recurringExpenses,
    refresh,
    salesDeals,
    salesDeliveries,
    transactions,
  }
}

export default useFinance
