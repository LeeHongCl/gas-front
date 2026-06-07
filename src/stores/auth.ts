import { computed, ref, watch } from 'vue'
import { apiGetMyProfile } from '@/api/authApi'

export interface UserProfile {
  name: string
  carModel: string
  fuelEfficiency: string
  fuelType: 'GASOLINE' | 'DIESEL' | 'PREMIUM_GASOLINE' | 'LPG'
}

const STORAGE_KEY = 'gasstation-auth'
const TOKEN_KEY = 'gasstation-token'

interface PersistedAuthState {
  isLoggedIn: boolean
  hasCompletedInitialProfile: boolean
  profile: UserProfile
}

function getDefaultProfile(): UserProfile {
  return {
    name: '',
    carModel: '',
    fuelEfficiency: '',
    fuelType: 'GASOLINE',
  }
}

function loadStoredAuthState(): PersistedAuthState {
  const fallback: PersistedAuthState = {
    isLoggedIn: false,
    hasCompletedInitialProfile: false,
    profile: getDefaultProfile(),
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<PersistedAuthState>

    return {
      isLoggedIn: parsed.isLoggedIn ?? false,
      hasCompletedInitialProfile: parsed.hasCompletedInitialProfile ?? false,
      profile: {
        ...getDefaultProfile(),
        ...(parsed.profile ?? {}),
      },
    }
  } catch {
    return fallback
  }
}

const initialState = loadStoredAuthState()

const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const isLoggedIn = ref(initialState.isLoggedIn)
const hasCompletedInitialProfile = ref(initialState.hasCompletedInitialProfile)
const profile = ref<UserProfile>(initialState.profile)

watch(
  [isLoggedIn, hasCompletedInitialProfile, profile],
  () => {
    const nextState: PersistedAuthState = {
      isLoggedIn: isLoggedIn.value,
      hasCompletedInitialProfile: hasCompletedInitialProfile.value,
      profile: profile.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  },
  { deep: true },
)

function setToken(t: string) {
  token.value = t
  localStorage.setItem(TOKEN_KEY, t)
}

function clearToken() {
  token.value = null
  localStorage.removeItem(TOKEN_KEY)
}

async function loginWithOAuth(idToken: string) {
  setToken(idToken)

  try {
    const data = await apiGetMyProfile(idToken)
    profile.value = {
      name: data.name ?? '',
      carModel: data.carModel ?? '',
      fuelEfficiency: data.fuelEfficiency != null ? String(data.fuelEfficiency) : '',
      fuelType: data.fuelType ?? 'GASOLINE',
    }
    hasCompletedInitialProfile.value = !!data.carModel && data.fuelEfficiency != null
  } catch {
    profile.value = { ...getDefaultProfile() }
    hasCompletedInitialProfile.value = false
  }

  isLoggedIn.value = true
}

function logout() {
  isLoggedIn.value = false
  hasCompletedInitialProfile.value = false
  profile.value = getDefaultProfile()
  clearToken()
  localStorage.removeItem(STORAGE_KEY)
}

function completeInitialProfile(payload: {
  carModel: string
  fuelEfficiency: string
  fuelType: 'GASOLINE' | 'DIESEL' | 'PREMIUM_GASOLINE' | 'LPG'
}) {
  hasCompletedInitialProfile.value = true
  profile.value = {
    ...profile.value,
    carModel: payload.carModel,
    fuelEfficiency: payload.fuelEfficiency,
    fuelType: payload.fuelType,
  }
}

function skipInitialProfile() {
  hasCompletedInitialProfile.value = true
}

function updateProfile(payload: Partial<UserProfile>) {
  profile.value = {
    ...profile.value,
    ...payload,
  }
}

export function useAuthStore() {
  const isInitialMember = computed(
    () => isLoggedIn.value && !hasCompletedInitialProfile.value,
  )

  return {
    token,
    isLoggedIn,
    hasCompletedInitialProfile,
    isInitialMember,
    profile,
    loginWithOAuth,
    logout,
    completeInitialProfile,
    skipInitialProfile,
    updateProfile,
  }
}
