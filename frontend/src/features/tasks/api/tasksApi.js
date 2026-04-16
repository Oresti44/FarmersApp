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

const tasksApi = {
  list(filters) {
    return request(`/tasks/${toQueryString(filters)}`)
  },
  dashboard(filters) {
    return request(`/tasks/dashboard/${toQueryString(filters)}`)
  },
  activity(filters) {
    return request(`/tasks/activity/${toQueryString(filters)}`)
  },
  get(id) {
    return request(`/tasks/${id}/`)
  },
  create(payload) {
    return request('/tasks/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id, payload) {
    return request(`/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  delete(id, scope = 'task_only') {
    return request(`/tasks/${id}/${toQueryString({ scope })}`, {
      method: 'DELETE',
    })
  },
  deleteImpact(id) {
    return request(`/tasks/${id}/delete-impact/`)
  },
  start(id, payload) {
    return request(`/tasks/${id}/start/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  complete(id, payload) {
    return request(`/tasks/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  confirmCompletion(id, payload) {
    return request(`/tasks/${id}/confirm-completion/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  postpone(id, payload) {
    return request(`/tasks/${id}/postpone/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  cancel(id, payload) {
    return request(`/tasks/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  assignWorkers(id, payload) {
    return request(`/tasks/${id}/assign-workers/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listComments(id) {
    return request(`/tasks/${id}/comments/`)
  },
  addComment(id, payload) {
    return request(`/tasks/${id}/comments/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listHistory(id) {
    return request(`/tasks/${id}/history/`)
  },
}

export default tasksApi
