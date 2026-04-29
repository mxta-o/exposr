const API_BASE = 'http://localhost:3001/api';

const ExposrAPI = {
  getToken() {
    return localStorage.getItem('exposr_token');
  },
  getUser() {
    const u = localStorage.getItem('exposr_user');
    return u ? JSON.parse(u) : null;
  },
  setAuth(token, user) {
    localStorage.setItem('exposr_token', token);
    localStorage.setItem('exposr_user', JSON.stringify(user));
  },
  clearAuth() {
    localStorage.removeItem('exposr_token');
    localStorage.removeItem('exposr_user');
  },
  authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`,
    };
  },
  async signup(username, email, password) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  async getFeed() {
    const res = await fetch(`${API_BASE}/photos/feed`, {
      headers: this.authHeaders(),
    });
    return res.json();
  },
  async getMyShots() {
    const res = await fetch(`${API_BASE}/photos/my-shots`, {
      headers: this.authHeaders(),
    });
    return res.json();
  },
  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_BASE}/photos/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.getToken()}` },
      body: formData,
    });
    return res.json();
  },
  async reportPhoto(photoId, reason) {
    const res = await fetch(`${API_BASE}/admin/report/${photoId}`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },
};

window.ExposrAPI = ExposrAPI;
