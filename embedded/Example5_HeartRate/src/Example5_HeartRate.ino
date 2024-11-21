/*
  Optical Heart Rate Detection (PBA Algorithm) using the MAX30105 Breakout
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 2nd, 2016
  https://github.com/sparkfun/MAX30105_Breakout

  This is a demo to show the reading of heart rate or beats per minute (BPM) using
  a Peripheral Beat Amplitude (PBA) algorithm.

  Hardware Connections (Breakoutboard to Arduino):
  -5V = 5V (3.3V is allowed)
  -GND = GND
  -SDA = A4 (or SDA)
  -SCL = A5 (or SCL)
  -INT = Not connected
*/

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

// Sensor instance
MAX30105 particleSensor;

const byte RATE_SIZE = 4; // Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE];    // Array of heart rates
byte rateSpot = 0;
long lastBeat = 0;        // Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

void setup()
{
    // Initialize sensor
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) // Use default I2C port, 400kHz speed
    {
        Particle.publish("error", "MAX30105 was not found. Please check wiring/power.", PRIVATE);
        while (1); // Halt execution if the sensor is not detected
    }
    Particle.publish("info", "Place your index finger on the sensor with steady pressure.", PRIVATE);

    particleSensor.setup(); // Configure sensor with default settings
    particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED to low to indicate sensor is running
    particleSensor.setPulseAmplitudeGreen(0); // Turn off Green LED
}

void loop()
{
    long irValue = particleSensor.getIR();

    if (checkForBeat(irValue))
    {
        // We sensed a beat!
        unsigned long currentTime = millis();
        unsigned long delta = currentTime - lastBeat;
        lastBeat = currentTime;

        if (delta > 0)
        {
            beatsPerMinute = 60.0 / (delta / 1000.0); // Convert time difference to BPM

            
            rates[rateSpot++] = (byte)beatsPerMinute; // Store this reading in the array
            rateSpot %= RATE_SIZE;                   // Wrap variable

            // Take average of readings
            beatAvg = 0;
            for (byte x = 0; x < RATE_SIZE; x++)
                beatAvg += rates[x];
            beatAvg /= RATE_SIZE;
            
        }
    }

    // Create a JSON string with the data
    char data[128];
    snprintf(data, sizeof(data), "{\"IR\":%ld,\"BPM\":%.2f,\"AvgBPM\":%d}", irValue, beatsPerMinute, beatAvg);

    // Publish the data to the Particle Cloud
    Particle.publish("HeartRateData", data, PRIVATE);

    // Optional: Check if no finger is detected
    if (irValue < 50000)
    {
        Particle.publish("HeartRateWarning", "No finger detected!", PRIVATE);
    }

    // Delay to avoid flooding the cloud with events
    delay(1000);
}