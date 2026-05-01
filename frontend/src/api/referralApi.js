import { apiClient } from './apiClient'

export async function getReferralStats() {
  const { data } = await apiClient.get('/referral/stats')
  return data
}

export async function applyReferralCode(referralCode) {
  const { data } = await apiClient.post('/referral/apply', { referralCode })
  return data
}
