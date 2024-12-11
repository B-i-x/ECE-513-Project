// This #include statement was automatically added by the Particle IDE.
#include <Wire.h>

#include "MAX30105.h"
#include "heartRate.h"
// #include "Particle.h"

// Sensor instance
MAX30105 particleSensor;

SerialLogHandler logHandler;
SYSTEM_THREAD(ENABLED);

const char *registerEventName = "register-device";
const char *sendDataEventName = "send-data";

const std::chrono::milliseconds publishRegisterInterval = 1h; // Publish register event every hour
const std::chrono::milliseconds publishDataInterval = 10s;    // Publish sensor data every 10 seconds

unsigned long lastRegisterPublishMillis = -publishRegisterInterval.count();
unsigned long lastDataPublishMillis = -publishDataInterval.count();

bool buttonClicked = false;

// Heart rate measurement variables
const byte RATE_SIZE = 4; // Increase this for more averaging
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;

float beatsPerMinute;
int beatAvg;

// Function prototypes
void registerDevice();
void sendData();
void hookResponseHandler(const char *event, const char *data);
void clickHandler(system_event_t event, int param);
bool initializeSensor();
void readHeartRateAndBOx();

void setup()
{
    // Subscribe to webhook responses for both events
    Particle.subscribe(System.deviceID() + "/hook-response/" + String(registerEventName), hookResponseHandler);
    Particle.subscribe(System.deviceID() + "/hook-response/" + String(sendDataEventName), hookResponseHandler);

    // Register a click handler for the MODE button
    System.on(button_click, clickHandler);

    // Initialize the sensor
    if (!initializeSensor())
    {
        Particle.publish("error", "MAX30105 was not found. Please check wiring/power.", PRIVATE);
        while (1)
            ; // Halt execution if the sensor is not detected
    }

    Log.info("Setup complete. Subscribed to webhook responses for both %s and %s.", registerEventName, sendDataEventName);
}

void loop()
{
    unsigned long currentMillis = millis();

    // Periodically publish "register-device" event
    if (Particle.connected() && currentMillis - lastRegisterPublishMillis >= publishRegisterInterval.count())
    {
        lastRegisterPublishMillis = currentMillis;
        registerDevice();
    }

    // Periodically publish "send-data" event
    if (Particle.connected() && currentMillis - lastDataPublishMillis >= publishDataInterval.count())
    {
        lastDataPublishMillis = currentMillis;
        sendData();
    }

    // Handle button click to immediately trigger both events
    if (buttonClicked)
    {
        buttonClicked = false;
        if (Particle.connected())
        {
            registerDevice();
            sendData();
        }
    }
}

// Publish "register-device" event
void registerDevice()
{
    char publishDataBuf[particle::protocol::MAX_EVENT_DATA_LENGTH + 1];
    JSONBufferWriter writer(publishDataBuf, sizeof(publishDataBuf) - 1);

    // Construct the JSON payload
    writer.beginObject();
    writer.name("CONFIGURABLE_DEVICE_ID").value("device1");
    writer.name("CONFIGURABLE_USERNAME").value("alex");
    writer.endObject();

    // Ensure the buffer is null-terminated
    writer.buffer()[std::min(writer.bufferSize(), writer.dataSize())] = 0;
    
    // Publish the event
    Particle.publish(registerEventName, publishDataBuf, PRIVATE);
}

// Publish "send-data" event
void sendData()
{
    // Read heart rate and blood oxygen level
    readHeartRateAndBOx();

    char publishDataBuf[particle::protocol::MAX_EVENT_DATA_LENGTH + 1];
    JSONBufferWriter writer(publishDataBuf, sizeof(publishDataBuf) - 1);

    // Construct the JSON payload
    writer.beginObject();
    writer.name("bpm").value(beatAvg);
    writer.name("bOx").value(98); // Placeholder as MAX30105 does not provide blood oxygen directly
    writer.name("deviceId").value("device1");
    writer.endObject();

    // Ensure the buffer is null-terminated
    writer.buffer()[std::min(writer.bufferSize(), writer.dataSize())] = 0;


    // Publish the event
    Particle.publish(sendDataEventName, publishDataBuf, PRIVATE);
}

// Initialize the MAX30105 sensor
bool initializeSensor()
{
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST))
    {
        return false;
    }
    particleSensor.setup();               // Configure sensor with default settings
    particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED to low to indicate sensor is running
    particleSensor.setPulseAmplitudeGreen(0);  // Turn off Green LED
    return true;
}

// Read heart rate and blood oxygen level
void readHeartRateAndBOx()
{
    long irValue = particleSensor.getIR();

    if (checkForBeat(irValue))
    {
        unsigned long currentTime = millis();
        unsigned long delta = currentTime - lastBeat;
        lastBeat = currentTime;

        if (delta > 0)
        {
            beatsPerMinute = 60.0 / (delta / 1000.0);

            rates[rateSpot++] = (byte)beatsPerMinute;
            rateSpot %= RATE_SIZE;

            // Take average of readings
            beatAvg = 0;
            for (byte x = 0; x < RATE_SIZE; x++)
                beatAvg += rates[x];
            beatAvg /= RATE_SIZE;
        }
    }

    // Optional: Check for no finger detected
    if (irValue < 50000)
    {
        Particle.publish("HeartRateWarning", "No finger detected!", PRIVATE);
    }
}

// Webhook response handler
void hookResponseHandler(const char *event, const char *data)
{
    // Log or publish webhook responses for debugging
    if (data)
    {
        Particle.publish("webhook-response", data, PRIVATE);
    }
    else
    {
        Particle.publish("webhook-response", "No data received", PRIVATE);
    }
}

// MODE button click handler
void clickHandler(system_event_t event, int param)
{
    buttonClicked = true;
}
