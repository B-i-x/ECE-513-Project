function registerUser() {
    const email = $('#email').val();
    const password = $('#password').val();

    if (!email || !password) {
        window.alert("Email and password are required!");
        return;
    }

    $.ajax({
        url: '/users/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        dataType: 'json'
    })
        .done(data => {
            $('#rxData').html(JSON.stringify(data, null, 2));
            window.alert("Email Registered.");
        })
        .fail(data => {
            if (data.status === 401) {
                // Specific status code for "Device already registered"
                console.error("Device already registered:", data.responseJSON); // Debug log
                window.alert("Email already registered!");
            }
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}

function loginUser() {
    const email = $('#email').val();
    const password = $('#password').val();

    if (!email || !password) {
        window.alert("Email and password are required!");
        return;
    }

    $.ajax({
        url: '/users/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        dataType: 'json'
    })
        .done(data => {
            const token = data.token;
            if (token) {
                localStorage.setItem('authToken', token); // Store the token securely
                localStorage.setItem('userEmail', email); // Store the email for later use
                window.alert("Login successful!");
                window.location.href = 'account.html'; // Redirect to account page
            } else {
                window.alert("Token not received from server.");
            }
        })
        .fail(data => {
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
            window.alert("Login failed. Please try again.");
        });
}

$(function () {
    $('#btnRegister').click(registerUser);
    $('#btnLogin').click(loginUser);
});