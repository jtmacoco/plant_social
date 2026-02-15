#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "";
const char* password = "";
const char* serverName = ""; 

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  int status = WiFi.status();
  if (status == WL_CONNECT_FAILED) Serial.println("Error: Connection Failed (Check Password)");
  else if (status == WL_NO_SSID_AVAIL) Serial.println("Error: SSID Not Found (Check Name/Range)");
  else Serial.print(".");
}
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    int rawValue = analogRead(35);
    String jsonPayload = "{\"sensor_id\":\"esp32_jon_1\", \"moisture_value\":" + String(rawValue) + "}";

    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.printf("Sent: %d | Response: %d\n", rawValue, httpResponseCode);
    }
    http.end();
  }

  // 30 seconds = 30,000 milliseconds
  delay(30000); 
}