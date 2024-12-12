
import { renderChart } from './chart_utils.js';

import { removeDevice, loadDeviceTables, searchAndClaimDevice } from './claming.js';
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



function logoutUser() {
    localStorage.removeItem('authToken'); // Remove the token
    window.location.href = 'login.html'; // Redirect to login page
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
    $(`#${view}${type}Max`).text(stats.max);
    $(`#${view}${type}Min`).text(stats.min);
    $(`#${view}${type}Avg`).text(stats.avg);
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

        console.log('Weekly measurements:', measurements);

        const labels = measurements.map(m => new Date(m.timestamp).toLocaleString());
        const heartRateData = measurements.map(m => m.heartRate);
        const bloodOxygenData = measurements.map(m => m.bloodOxygenSaturation);

        console.log('Labels:', labels);
        console.log('Heart Rate Data:', heartRateData);
        console.log('Blood Oxygen Data:', bloodOxygenData);

        const heartRateStats = calculateStats(measurements, 'heartRate');
        const bloodOxygenStats = calculateStats(measurements, 'bloodOxygenSaturation');

        console.log('Heart Rate Stats:', heartRateStats);
        console.log('Blood Oxygen Stats:', bloodOxygenStats);

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

    const startDate = new Date().toISOString().split('T')[0];

    fetchData({ deviceId, startDate }).then(measurements => {
        const labels = measurements.map(m => new Date(m.timestamp).toLocaleTimeString());
        const heartRateData = measurements.map(m => m.heartRate);
        const bloodOxygenData = measurements.map(m => m.bloodOxygenSaturation);

        const heartRateStats = calculateStats(measurements, 'heartRate');
        const bloodOxygenStats = calculateStats(measurements, 'bloodOxygenSaturation');

        updateStats('dailyHR', heartRateStats, 'HR');
        updateStats('dailyBO', bloodOxygenStats, 'BO');

        renderChart('dailyHeartRateChart', labels, heartRateData, 'Heart Rate (bpm)');
        renderChart('dailyBloodOxygenChart', labels, bloodOxygenData, 'Blood Oxygen Saturation (%)');
    });
}

function loadLifetimeView() {
    const deviceId = $('#measurementDeviceId').find(':selected').val();

    fetchData({ deviceId }).then(measurements => {
        const labels = measurements.map(m => new Date(m.timestamp).toLocaleString());
        const heartRateData = measurements.map(m => m.heartRate);
        const bloodOxygenData = measurements.map(m => m.bloodOxygenSaturation);

        const heartRateStats = calculateStats(measurements, 'heartRate');
        const bloodOxygenStats = calculateStats(measurements, 'bloodOxygenSaturation');

        updateStats('lifetimeHR', heartRateStats, 'HR');
        updateStats('lifetimeBO', bloodOxygenStats, 'BO');

        renderChart('lifetimeHeartRateChart', labels, heartRateData, 'Heart Rate (bpm)');
        renderChart('lifetimeBloodOxygenChart', labels, bloodOxygenData, 'Blood Oxygen Saturation (%)');
    });
}

$(function () {
    $('#btnLogout').click(logoutUser);
    $('#btnSetSchedule').click(function (e) {
        e.preventDefault(); // Prevent form submission
        setSchedule(); // Call the schedule setting function
    });

    // Initial load
    loadDeviceTables();
    $('#btnSearchUnclaimedDevice').on('click', searchAndClaimDevice);


    // Bind tab click events
    $('#weekly-tab').on('click', loadWeeklyView);
    $('#daily-tab').on('click', loadDailyView);
    $('#lifetime-tab').on('click', loadLifetimeView);

});