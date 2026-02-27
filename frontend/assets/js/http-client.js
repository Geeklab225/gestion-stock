const API_BASE_URL = window.APP_CONFIG.apiBaseUrl.replace(/\/$/, '');
const TOKEN_KEY = 'gs_token';
const USER_KEY = 'gs_user';

function readStorage(key) {
    try {
        return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch (_) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return;
    } catch (_) {
    }

    try {
        sessionStorage.setItem(key, value);
    } catch (_) {
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (_) {
    }

    try {
        sessionStorage.removeItem(key);
    } catch (_) {
    }
}

export function getToken() {
    return readStorage(TOKEN_KEY) ?? '';
}

export function setAuth(token, user) {
    writeStorage(TOKEN_KEY, String(token ?? ''));
    writeStorage(USER_KEY, JSON.stringify(user ?? {}));
}

export function clearAuth() {
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
}

export async function apiRequest(path, options = {}) {
    const { method = 'GET', body, auth = true } = options;

    const headers = {
        'Content-Type': 'application/json',
    };

    if (auth) {
        const token = getToken();
        if (!token) {
            throw new Error('Session expirée');
        }
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
        return null;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) {
            clearAuth();
            window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/login.php`);
        }

        throw new Error(toFrenchError(payload.message || 'Erreur API'));
    }

    return payload;
}

export async function uploadRequest(path, formData, options = {}) {
    const { method = 'POST', auth = true } = options;
    const headers = {};

    if (auth) {
        const token = getToken();
        if (!token) {
            throw new Error('Session expiree');
        }
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401) {
            clearAuth();
            window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/login.php`);
        }
        throw new Error(toFrenchError(payload.message || 'Erreur upload'));
    }

    return payload;
}

function toFrenchError(message) {
    const msg = String(message ?? '').trim();
    const dictionary = {
        'Server error': 'Erreur serveur',
        'Internal server error': 'Erreur interne du serveur',
        'Invalid credentials': 'Identifiants invalides',
        'Unauthorized': 'Session non autorisee',
        'Inactive account': 'Compte inactif',
        'Route not found': 'Route introuvable',
        'Upload impossible': 'Televersement impossible',
        'Export impossible': 'Export impossible',
    };

    return dictionary[msg] ?? msg;
}
