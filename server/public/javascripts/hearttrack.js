
import { formatTimestamp, renderChart, filterLastSevenDays } from './chart_utils.js';

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

function setSchedule() {
    const deviceId = $('#scheduleDeviceId').val();
    const startTime = $('#startTime').val();
    const endTime = $('#endTime').val();
    const frequency = $('#frequency').val();
    const token = localStorage.getItem('authToken');

    if (!deviceId || !startTime || !endTime || !frequency) {
        window.alert("All fields are required!");
        return;
    }

    if (!token) {
        window.alert("No token found. Please log in again.");
        return;
    }

    $.ajax({
        url: '/devices/set-schedule',
        method: 'POST',
        contentType: 'application/json',
        headers: { Authorization: `Bearer ${token}` },
        data: JSON.stringify({ deviceId, startTime, endTime, frequency }),
        dataType: 'json'
    })
        .done(data => {
            window.alert("Schedule set successfully!");
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(data => {
            window.alert("Failed to set schedule.");
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
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



function removeDevice() {
    const deviceId = $('#deviceId').val(); // Get the device ID from the input field
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage

    if (!deviceId) {
        window.alert("Device ID is required!");
        return;
    }

    if (!token) {
        window.alert("No token found. Please log in again.");
        return;
    }

    $.ajax({
        url: '/devices/remove-device',
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${token}` // Include the token in the header
        },
        data: JSON.stringify({ deviceId }),
        dataType: 'json'
    })
        .done(data => {
            console.log("Device removed successfully:", data);
            $('#rxData').html(JSON.stringify(data, null, 2));
            window.alert("Device removed successfully!");
        })
        .fail(data => {
            console.error("Failed to remove device:", data.responseJSON);
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


function registerDevice() {
    const deviceId = $('#deviceId').val();
    const token = localStorage.getItem('authToken');

    if (!deviceId) {
        console.error("Device ID is missing."); // Debug log
        window.alert("Device ID is required!");
        return;
    }

    if (!token) {
        console.error("Auth token is missing."); // Debug log
        window.alert("No token found. Please log in again.");
        return;
    }

    console.log("Sending device registration request with token:", token); // Debug log

    $.ajax({
        url: '/devices/register',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: JSON.stringify({ deviceId }),
        dataType: 'json'
    })
        .done(data => {
            console.log("Device registered successfully:", data); // Debug log
            window.alert("Device registered successfully!");
        })
        .fail(data => {
            if (data.status === 409) {
                // Specific status code for "Device already registered"
                console.error("Device already registered:", data.responseJSON); // Debug log
                window.alert("Device already registered!");
            } else {
                // General error handling
                console.error("Failed to register device:", data.responseJSON); // Debug log
                window.alert("Failed to register device. Please try again.");
            }
        });
}


function viewDeviceData() {
    if ($('#deviceId').val() === "") {
        window.alert("Invalid device ID!");
        return;
    }

    // Use query parameters in the URL
    $.ajax({
        url: `/devices/data?deviceId=${$('#deviceId').val()}`,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data) {
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
            window.alert("View Device Data failed.");
        });
}

// Generalized fetch function
function fetchMeasurements(deviceId, limit, onSuccess, selectedDate = null) {
    if (!deviceId) {
        window.alert("Device ID for measurements is required!");
        return;
    }

    let url = `/devices/data?deviceId=${deviceId}&limit=${limit}`;

    if (selectedDate) {
        url += `&date=${selectedDate}`; // Append selected date to the URL if provided
    }

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    })
        .done(data => {
            if (data.data.measurements && data.data.measurements.length > 0) {
                onSuccess(data.data.measurements);
            } else {
                $('#recentMeasurementDisplay').html("<p>No measurements found for this device.</p>");
                window.alert("No measurements found for this device.");
            }

            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(data => {
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
            window.alert("Failed to fetch measurements.");
        });
}

// Fetch all measurements and display in chart
function fetchAllMeasurements() {
    const deviceId = $('#measurementDeviceId').val();
    const selectedDate = $('#selectedDate').val(); // Get selected date from the input field

    fetchMeasurements(deviceId, -1, measurements => {
        const chartLabels = measurements.map(m => formatTimestamp(m.timestamp));
        const chartDataset = measurements.map(m => m.heartRate);
        renderChart(chartLabels, chartDataset, document.getElementById('heartRateChart'), "Heart Rate (bpm)");
    }, selectedDate);

    fetchMeasurements(deviceId, -1, measurements => {
        const chartLabels = measurements.map(m => formatTimestamp(m.timestamp));
        const chartDataset = measurements.map(m => m.bloodOxygenSaturation);
        console.log("measurements", measurements);  
        console.log("chartLabels", chartLabels);
        console.log("chartDataset", chartDataset);
        renderChart(chartLabels, chartDataset, document.getElementById('bloodOxygenChart'), "Blood Oxygen Saturation (%)");
    }, selectedDate);
}


// Fetch weekly summary and display in charts
export function fetchWeeklySummary() {
    const deviceId = $('#measurementDeviceId').val();

    fetchMeasurements(deviceId, -1, measurements => {
        const pastWeekData = filterLastSevenDays(measurements);

        const chartLabelsHeartRate = pastWeekData.map(measurement => new Date(measurement.timestamp).toLocaleString());
        const chartDatasetHeartRate = pastWeekData.map(measurement => measurement.heartRate);
        renderChart(chartLabelsHeartRate, chartDatasetHeartRate, document.getElementById('heartRateChart'), "Heart Rate (bpm)");

        const chartLabelsOxygen = pastWeekData.map(measurement => new Date(measurement.timestamp).toLocaleString());
        const chartDatasetOxygen = pastWeekData.map(measurement => measurement.bloodOxygenSaturation);
        renderChart(chartLabelsOxygen, chartDatasetOxygen, document.getElementById('bloodOxygenChart'), "Blood Oxygen Saturation (%)");
    });
}


function fetchDetailedView() {
    const deviceId = $('#measurementDeviceId').val();
    const selectedDate = $('#selectedDate').val();
    const token = localStorage.getItem('authToken');

    if (!deviceId) {
        window.alert("Device ID for measurements is required!");
        return;
    }

    if (!selectedDate) {
        window.alert("Please select a date!");
        return;
    }

    if (!token) {
        window.alert("No token found. Please log in again.");
        return;
    }

    $.ajax({
        url: `/devices/detailed-view?deviceId=${deviceId}&date=${selectedDate}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        dataType: 'json'
    })
        .done(data => {
            const { heartRates, bloodOxygenLevels, timestamps } = data;

            // Heart Rate Chart
            const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');
            new Chart(heartRateCtx, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: 'Heart Rate (bpm)',
                        data: heartRates,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: { title: { display: true, text: 'Timestamp' } },
                        y: { beginAtZero: true, title: { display: true, text: 'Heart Rate (bpm)' } }
                    }
                }
            });

            // Blood Oxygen Chart
            const bloodOxygenCtx = document.getElementById('bloodOxygenChart').getContext('2d');
            new Chart(bloodOxygenCtx, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: 'Blood Oxygen Level (%)',
                        data: bloodOxygenLevels,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: { title: { display: true, text: 'Timestamp' } },
                        y: { beginAtZero: true, title: { display: true, text: 'Blood Oxygen Level (%)' } }
                    }
                }
            });
        })
        .fail(data => {
            console.error("Failed to fetch detailed view:", data.responseJSON);
            window.alert("Failed to fetch detailed view.");
        });
}


export function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if not logged in
    }
}

function logoutUser() {
    localStorage.removeItem('authToken'); // Remove the token
    window.location.href = 'login.html'; // Redirect to login page
}

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



$(function () {
    $('#btnRegister').click(registerUser);
    $('#btnLogin').click(loginUser);
    $('#btnRegisterDevice').click(registerDevice);
    $('#btnViewDeviceData').click(viewDeviceData);
    $('#btnFetchAll').click(fetchAllMeasurements);
    $('#btnUpdatePassword').click(updatePassword);
    $('#btnRemoveDevice').click(removeDevice);
    $('#btnWeeklySummary').click(fetchWeeklySummary);
    $('#btnDetailedView').click(fetchDetailedView);
    $('#btnLogout').click(logoutUser);
    $('#btnSetSchedule').click(function (e) {
        e.preventDefault(); // Prevent form submission
        setSchedule(); // Call the schedule setting function
    });

});