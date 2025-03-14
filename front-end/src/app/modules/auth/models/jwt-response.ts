export interface JwtResponse {
  token: string
  type: string
  id: number
  username: string
  email: string
  fullName: string
  roles: string[]
  phoneNumber?: string
  address?: string
}

