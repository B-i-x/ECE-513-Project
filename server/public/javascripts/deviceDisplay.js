
import { renderChart } from './chart_utils.js';

import { removeDevice, loadDeviceTables, searchAndClaimDevice } from './deviceFetching.js';
window.removeDevice = removeDevice;

const apiUrl = '/users/data'; // Replace with your API base URL



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





function fetchData(params) {
    const queryString = $.param(params);
    return $.ajax({
        url: `${apiUrl}?${queryString}`,
        method: 'GET',
        dataType: 'json',
    }).then(response => response.data.measurements).catch(error => {
        console.error('Error fetching data:', error);
        return [];
    });
}

function calculateStats(measurements, key) {
    if (!measurements.length) return { max: '-', min: '-', avg: '-' };

    const values = measurements.map(m => m[key]);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);

    return { max, min, avg };
}

function updateStats(view, stats, type) {
    $(`#${view}Max`).text(stats.max);
    $(`#${view}Min`).text(stats.min);
    $(`#${view}Avg`).text(stats.avg);
}

function loadWeeklyView() {
    const deviceId = $('#measurementDeviceId').find(':selected').val();

    if (!deviceId) {
        alert('Please select a valid device ID.');
        console.error('No device ID selected.');
        return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    fetchData({ deviceId, startDate: startDate.toISOString().split('T')[0] }).then(measurements => {
        if (measurements.length === 0) {
            console.warn('No measurements retrieved for weekly view.');
            alert('No data available for the selected device.');
            return;
        }

        // console.log('Weekly measurements:', measurements);

        const labels = measurements.map(m => new Date(m.timestamp).toLocaleString());
        const heartRateData = measurements.map(m => m.heartRate);
        const bloodOxygenData = measurements.map(m => m.bloodOxygenSaturation);

        // console.log('Labels:', labels);
        // console.log('Heart Rate Data:', heartRateData);
        // console.log('Blood Oxygen Data:', bloodOxygenData);

        const heartRateStats = calculateStats(measurements, 'heartRate');
        const bloodOxygenStats = calculateStats(measurements, 'bloodOxygenSaturation');

        // console.log('Heart Rate Stats:', heartRateStats);
        // console.log('Blood Oxygen Stats:', bloodOxygenStats);

        updateStats('weeklyHR', heartRateStats, 'HR');
        updateStats('weeklyBO', bloodOxygenStats, 'BO');

        renderChart('weeklyHeartRateChart', labels, heartRateData, 'Heart Rate (bpm)');
        renderChart('weeklyBloodOxygenChart', labels, bloodOxygenData, 'Blood Oxygen Saturation (%)');
    }).catch(error => {
        console.error('Error fetching weekly data:', error);
    });
}


function loadDailyView() {
    const deviceId = $('#measurementDeviceId').find(':selected').val();

    if (!deviceId) {
        alert('Please select a valid device ID.');
        console.error('No device ID selected.');
        return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    fetchData({ deviceId, startDate: startDate.toISOString().split('T')[0] }).then(measurements => {
        if (measurements.length === 0) {
            console.warn('No measurements retrieved for daily view.');
            alert('No data available for the selected device.');
            return;
        }

        const labels = measurements.map(m => new Date(m.timestamp).toLocaleTimeString());
        const heartRateData = measurements.map(m => m.heartRate);
        const bloodOxygenData = measurements.map(m => m.bloodOxygenSaturation);

        const heartRateStats = calculateStats(measurements, 'heartRate');
        const bloodOxygenStats = calculateStats(measurements, 'bloodOxygenSaturation');

        updateStats('dailyHR', heartRateStats, 'HR');
        updateStats('dailyBO', bloodOxygenStats, 'BO');

        renderChart('dailyHeartRateChart', labels, heartRateData, 'Heart Rate (bpm)');
        renderChart('dailyBloodOxygenChart', labels, bloodOxygenData, 'Blood Oxygen Saturation (%)');
    }).catch(error => {
        console.error('Error fetching daily data:', error);
    });
}

function loadLifetimeView() {
    const deviceId = $('#measurementDeviceId').find(':selected').val();

    if (!deviceId) {
        alert('Please select a valid device ID.');
        console.error('No device ID selected.');
        return;
    }

    fetchData({ deviceId }).then(measurements => {
        if (measurements.length === 0) {
            console.warn('No measurements retrieved for lifetime view.');
            alert('No data available for the selected device.');
            return;
        }

        const labels = measurements.map(m => new Date(m.timestamp).toLocaleString());
        const heartRateData = measurements.map(m => m.heartRate);
        const bloodOxygenData = measurements.map(m => m.bloodOxygenSaturation);

        const heartRateStats = calculateStats(measurements, 'heartRate');
        const bloodOxygenStats = calculateStats(measurements, 'bloodOxygenSaturation');

        updateStats('lifetimeHR', heartRateStats, 'HR');
        updateStats('lifetimeBO', bloodOxygenStats, 'BO');

        renderChart('lifetimeHeartRateChart', labels, heartRateData, 'Heart Rate (bpm)');
        renderChart('lifetimeBloodOxygenChart', labels, bloodOxygenData, 'Blood Oxygen Saturation (%)');
    }).catch(error => {
        console.error('Error fetching lifetime data:', error);
    });
}

// Function to activate the selected tab pane and deactivate others
function activateTabPane(tabId) {
    // Deactivate all tab panes
    $('.tab-pane').removeClass('active show');

    // Activate the selected tab pane
    $(`#${tabId}`).addClass('active show');

    // Deactivate all nav links
    $('.nav-link').removeClass('active');

    // Activate the selected tab link
    $(`#${tabId}-tab`).addClass('active');
}


$(function () {
    $('#btnSetSchedule').click(function (e) {
        e.preventDefault(); // Prevent form submission
        setSchedule(); // Call the schedule setting function
    });

    const userRole = localStorage.getItem('userRole'); // Get the role from localStorage

    // Dynamically modify the layout based on user role
    if (userRole === 'physician') {
        // Modify the header for physicians
        $('h3').text("Manage Patients' Devices");
        $('h4').text("Your Patients' Devices");

        // Hide the section for searching and claiming unclaimed devices
        $('#searchDeviceId').closest('.form-group').hide();
        $('#btnSearchUnclaimedDevice').hide();
        $("#searchUnclaimedLabel").hide();
    } else if (userRole === 'patient') {
        // Ensure everything is visible for patients
        $('h3').text("Manage Devices");
        $('h4').text("Your Devices");
        $('#searchDeviceId').closest('.form-group').show();
        $('#btnSearchUnclaimedDevice').show();
    } else {
        console.warn("No user role defined or invalid role.");
        alert("Invalid role. Please log in again.");
        window.location.href = 'login.html';
    }

    // Initial load
    loadDeviceTables();
    $('#btnSearchUnclaimedDevice').on('click', searchAndClaimDevice);


    // Bind tab click events
    $('#weekly-tab').on('click', function () { 
        activateTabPane('weekly');
        loadWeeklyView;
    });

    $('#daily-tab').on('click', function () {
        activateTabPane('daily');
        loadDailyView();
    });
    $('#lifetime-tab').on('click', function () {
        activateTabPane('lifetime');
        loadLifetimeView();
    });


});