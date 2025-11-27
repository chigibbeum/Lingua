import type { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  username?: string
  firstName?: string
  lastName?: string
  createdAt?: Timestamp | string | null
}

export interface UsernameClaim {
  ownerUid: string
  createdAt: number
}


