import { request } from '../../../lib/apiClient.js'

const authApi = {
  login(payload) {
    return request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  signup(payload) {
    return request('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export default authApi
