// API service layer — all backend calls go through here
const BASE_URL = 'http://localhost:8080';

async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ── Auth ──────────────────────────────────────────────
export const loginUser = (email, password) =>
  apiFetch('/api/v1/auth/authenticate', { method: 'POST', body: JSON.stringify({ email, password }) });

export const registerUser = (payload) =>
  apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) });

// ── Books ─────────────────────────────────────────────
export const fetchBooks = (token) => apiFetch('/api/books', {}, token);
export const searchBooks = (params, token) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/books/search?${query}`, {}, token);
};
export const createBook = (book, token) =>
  apiFetch('/api/books', { method: 'POST', body: JSON.stringify(book) }, token);
export const updateBook = (id, book, token) =>
  apiFetch(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }, token);
export const deleteBook = (id, token) =>
  apiFetch(`/api/books/${id}`, { method: 'DELETE' }, token);

// ── Categories ────────────────────────────────────────
export const fetchCategories = (token) => apiFetch('/api/categories', {}, token);

// ── Reviews ───────────────────────────────────────────
export const fetchReviews = (bookId, token) => apiFetch(`/api/reviews/book/${bookId}`, {}, token);
export const addReview = (review, token) =>
  apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(review) }, token);

// ── Reservations ──────────────────────────────────────
export const reserveBook = (bookId, memberId, token) =>
  apiFetch(`/api/reservations/${bookId}/${memberId}`, { method: 'POST' }, token);
export const fetchBookReservations = (bookId, token) =>
  apiFetch(`/api/reservations/book/${bookId}`, {}, token);

// ── Members ──────────────────────────────────────────
export const fetchMembers = (token) => apiFetch('/api/members', {}, token);
export const createMember = (member, token) =>
  apiFetch('/api/members', { method: 'POST', body: JSON.stringify(member) }, token);
export const updateMember = (id, member, token) =>
  apiFetch(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(member) }, token);
export const deleteMember = (id, token) =>
  apiFetch(`/api/members/${id}`, { method: 'DELETE' }, token);
export const fetchMembershipPlans = (token) => apiFetch('/api/members/plans', {}, token);
export const assignMembership = (memberId, planId, token) =>
  apiFetch(`/api/members/${memberId}/membership/${planId}`, { method: 'POST' }, token);

// ── Borrow ────────────────────────────────────────────
export const fetchBorrowRecords = (token) => apiFetch('/api/borrow', {}, token);
export const borrowBook = (bookId, memberId, token) =>
  apiFetch(`/api/borrow/${bookId}/${memberId}`, { method: 'POST' }, token);
export const returnBook = (recordId, token) =>
  apiFetch(`/api/borrow/return/${recordId}`, { method: 'POST' }, token);
export const renewBook = (recordId, token) =>
  apiFetch(`/api/borrow/renew/${recordId}`, { method: 'POST' }, token);
export const triggerOverdueCheck = (token) =>
  apiFetch('/api/borrow/update-overdue', { method: 'POST' }, token);

// ── Stats ─────────────────────────────────────────────
export const fetchStats = (token) => apiFetch('/api/stats', {}, token);

// ── Donations ─────────────────────────────────────────
export const fetchDonations = (token) => apiFetch('/api/donations', {}, token);
export const createDonation = (donation, token) =>
  apiFetch('/api/donations', { method: 'POST', body: JSON.stringify(donation) }, token);

// ── Payments ──────────────────────────────────────────
export const fetchPayments = (token) => apiFetch('/api/payments', {}, token);
export const processPayment = (payload, token) =>
  apiFetch('/api/payments', { method: 'POST', body: JSON.stringify(payload) }, token);
export const createPaymentIntent = (payload, token) =>
  apiFetch('/api/payments/create-intent', { method: 'POST', body: JSON.stringify(payload) }, token);
export const confirmPayment = (intentId, token) =>
  apiFetch(`/api/payments/confirm?intentId=${intentId}`, { method: 'POST' }, token);

// ── Files ─────────────────────────────────────────────
export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  if (!response.ok) throw new Error('File upload failed');
  return response.text();
};

export const getFileUrl = (path) => `${BASE_URL}${path}`;

// ── Lottery ──────────────────────────────────────────
export const fetchLotterySpins = (token) => apiFetch('/api/lottery/spins', {}, token);

export const spinLottery = (token) =>
  apiFetch('/api/lottery/spin', { method: 'POST' }, token);

export const fetchLotteryHistory = (token) => apiFetch('/api/lottery/history', {}, token);

export const claimLotteryPrize = (prizeId, token) =>
  apiFetch(`/api/lottery/claim/${prizeId}`, { method: 'POST' }, token);
