const API_URL = 'https://portfolio-backend-z2kz.onrender.com/api';

console.log('Auth Script Loaded. API URL:', API_URL);

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

if (!loginForm) {
    console.error('Login form with ID "login-form" not found!');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');

    errorMsg.style.display = 'none';
    errorMsg.textContent = '';

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Sending login request to:', `${API_URL}/auth/login`);
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            console.log('Login successful, redirecting to admin.html');
            window.location.href = 'admin.html';
        } else {
            errorMsg.textContent = data.message || 'Login failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error('Login error:', err);
        errorMsg.textContent = 'Server connection failed. Is the backend running?';
        errorMsg.style.display = 'block';
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});
