// Utility function to format timestamps
export function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

// Utility function to render or update Chart.js charts
export function renderChart(labels, data, chartelement, yAxisLabel) {
    const ctx = chartelement.getContext('2d');

    if (!chartelement.chartInstance) {
        // Create a new chart instance and associate it with the element
        chartelement.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: yAxisLabel,
                    data: data,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabel
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        // Update the existing chart associated with the element
        const chart = chartelement.chartInstance;
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = yAxisLabel; // Update dataset label if needed
        chart.options.scales.y.title.text = yAxisLabel; // Update y-axis label if needed
        chart.update();
    }
}

// Utility function to filter the last 7 days of data
export function filterLastSevenDays(measurements) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return measurements.filter(measurement => new Date(measurement.timestamp) >= sevenDaysAgo);
}