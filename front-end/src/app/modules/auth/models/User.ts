export class User {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public fullName: string,
    public roles: string[],
    private _token: string,
    private _tokenExpirationDate: Date,
    public phoneNumber?: string,
    public address?: string,
  ) {}

  get token(): string | null {
    if (!this._token) {
      console.log("No token available")
      return null
    }
    if (!this._tokenExpirationDate) {
      console.log("No token expiration date")
      return null
    }
    if (new Date() > this._tokenExpirationDate) {
      console.log("Token has expired")
      return null
    }
    return this._token
  }

  get isTokenValid(): boolean {
    return this.token !== null
  }

  hasRole(role: string): boolean {
    return this.roles.some((r) => r === `ROLE_${role.toUpperCase()}`)
  }
}

