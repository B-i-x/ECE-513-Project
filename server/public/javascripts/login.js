
// Function to register a user with role support
// Function to parse query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to register a user with role support
function registerUser() {
    const email = $('#email').val();
    const password = $('#password').val();
    const userRole = $('#userRole').val(); // Role is extracted from the hidden input
    let specialization = null;

    if (!email || !password) {
        alert("Email and password are required!");
        return;
    }

    if (userRole === 'physician') {
        specialization = prompt("Enter your specialization (e.g., Cardiology, Pediatrics):");
        if (!specialization) {
            alert("Specialization is required for physician registration.");
            return;
        }
    }

    const requestData = {
        email,
        password,
        role: userRole,
        specialization: userRole === 'physician' ? specialization : undefined,
    };

    $.ajax({
        url: '/users/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        dataType: 'json'
    })
        .done(data => {
            alert(`Registration successful for ${data.user.role}: ${data.user.email}`);
            window.location.href = 'login.html?role=' + userRole; // Redirect to login with role
        })
        .fail(data => {
            if (data.status === 409) {
                alert("Email is already registered.");
            } else {
                alert("Registration failed. Please try again.");
            }
            console.error("Registration error:", data.responseJSON);
        });
}

// Function to log in a user with role support
function loginUser() {
    const email = $('#email').val();
    const password = $('#password').val();
    const userRole = $('#userRole').val(); // Role is extracted from the hidden input

    if (!email || !password) {
        alert("Email and password are required!");
        return;
    }

    const requestData = { email, password, role: userRole };

    $.ajax({
        url: '/users/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        dataType: 'json'
    })
        .done(data => {
            const token = data.token;
            if (token) {
                localStorage.setItem('authToken', token); // Store the token securely
                localStorage.setItem('userEmail', email); // Store the email for later use
                localStorage.setItem('userRole', userRole); // Store the role for role-based access
                alert("Login successful!");
                window.location.href = 'account.html?role=' + userRole; // Redirect to account page with role
            } else {
                alert("Token not received from server.");
            }
        })
        .fail(data => {
            if (data.status === 401) {
                alert("Invalid email or password. Please try again.");
            } else {
                alert("Login failed. Please try again.");
            }
            console.error("Login error:", data.responseJSON);
        });
}

$(document).ready(() => {
    const role = getQueryParam('role'); // Get the role parameter from the URL

    if (role) {
        const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
        $('#roleHeader').text(`Login/Register as ${roleDisplay}`);
        $('#userRole').val(role); // Store the role in the hidden input
    } else {
        console.warn("No role specified in the URL.");
        $('#roleHeader').text('Login/Register'); // Default header
    }

    // Add event listeners
    $('#btnLogin').click(loginUser); // Attach loginUser function
    $('#btnRegister').click(registerUser); // Attach registerUser function
});
