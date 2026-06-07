const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface UserProfileResponse {
  id: number
  name: string
  carModel: string | null
  fuelType: 'GASOLINE' | 'DIESEL' | 'PREMIUM_GASOLINE' | 'LPG' | null
  fuelEfficiency: number | null
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `오류가 발생했습니다. (${res.status})`)
  }
  return res.json()
}

export async function apiGetMyProfile(token: string): Promise<UserProfileResponse> {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse<UserProfileResponse>(res)
}
