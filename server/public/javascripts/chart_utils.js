let charts = {}; // Store chart instances

Chart.defaults.plugins.debug = true;

export function renderChart(canvasId, labels, data, label) {
    const canvasElement = document.getElementById(canvasId);

    if (!canvasElement) {
        console.error(`Canvas element with ID "${canvasId}" not found.`);
        return;
    }

    if (charts[canvasId]) {
        charts[canvasId].destroy(); // Destroy the existing chart instance
    }

    const ctx = canvasElement.getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label,
                data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
            },
            scales: {
                x: { title: { display: true, text: 'Timestamp' } },
                y: { title: { display: true, text: label } },
            },
        },
    });
}
