export interface MockUser {
  id: string
  name: string
  email: string
  password: string
  carModel: string
  fuelEfficiency: string
  hasCompletedInitialProfile: boolean
}

export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    name: '홍길동',
    email: 'test1@example.com',
    password: '1234',
    carModel: '아반떼',
    fuelEfficiency: '14.8',
    hasCompletedInitialProfile: true,
  },
  {
    id: 'u2',
    name: '김주유',
    email: 'test2@example.com',
    password: '1234',
    carModel: '',
    fuelEfficiency: '',
    hasCompletedInitialProfile: false,
  },
  {
    id: 'u3',
    name: '이연비',
    email: 'test3@example.com',
    password: '1234',
    carModel: '쏘나타',
    fuelEfficiency: '11.9',
    hasCompletedInitialProfile: true,
  },
]