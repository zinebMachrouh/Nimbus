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
    public address?: string
  ) {}

  get token(): string | null {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}
