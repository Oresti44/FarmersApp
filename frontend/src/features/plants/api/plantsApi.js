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

const plantsApi = {
  meta() {
    return request('/ui-meta/')
  },
  dashboard(filters) {
    return request(`/plants/dashboard/${toQueryString(filters)}`)
  },
  list(filters) {
    return request(`/plants/${toQueryString(filters)}`)
  },
  get(id) {
    return request(`/plants/${id}/`)
  },
  create(payload) {
    return request('/plants/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id, payload) {
    return request(`/plants/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  delete(id) {
    return request(`/plants/${id}/`, { method: 'DELETE' })
  },
  deleteImpact(id) {
    return request(`/plants/${id}/delete-impact/`)
  },
  changeStage(id, payload) {
    return request(`/plants/${id}/change-stage/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  markFailed(id, payload) {
    return request(`/plants/${id}/mark-failed/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  markHarvested(id, payload) {
    return request(`/plants/${id}/mark-harvested/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listPlots() {
    return request('/plots/')
  },
  createPlot(payload) {
    return request('/plots/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updatePlot(id, payload) {
    return request(`/plots/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deletePlot(id) {
    return request(`/plots/${id}/`, { method: 'DELETE' })
  },
  plotDeleteImpact(id) {
    return request(`/plots/${id}/delete-impact/`)
  },
  listGreenhouses() {
    return request('/greenhouses/')
  },
  createGreenhouse(payload) {
    return request('/greenhouses/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateGreenhouse(id, payload) {
    return request(`/greenhouses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteGreenhouse(id) {
    return request(`/greenhouses/${id}/`, { method: 'DELETE' })
  },
  greenhouseDeleteImpact(id) {
    return request(`/greenhouses/${id}/delete-impact/`)
  },
  createHarvest(payload) {
    return request('/harvest-history/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listHarvest() {
    return request('/harvest-history/')
  },
  updateHarvest(id, payload) {
    return request(`/harvest-history/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteHarvest(id) {
    return request(`/harvest-history/${id}/`, { method: 'DELETE' })
  },
  createResourceUsage(payload) {
    return request('/resource-usage/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listResourceUsage() {
    return request('/resource-usage/')
  },
  updateResourceUsage(id, payload) {
    return request(`/resource-usage/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteResourceUsage(id) {
    return request(`/resource-usage/${id}/`, { method: 'DELETE' })
  },
}

export default plantsApi
