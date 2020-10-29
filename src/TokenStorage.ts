export class TokenStorage {
  constructor(public token?: string | null) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('application_token');
    }
  }
  get() {
    return this.token;
  }
  set(token: string) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('application_token', token);
    }
  }
  clear() {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('application_token');
    }
  }
}
