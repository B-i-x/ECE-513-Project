document.getElementById('user-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;

    // Example POST request to the server
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'user' }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful!');
            window.location.href = '/dashboard';
        } else {
            alert('Login failed: ' + data.message);
        }
    });
});

document.getElementById('physician-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('physician-email').value;
    const password = document.getElementById('physician-password').value;

    // Example POST request to the server
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'physician' }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful!');
            window.location.href = '/dashboard';
        } else {
            alert('Login failed: ' + data.message);
        }
    });
});
