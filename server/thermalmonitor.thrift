namespace py thermalmonitor
namespace js thermalmonitor

typedef i64 timestamp

struct TempData {
  1: double temp,
  2: string sensor_id,
  3: timestamp timestamp
}

service ThermalMonitor {
   // Get all the data collected so far
   list<TempData> get_temperatures(),

   // Get the last data collected
   TempData get_last_temperature(),

   // Starts the monitoring
   oneway void start(),

   // Stops the monitoring
   oneway void stop()
}