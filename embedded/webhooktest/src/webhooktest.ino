// Include Particle Device OS APIs
#include "Particle.h"

// Let Device OS manage the connection to the Particle Cloud
SYSTEM_MODE(AUTOMATIC);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

void setup() {
    // Subscribe to the integration response event
    Particle.subscribe(System.deviceID() + "/hook-response/invoke-lambda/", myHandler, MY_DEVICES);

    // Optional: Log initialization or setup
    Particle.publish("log", "Device initialized", PRIVATE);
}

void loop() {
    // Get some data (example: temperature value or arbitrary string)
    String data = "Sample data to send";

    // Trigger the integration by publishing an event
    Particle.publish("invoke-lambda", data, PRIVATE);

    // Wait for 60 seconds before sending the next event
    delay(60000);
}

void myHandler(const char *event, const char *data) {
    // Handle the integration response
    // Log the response from the webhook
    if (data) {
        Particle.publish("log", "Response: " + String(data), PRIVATE);
    } else {
        Particle.publish("log", "No response received", PRIVATE);
    }
}
