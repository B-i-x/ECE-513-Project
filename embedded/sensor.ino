#include <Wire.h>
#include "MAX30105.h"

// Sensor instance
MAX30105 particleSensor;

const byte RATE_SIZE = 4; // Averaging heart rate over last 4 readings
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;

float beatsPerMinute = 0;
int beatAvg = 0;

bool fingerDetected = false;
unsigned long lastBlinkTime = 0;
const unsigned long BLINK_INTERVAL = 500; // Interval for blinking LED in milliseconds

void setup() {
    Particle.publish("info", "Initializing sensor...", PRIVATE);

    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Particle.publish("error", "MAX30102 not found. Check wiring.", PRIVATE);
        while (1);
    }

    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x3F); // Full power for Red LED
    particleSensor.setPulseAmplitudeIR(0x3F);  // Full power for IR LED
    particleSensor.setSampleRate(100);          // Adjust sample rate

    Particle.publish("info", "MAX30102 initialized. Place your finger on the sensor.", PRIVATE);

    RGB.control(true); // Take control of the Argon's RGB LED
    RGB.color(0, 0, 255); // Set the LED to blue initially
}

void loop() {
    long irValue = particleSensor.getIR();
    long redValue = particleSensor.getRed();

    // Check if a finger is detected
    if (irValue > 50000) { // Adjust threshold as needed
        fingerDetected = true;
        RGB.color(0, 0, 0); // Turn off the LED
    } else {
        fingerDetected = false;
        unsigned long currentTime = millis();
        if (currentTime - lastBlinkTime >= BLINK_INTERVAL) {
            static bool ledState = false;
            ledState = !ledState; // Toggle LED state
            if (ledState) {
                RGB.color(0, 0, 255); // Blue
            } else {
                RGB.color(0, 0, 0);   // Off
            }
            lastBlinkTime = currentTime;
        }
    }

    Particle.publish("RawData", String::format("{\"IR\": %ld, \"RED\": %ld}", irValue, redValue), PRIVATE);

    if (detectBeat(irValue)) {
        long delta = millis() - lastBeat;
        lastBeat = millis();

        beatsPerMinute = 60 / (delta / 1000.0); // Calculate BPM

        if (beatsPerMinute > 40 && beatsPerMinute < 200) { // Filter valid BPM range
            rates[rateSpot++] = (byte)beatsPerMinute;
            rateSpot %= RATE_SIZE;

            // Calculate average BPM
            beatAvg = 0;
            for (byte i = 0; i < RATE_SIZE; i++) {
                beatAvg += rates[i];
            }
            beatAvg /= RATE_SIZE;
        }
    }

    Particle.publish("HeartRateData", String::format("{\"BPM\": %.2f, \"AvgBPM\": %d}", beatsPerMinute, beatAvg), PRIVATE);

    delay(1000);
}

bool detectBeat(long irValue) {
    static long movingAverage = 0;
    static bool isRising = false;
    const float alpha = 0.1; // Smoothing factor for moving average

    movingAverage = alpha * irValue + (1 - alpha) * movingAverage; // Exponential moving average
    long threshold = movingAverage * 0.2; // Dynamic threshold (20% of average)

    static long lastPeakValue = 0;

    if (irValue > movingAverage + threshold) {
        isRising = true;
    } else if (isRising && irValue < movingAverage - threshold) {
        isRising = false;

        if (movingAverage - lastPeakValue > threshold) {
            lastPeakValue = movingAverage;
            return true; // Beat detected
        }
    }

    return false;