import axios from 'axios';
export function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('fl_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUserInStorage(user) {
  localStorage.setItem('fl_user', JSON.stringify(user));
}

export function clearUserFromStorage() {
  localStorage.removeItem('fl_user');
}

/* ── AXIOS INSTANCE ───────────────────────────────────── */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const user = getUserFromStorage();

    if (user?.id) {
      const isAnalyticsCall = config.url?.includes('/analytics');

      if (config.method === 'get' && isAnalyticsCall) {
        config.params = {
          ...config.params,
          user_id: user.id,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
  RESPONSE INTERCEPTOR
*/
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearUserFromStorage();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/* ── USERS API ───────────────────────────────────────── */
export const authAPI = {
  signup: (email, password) =>
    api.post('/api/users/signup', { email, password }),

  login: (email, password) =>
    api.post('/api/users/login', { email, password }),
};

/* ── DECKS API ───────────────────────────────────────── */
export const decksAPI = {
  getAll: (userId) =>
    api.get('/api/decks/', { params: { user_id: userId } }),

  getOne: (deckId) =>
    api.get(`/api/decks/${deckId}`),

  create: (userId, data) =>
    api.post('/api/decks/', data, { params: { user_id: userId } }),

  delete: (deckId) =>
    api.delete(`/api/decks/${deckId}`),

  setExamDate: (deckId, examDate) =>
    api.put(`/api/decks/${deckId}/exam-date`, { exam_date: examDate }),
};

/* ── CARDS API ───────────────────────────────────────── */
export const cardsAPI = {
  getByDeck: (deckId) =>
    api.get('/api/cards/', { params: { deck_id: deckId } }),

  create: (deckId, front, back) =>
    api.post('/api/cards/', { front, back }, { params: { deck_id: deckId } }),

  update: (cardId, front, back) =>
    api.put(`/api/cards/${cardId}`, { front, back }),

  delete: (cardId) =>
    api.delete(`/api/cards/${cardId}`),
};

/* ── SESSIONS API ─────────────────────────────────────── */
export const sessionsAPI = {
  getDueCards: (deckId) =>
    api.get(`/api/sessions/due/${deckId}`),

  start: (userId, deckId) =>
    api.post('/api/sessions/start', { user_id: userId, deck_id: deckId }),

  review: (sessionId, cardId, wasCorrect, responseTimeMs) =>
    api.post('/api/sessions/review', {
      session_id: sessionId,
      card_id: cardId,
      was_correct: wasCorrect,
      response_time_ms: responseTimeMs,
    }),

  end: (sessionId) =>
    api.put('/api/sessions/end', { session_id: sessionId }),
};

/* ── ANALYTICS API ───────────────────────────────────── */
export const analyticsAPI = {
  getStreak: (userId) =>
    api.get('/api/analytics/streak', { params: { user_id: userId } }),

  getAccuracy: (userId) =>
    api.get('/api/analytics/accuracy', { params: { user_id: userId } }),

  getRetention: (userId) =>
    api.get('/api/analytics/retention', { params: { user_id: userId } }),

  getDeckHealth: (userId) =>
    api.get('/api/analytics/deck-health', { params: { user_id: userId } }),

  getDueNow: (userId) =>
    api.get('/api/analytics/due-now', { params: { user_id: userId } }),
};