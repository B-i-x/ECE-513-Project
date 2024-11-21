/*
  MAX30105 Breakout: Output all the raw Red/IR/Green readings
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 2nd, 2016
  https://github.com/sparkfun/MAX30105_Breakout

  Outputs all Red/IR/Green values.

  Hardware Connections (Breakoutboard to Arduino):
  -5V = 5V (3.3V is allowed)
  -GND = GND
  -SDA = A4 (or SDA)
  -SCL = A5 (or SCL)
  -INT = Not connected

  The MAX30105 Breakout can handle 5V or 3.3V I2C logic. We recommend powering the board with 5V
  but it will also run at 3.3V.

  This code is released under the [MIT License](http://opensource.org/licenses/MIT).
*/

#include <Wire.h>
#include "MAX30105.h"

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

MAX30105 particleSensor;

void setup()
{
    Log.info("MAX30105 Basic Readings Example");

    // Initialize sensor
    if (particleSensor.begin() == false)
    {
        Log.error("MAX30105 was not found. Please check wiring/power.");
        while (1); // Halt execution if the sensor is not detected
    }

    particleSensor.setup(); // Configure sensor
    Log.info("MAX30105 sensor initialized.");
}

void loop()
{
    // Read Red, IR, and Green values
    long redValue = particleSensor.getRed();
    long irValue = particleSensor.getIR();
    long greenValue = particleSensor.getGreen();

    // Log the values
    Log.info("Red: %ld, IR: %ld, Green: %ld", redValue, irValue, greenValue);

    // Small delay for readability
    delay(100);
}
