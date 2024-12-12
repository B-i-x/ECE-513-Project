
import { formatTimestamp, renderChart, filterLastSevenDays } from './chart_utils.js';

// Function to load devices into tables
function loadDeviceTables() {
    // Fetch all unclaimed devices
    $.ajax({
        url: '/users/unclaimed-devices',
        method: 'GET',
        headers: {
            'apikey': 'somerandomstring', // Replace with actual API key if needed
        },
        success: function(data) {
            console.log('Unclaimed devices data:', data);
            populateUnclaimedDevicesTable(data.devices);
        },
        error: function(err) {
            console.error('Error fetching unclaimed devices:', err);
        }
    });

    // Fetch user-owned devices
    $.ajax({
        url: '/users/devices',
        method: 'GET',
        headers: {
            'apikey': 'somerandomstring', // Replace with actual API key if needed
        },
        success: function(data) {
            console.log('User devices data:', data);
            populateTable('#userDevicesTable tbody', data.devices, true);
        },
        error: function(err) {
            console.error('Error fetching user devices:', err);
        }
    });
}

// Function to populate the unclaimed devices table
function populateUnclaimedDevicesTable(devices) {
    const tbody = $('#unclaimedDevicesTable tbody');
    tbody.empty(); // Clear existing rows

    devices.forEach(device => {
        const row = $('<tr>');

        row.append(`<td>${device.deviceId}</td>`);
        row.append(`<td>${new Date(device.registerDate).toLocaleString()}</td>`);
        row.append(`
            <td>
                <button class="btn btn-success btn-sm" onclick="claimDevice('${device.deviceId}')">Claim</button>
            </td>
        `);

        tbody.append(row);
    });
}

// Function to populate a table with devices
function populateTable(selector, devices, addActions = false) {
    const tbody = $(selector);
    tbody.empty(); // Clear existing rows

    devices.forEach(device => {
        const row = $('<tr>');

        row.append(`<td>${device.deviceId}</td>`);
        row.append(`<td>${new Date(device.registerDate).toLocaleString()}</td>`);

        if (addActions) {
            row.append(`
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeDevice('${device.deviceId}')">Remove</button>
                </td>
            `);
        }

        tbody.append(row);
    });
}

// Function to claim an unclaimed device
function claimDevice(deviceId) {
    fetch('/api/claim-device', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'somerandomstring', // Replace with actual API key if needed
        },
        body: JSON.stringify({ deviceId }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadDeviceTables(); // Refresh tables
        })
        .catch(err => console.error('Error claiming device:', err));
}

// Function to remove a user-owned device
function removeDevice(deviceId) {
    fetch('/api/remove-device', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'somerandomstring', // Replace with actual API key if needed
        },
        body: JSON.stringify({ deviceId }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadDeviceTables(); // Refresh tables
        })
        .catch(err => console.error('Error removing device:', err));
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


// Fetch and display filtered data
function fetchFilteredData(deviceId, filterOptions) {
    fetchMeasurements(deviceId, -1, measurements => {
        let filteredData = measurements;

        // Apply filters on the client-side
        if (filterOptions.lastSevenDays) {
            filteredData = filterLastSevenDays(measurements);
        } else if (filterOptions.startDate && filterOptions.endDate) {
            filteredData = filterByCustomDateRange(measurements, filterOptions.startDate, filterOptions.endDate);
        }

        // Prepare data for Heart Rate chart
        const chartLabelsHeartRate = filteredData.map(measurement => new Date(measurement.timestamp).toLocaleString());
        const chartDatasetHeartRate = filteredData.map(measurement => measurement.heartRate);
        renderChart(chartLabelsHeartRate, chartDatasetHeartRate, document.getElementById('heartRateChart'), "Heart Rate (bpm)");

        // Prepare data for Blood Oxygen chart
        const chartLabelsOxygen = filteredData.map(measurement => new Date(measurement.timestamp).toLocaleString());
        const chartDatasetOxygen = filteredData.map(measurement => measurement.bloodOxygenSaturation);
        renderChart(chartLabelsOxygen, chartDatasetOxygen, document.getElementById('bloodOxygenChart'), "Blood Oxygen Saturation (%)");
    });
}

// Utility function to filter data by custom date range
function filterByCustomDateRange(measurements, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return measurements.filter(measurement => {
        const timestamp = new Date(measurement.timestamp);
        return timestamp >= start && timestamp <= end;
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

function logoutUser() {
    localStorage.removeItem('authToken'); // Remove the token
    window.location.href = 'login.html'; // Redirect to login page
}

$(function () {
    $('#btnLogout').click(logoutUser);
    $('#btnSetSchedule').click(function (e) {
        e.preventDefault(); // Prevent form submission
        setSchedule(); // Call the schedule setting function
    });

    // Event listener for Refresh Devices button
    $('#btnRefreshDevices').on('click', () => {
        loadDeviceTables();
    });

    // Initial load
    loadDeviceTables();

    // Handle filter visibility
    $('#selectedFilter').on('change', function () {
        if ($(this).val() === 'custom') {
            $('.custom-date-range').removeClass('d-none');
        } else {
            $('.custom-date-range').addClass('d-none');
        }
    });

    // Handle "Show Data" button click
    $('#btnShowData').on('click', () => {
        const deviceId = $('#measurementDeviceId').val();
        const filter = $('#selectedFilter').val();
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();

        if (!deviceId) {
            alert("Device ID is required!");
            return;
        }

        let filterOptions = {};
        if (filter === 'weekly') {
            filterOptions = { lastSevenDays: true };
        } else if (filter === 'custom' && startDate && endDate) {
            filterOptions = { startDate, endDate };
        }

        // Fetch and display data
        fetchFilteredData(deviceId, filterOptions);
    });

});