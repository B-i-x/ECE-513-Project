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

// Populate the physician dropdown
function fetchPhysicians() {
    $.ajax({
        url: '/users/physicians',
        method: 'GET',
        contentType: 'application/json',
        success: (data) => {
            const physicianSelect = $('#physicianSelect');
            physicianSelect.empty(); // Clear existing options
            physicianSelect.append('<option value="">Select a physician...</option>'); // Default option

            data.physicians.forEach((physician) => {
                physicianSelect.append(
                    `<option value="${physician._id}">${physician.email} (${physician.specialization || 'General'})</option>`
                );
            });
        },
        error: (err) => {
            console.error('Error fetching physicians:', err);
            alert('Failed to fetch physicians. Please try again later.');
        },
    });
}

// Assign the selected physician to the patient
function assignPhysician() {
    const selectedPhysicianId = $('#physicianSelect').val();
    const patientEmail = prompt('Enter your email to assign this physician:');

    if (!selectedPhysicianId || !patientEmail) {
        alert('Please select a physician and provide a valid email.');
        return;
    }

    $.ajax({
        url: '/users/register-patient',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            physicianId: selectedPhysicianId,
            patientEmail,
        }),
        success: (data) => {
            alert(`Physician assigned successfully: ${data.relation.physician}`);
            displayCurrentPhysician(data.relation.physician);
        },
        error: (err) => {
            console.error('Error assigning physician:', err);
            alert(err.responseJSON?.message || 'Failed to assign physician. Please try again.');
        },
    });
}

function fetchAssignedPhysicians() {
    $.ajax({
        url: '/users/assigned-physicians',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        success: (data) => {
            const assignedPhysiciansList = $('#assignedPhysiciansList');
            assignedPhysiciansList.empty();

            if (data.assignedPhysicians && data.assignedPhysicians.length > 0) {
                data.assignedPhysicians.forEach((physician) => {
                    assignedPhysiciansList.append(
                        `<li class="list-group-item">${physician.email} (${physician.specialization || 'General'})</li>`
                    );
                });
            } else {
                assignedPhysiciansList.append(
                    '<li class="list-group-item text-muted">No assigned physicians.</li>'
                );
            }
        },
        error: (err) => {
            console.error('Error fetching assigned physicians:', err);
            $('#assignedPhysiciansList').html(
                '<li class="list-group-item text-danger">Error loading assigned physicians.</li>'
            );
        },
    });
};


$(document).ready(() => {
    const userRole = localStorage.getItem('userRole'); // Get user role from localStorage
    const accountTypeDisplay = $('#accountTypeDisplay');

    if (!userRole) {
        alert('User role not found. Please log in again.');
        window.location.href = 'login.html'; // Redirect to login if role is missing
        return;
    }

    // Display user role in the account type section
    const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    accountTypeDisplay.text(`Account Type: ${roleDisplay}`);

    // Adjust visibility based on role
    if (userRole === 'physician') {
        $('.patient-view').hide(); // Hide elements specific to patients
    } else if (userRole === 'patient') {
        $('.patient-view').show(); // Ensure patient elements are visible
    }

    
    fetchAssignedPhysicians();

    // Attach event listener to the assign button
    $('#btnAssignPhysician').click(() => {
        assignPhysician();
    });

    // Fetch physicians on page load
    fetchPhysicians();
});
