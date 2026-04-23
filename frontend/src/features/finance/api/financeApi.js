import { request } from '../../../lib/apiClient.js'

function toQueryString(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '' || value === false) {
      return
    }
    params.set(key, value)
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

const financeApi = {
  dashboard(filters) {
    return request(`/finance-transactions/dashboard/${toQueryString(filters)}`)
  },
  listTransactions(filters) {
    return request(`/finance-transactions/${toQueryString(filters)}`)
  },
  listExpenseRecords(filters) {
    return request(`/expense-records/${toQueryString(filters)}`)
  },
  listRecurringExpenses(filters) {
    return request(`/recurring-expenses/${toQueryString(filters)}`)
  },
  listSalesDeals(filters) {
    return request(`/sales-deals/${toQueryString(filters)}`)
  },
  listSalesDeliveries(filters) {
    return request(`/sales-deliveries/${toQueryString(filters)}`)
  },
  listPartners(filters) {
    return request(`/finance-partners/${toQueryString(filters)}`)
  },
  listExpenseCategories(filters) {
    return request(`/expense-categories/${toQueryString(filters)}`)
  },
  createPartner(payload) {
    return request('/finance-partners/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  createExpenseRecord(payload) {
    return request('/expense-records/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  createSalesDeal(payload) {
    return request('/sales-deals/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  createSalesDelivery(payload) {
    return request('/sales-deliveries/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  createTransaction(payload) {
    return request('/finance-transactions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export default financeApi
