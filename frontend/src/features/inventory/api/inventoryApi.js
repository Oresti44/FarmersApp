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

const inventoryApi = {
  dashboard(filters) {
    return request(`/inventory-items/dashboard/${toQueryString(filters)}`)
  },
  listItems(filters) {
    return request(`/inventory-items/${toQueryString(filters)}`)
  },
  getItem(id) {
    return request(`/inventory-items/${id}/`)
  },
  createItem(payload) {
    return request('/inventory-items/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateItem(id, payload) {
    return request(`/inventory-items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteItem(id) {
    return request(`/inventory-items/${id}/`, { method: 'DELETE' })
  },
  deleteImpact(id) {
    return request(`/inventory-items/${id}/delete-impact/`)
  },
  listMovements(filters) {
    return request(`/inventory-movements/${toQueryString(filters)}`)
  },
  createMovement(payload) {
    return request('/inventory-movements/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateMovement(id, payload) {
    return request(`/inventory-movements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteMovement(id) {
    return request(`/inventory-movements/${id}/`, { method: 'DELETE' })
  },
  listCategories() {
    return request('/inventory-categories/')
  },
  createCategory(payload) {
    return request('/inventory-categories/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateCategory(id, payload) {
    return request(`/inventory-categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteCategory(id) {
    return request(`/inventory-categories/${id}/`, { method: 'DELETE' })
  },
}

export default inventoryApi
