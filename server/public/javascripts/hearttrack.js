function registerUser() {
    // Validate input
    if ($('#username').val() === "") {
        window.alert("Invalid username!");
        return;
    }
    if ($('#password').val() === "") {
        window.alert("Invalid password!");
        return;
    }

    let txdata = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: '/users/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function (data) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data) {
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}

function loginUser() {
    if ($('#username').val() === "" || $('#password').val() === "") {
        window.alert("Both username and password are required!");
        return;
    }

    let txdata = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: '/users/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function (data) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data) {
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}

function registerDevice() {
    if ($('#deviceId').val() === "") {
        window.alert("Invalid device ID!");
        return;
    }

    let txdata = {
        deviceId: $('#deviceId').val(),
        username: $('#username').val() // Assuming the user is logged in
    };

    $.ajax({
        url: '/devices/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function (data) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data) {
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
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
        });
}

function fetchAllMeasurements() {
    if ($('#deviceId').val() === "") {
        window.alert("Invalid device ID!");
        return;
    }

    // Use the new API with limit=-1 to fetch all data
    $.ajax({
        url: `/devices/data?deviceId=${$('#deviceId').val()}&limit=-1`,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            // Check if there are measurements to display
            if (data.data.measurements && data.data.measurements.length > 0) {
                const allMeasurements = data.data.measurements;

                // Create an HTML-friendly display for all measurements
                let htmlContent = `<h4>All Measurements</h4>`;
                allMeasurements.forEach(measurement => {
                    htmlContent += `
                        <div style="margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                            <p><strong>Heart Rate:</strong> ${measurement.heartRate} bpm</p>
                            <p><strong>Blood Oxygen Saturation:</strong> ${measurement.bloodOxygenSaturation}%</p>
                            <p><strong>Device ID:</strong> ${measurement.device}</p>
                            <p><strong>Timestamp:</strong> ${new Date(measurement.timestamp).toLocaleString()}</p>
                        </div>
                    `;
                });

                // Display formatted data in its own section
                $('#recentMeasurementDisplay').html(htmlContent);

                // Display the raw JSON response in the rxData window
                $('#rxData').html(JSON.stringify(data, null, 2));
            } else {
                $('#recentMeasurementDisplay').html("<p>No measurements found for this device.</p>");
                $('#rxData').html(JSON.stringify(data, null, 2));
            }
        })
        .fail(function (data) {
            // Show error in both recentMeasurementDisplay and rxData
            $('#recentMeasurementDisplay').html(`<p>Error: ${data.responseJSON.message || "Unable to fetch data."}</p>`);
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}


function fetchRecentMeasurements() {
    if ($('#deviceId').val() === "") {
        window.alert("Invalid device ID!");
        return;
    }

    // Use the new API with limit=1
    $.ajax({
        url: `/devices/data?deviceId=${$('#deviceId').val()}&limit=1`,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            // Check if there is a measurement to display
            if (data.data.measurements && data.data.measurements.length > 0) {
                const recentMeasurement = data.data.measurements[0];

                // Create an HTML-friendly display for the recent measurement
                const htmlContent = `
                    <h4>Most Recent Measurement</h4>
                    <p><strong>Heart Rate:</strong> ${recentMeasurement.heartRate} bpm</p>
                    <p><strong>Blood Oxygen Saturation:</strong> ${recentMeasurement.bloodOxygenSaturation}%</p>
                    <p><strong>Device ID:</strong> ${recentMeasurement.device}</p>
                    <p><strong>Timestamp:</strong> ${new Date(recentMeasurement.timestamp).toLocaleString()}</p>
                `;

                // Display formatted data in its own section
                $('#recentMeasurementDisplay').html(htmlContent);

                // Display the raw JSON response in the rxData window
                $('#rxData').html(JSON.stringify(data, null, 2));
            } else {
                $('#recentMeasurementDisplay').html("<p>No measurements found for this device.</p>");
                $('#rxData').html(JSON.stringify(data, null, 2));
            }
        })
        .fail(function (data) {
            // Show error in both recentMeasurementDisplay and rxData
            $('#recentMeasurementDisplay').html(`<p>Error: ${data.responseJSON.message || "Unable to fetch data."}</p>`);
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}

$(function () {
    $('#btnRegister').click(registerUser);
    $('#btnLogin').click(loginUser);
    $('#btnRegisterDevice').click(registerDevice);
    $('#btnViewDeviceData').click(viewDeviceData);
    $('#btnFetchAll').click(fetchAllMeasurements);
    $('#btnFetchRecent').click(fetchRecentMeasurements);
});