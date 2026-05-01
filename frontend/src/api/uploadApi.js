import { apiClient } from './apiClient'

export async function uploadSingleFile(file, { folder = 'trans' } = {}) {
  if (!file) return null
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)

  const { data } = await apiClient.post('/uploads/single', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}
