// This #include statement was automatically added by the Particle IDE.
#include <SparkFun-MAX3010x.h>

// Include Particle Device OS APIs
#include "Particle.h"

// Let Device OS manage the connection to the Particle Cloud
SYSTEM_MODE(AUTOMATIC);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

// Create an instance of the SparkFun MAX3010x library
MAX30105 particleSensor;

void setup() {
    // Initialize serial communication for debugging
    Serial.begin(9600);

    // Initialize the MAX30102 sensor
    if (!particleSensor.begin()) {
        Log.error("MAX30102 sensor was not found. Please check the wiring/power.");
        while (1); // Halt execution if the sensor is not detected
    }

    // Set up the sensor with default configurations
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);  // Set red LED to a low power level
    particleSensor.setPulseAmplitudeIR(0x0A);   // Set IR LED to a low power level
    particleSensor.setPulseAmplitudeGreen(0);   // Turn off green LED
}

void loop() {
    // Read sensor data
    long redValue = particleSensor.getRed();   // Get red LED value
    long irValue = particleSensor.getIR();     // Get IR LED value

    // Check if the sensor data is valid
    if (redValue > 0 && irValue > 0) {
        Log.info("Red: %ld, IR: %ld", redValue, irValue);
    } else {
        Log.warn("Invalid readings. Ensure sensor is properly connected.");
    }

    // Wait for 100 milliseconds before reading again
    delay(100);
}