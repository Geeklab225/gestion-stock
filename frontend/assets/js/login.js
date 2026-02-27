import { apiRequest, clearAuth, getToken, setAuth } from './http-client.js';

if (getToken()) {
    window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/index.php`);
}

const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');

form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.textContent = '';

    const formData = new FormData(form);
    const payload = {
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
    };

    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: payload,
            auth: false,
        });

        const token = response?.data?.token ?? response?.token ?? '';
        const user = response?.data?.user ?? response?.user ?? null;
        if (!token || !user) {
            throw new Error('Reponse de connexion invalide');
        }

        setAuth(token, user);

        window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/index.php`);
    } catch (error) {
        clearAuth();
        errorBox.textContent = error.message || 'Connexion impossible';
    }
});
