// This #include statement was automatically added by the Particle IDE.
#include <ArduinoJson.h>

// Include Particle Device OS APIs
#include "Particle.h"

// Let Device OS manage the connection to the Particle Cloud
SYSTEM_MODE(AUTOMATIC);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

void setup() {
    // Start serial communication
    Serial.begin(9600);

    // Create a JSON document
    StaticJsonDocument<200> doc;

    // Add key-value pairs
    doc["message"] = "hello";

    // Serialize JSON to a string
    char buffer[256];
    serializeJson(doc, buffer);

    // Publish the event to trigger the webhook
    Particle.publish("start", buffer, PRIVATE);

    // Print the serialized JSON for debugging
    Serial.println(buffer);

    // Subscribe to webhook responses (optional)
    Particle.subscribe("hook-response/start", webhookHandler, MY_DEVICES);
}
void loop() {
    // Your loop code here
}

// Webhook response handler
void webhookHandler(const char *event, const char *data) {
    // Process the response from the webhook
    Serial.println("Webhook response received:");
    Serial.println(data);
}
