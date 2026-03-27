import { computed, ref, watch } from 'vue'
import { mockUsers, type MockUser } from '@/mocks/mockUsers'

export interface UserProfile {
  name: string
  email: string
  carModel: string
  fuelEfficiency: string
}

const STORAGE_KEY = 'gasstation-auth'
const USERS_STORAGE_KEY = 'gasstation-mock-users'

interface PersistedAuthState {
  isLoggedIn: boolean
  hasCompletedInitialProfile: boolean
  profile: UserProfile
}

function getDefaultProfile(): UserProfile {
  return {
    name: '',
    email: '',
    carModel: '',
    fuelEfficiency: '',
  }
}

function loadMockUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers))
      return [...mockUsers]
    }

    const parsed = JSON.parse(raw) as MockUser[]
    return Array.isArray(parsed) ? parsed : [...mockUsers]
  } catch (error) {
    console.error('임시 유저 데이터를 불러오지 못했습니다.', error)
    return [...mockUsers]
  }
}

const users = ref<MockUser[]>(loadMockUsers())

function saveMockUsers() {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users.value))
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
  } catch (error) {
    console.error('저장된 인증 정보를 불러오지 못했습니다.', error)
    return fallback
  }
}

const initialState = loadStoredAuthState()

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

function login(email: string, password: string) {
  const foundUser = users.value.find(
    (user) => user.email === email && user.password === password,
  )

  if (!foundUser) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  isLoggedIn.value = true
  hasCompletedInitialProfile.value = foundUser.hasCompletedInitialProfile
  profile.value = {
    name: foundUser.name,
    email: foundUser.email,
    carModel: foundUser.carModel,
    fuelEfficiency: foundUser.fuelEfficiency,
  }
}

function logout() {
  isLoggedIn.value = false
  hasCompletedInitialProfile.value = false
  profile.value = getDefaultProfile()
  localStorage.removeItem(STORAGE_KEY)
}

function signUp(payload: { name: string; email: string; password: string }) {
  const exists = users.value.some((user) => user.email === payload.email)

  if (exists) {
    throw new Error('이미 존재하는 이메일입니다.')
  }

  const newUser: MockUser = {
    id: `u${Date.now()}`,
    name: payload.name,
    email: payload.email,
    password: payload.password,
    carModel: '',
    fuelEfficiency: '',
    hasCompletedInitialProfile: false,
  }

  users.value.push(newUser)
  saveMockUsers()

  isLoggedIn.value = true
  hasCompletedInitialProfile.value = false
  profile.value = {
    name: newUser.name,
    email: newUser.email,
    carModel: '',
    fuelEfficiency: '',
  }
}

function completeInitialProfile(payload: { carModel: string; fuelEfficiency: string }) {
  hasCompletedInitialProfile.value = true
  profile.value = {
    ...profile.value,
    carModel: payload.carModel,
    fuelEfficiency: payload.fuelEfficiency,
  }

  const foundUser = users.value.find((user) => user.email === profile.value.email)
  if (foundUser) {
    foundUser.carModel = payload.carModel
    foundUser.fuelEfficiency = payload.fuelEfficiency
    foundUser.hasCompletedInitialProfile = true
    saveMockUsers()
  }
}

function skipInitialProfile() {
  hasCompletedInitialProfile.value = true

  const foundUser = users.value.find((user) => user.email === profile.value.email)
  if (foundUser) {
    foundUser.hasCompletedInitialProfile = true
    saveMockUsers()
  }
}

function updateProfile(payload: Partial<UserProfile>) {
  profile.value = {
    ...profile.value,
    ...payload,
  }

  const foundUser = users.value.find((user) => user.email === profile.value.email)
  if (foundUser) {
    foundUser.name = profile.value.name
    foundUser.carModel = profile.value.carModel
    foundUser.fuelEfficiency = profile.value.fuelEfficiency
    saveMockUsers()
  }
}

function resetMockUsers() {
  users.value = [...mockUsers]
  saveMockUsers()
  logout()
}

export function useAuthStore() {
  const isInitialMember = computed(
    () => isLoggedIn.value && !hasCompletedInitialProfile.value,
  )

  return {
    isLoggedIn,
    hasCompletedInitialProfile,
    isInitialMember,
    profile,
    users,
    login,
    logout,
    signUp,
    completeInitialProfile,
    skipInitialProfile,
    updateProfile,
    resetMockUsers,
  }
}