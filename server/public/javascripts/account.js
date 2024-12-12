// Attach the logout function to the logout button
function displayUserEmail() {
    const userEmail = localStorage.getItem('userEmail'); // Retrieve the email from localStorage
    if (userEmail) {
        $('#userEmailDisplay').text(userEmail); // Update the span with the email
    } else {
        window.alert("No user email found. Please log in again.");
        window.location.href = 'login.html'; // Redirect to login if email is missing
    }
}

function updatePassword() {
    const newPassword = $('#newPassword').val();
    const token = localStorage.getItem('authToken');

    if (!newPassword) {
        window.alert("New password is required!");
        return;
    }

    if (!token) {
        window.alert("No token found. Please log in again.");
        return;
    }

    console.log("Sending token:", token); // Debug log

    $.ajax({
        url: '/users/update-password',
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: JSON.stringify({ newPassword }),
        dataType: 'json'
    })
        .done(data => {
            console.log("Password updated successfully:", data);
            $('#rxData').html(JSON.stringify(data, null, 2));
            window.alert("Password updated successfully!");
        })
        .fail(data => {
            console.error("Failed to update password:", data.responseJSON);
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}