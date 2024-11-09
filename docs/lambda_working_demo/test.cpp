// Include Particle Device OS APIs
#include "Particle.h"

// Let Device OS manage the connection to the Particle Cloud
SYSTEM_MODE(AUTOMATIC);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

// setup() runs once, when the device is first turned on
void setup() {
  // Put initialization like pinMode and begin functions here
  Particle.subscribe(System.deviceID() + "/hook-response/invoke-lambda/", myHandler, MY_DEVICES);

}

// loop() runs over and over again, as quickly as it can execute.
void loop() {
  // Get some data
  String data = String(10);
  // Trigger the integration
  Particle.publish("invoke-lambda", data, PRIVATE);
  // Wait 60 seconds
  delay(60000);
}

void myHandler(const char *event, const char *data) {
    Log.info("Data received: %s", data);
}