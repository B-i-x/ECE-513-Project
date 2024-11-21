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

    $.ajax({
        url: `/devices/data/${$('#deviceId').val()}`,
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
    $.ajax({
        url: '/measurements/all',
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

function fetchRecentMeasurements() {
    if ($('#deviceId').val() === "") {
        window.alert("Invalid device ID!");
        return;
    }

    $.ajax({
        url: `/measurements/recent/${$('#deviceId').val()}`,
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

$(function () {
    $('#btnRegister').click(registerUser);
    $('#btnLogin').click(loginUser);
    $('#btnRegisterDevice').click(registerDevice);
    $('#btnViewDeviceData').click(viewDeviceData);
    $('#btnFetchAll').click(fetchAllMeasurements);
    $('#btnFetchRecent').click(fetchRecentMeasurements);
});
