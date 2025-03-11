export class User {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public fullName: string,
    public roles: string[],
    private _token: string,
    public phoneNumber?: string,
    public address?: string
  ) {}

  get token(): string | null {
    if (!this._token) {
      return null;
    }else {
      return this._token;
    }
  }
}
