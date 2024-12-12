// Function to remove a user-owned device
export function removeDevice(deviceId) {
    fetch('/users/unclaim-device', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Replace with actual API key if needed
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

// Function to load devices into the user devices table
export function loadDeviceTables() {
    // Fetch user-owned devices
    $.ajax({
        url: '/users/devices',
        method: 'GET',
        contentType: 'application/json',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },

        success: function(data) {
            console.log('User devices data:', data);
            populateTable('#userDevicesTable tbody', data.devices, true);
            populateDeviceDropdown(data.devices);

        },
        error: function(err) {
            console.error('Error fetching user devices:', err);
        }
    });
}

// Function to populate a table with devices
function populateTable(selector, devices, addActions = false) {
    const tbody = $(selector);
    tbody.empty(); // Clear existing rows

    devices.forEach(device => {
        const row = $('<tr>');

        row.append(`<td>${device.deviceId}</td>`);
        row.append(`<td>${device.ssid}</td>`);

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


// Function to search and claim an unclaimed device
export function searchAndClaimDevice() {
    const deviceId = $('#searchDeviceId').val();

    if (!deviceId) {
        alert('Please enter a Device ID.');
        return;
    }

    // Fetch unclaimed device by Device ID and claim it if found
    fetch(`/users/claim-device`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ deviceId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message.includes("successfully")) {
                alert(data.message);
                loadDeviceTables(); // Refresh tables
            } else {
                $('#searchResult').html('<p class="text-danger">Device not found or already claimed.</p>');
            }
        })
        .catch(err => {
            console.error('Error searching for or claiming device:', err);
            $('#searchResult').html('<p class="text-danger">Error searching for or claiming device.</p>');
        });
}

// Function to display the search result and claim button
export function displaySearchResult(device) {
    const resultHtml = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Device ID</th>
                    <th>Register Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${device.deviceId}</td>
                    <td>${new Date(device.registerDate).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="claimDevice('${device.deviceId}')">Claim</button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
    $('#searchResult').html(resultHtml);
}

// Function to populate the device dropdown
function populateDeviceDropdown(devices) {
    const dropdown = $('#measurementDeviceId');
    dropdown.empty(); // Clear existing options

    if (devices.length > 0) {
        devices.forEach(device => {
            dropdown.append(`<option value="${device.deviceId}">${device.deviceId}</option>`);
        });
    } else {
        dropdown.append('<option value="">No devices available</option>');
    }
}