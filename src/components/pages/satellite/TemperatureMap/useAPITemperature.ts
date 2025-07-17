import { useEffect, useState } from "react";
import * as THREE from "three";
import {
  updateTemperatureEffect,
  adjustMaterialProperties,
  applyHeatOverlay,
} from "./TemperatureFunctions";
import { satelliteParts, nameToPart } from "./SatelliteModelParts";

export interface TemperatureReading {
  id?: number;
  part_name: string;
  temperature: number;
  timestamp?: string;
}

const useAPITemperature = (pollingInterval = 10000) => {
  const [temperatureData, setTemperatureData] = useState<TemperatureReading[]>(
    [],
  );

  useEffect(() => {
    const fetchTemperatureData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/temperature/", {
          // Cambia esto si es otro endpoint
          headers: {
            Authorization: "Bearer holis123",
          },
        });
        const fetchedData: TemperatureReading[] = await response.json();
        setTemperatureData(fetchedData);

        // Update visual effects
        fetchedData.forEach((part) => {
          const parent = nameToPart.find(
            (p) => p.name === part.part_name,
          )?.part;
          if (parent && satelliteParts[parent]) {
            satelliteParts[parent].forEach((child) => {
              if (child.object instanceof THREE.Mesh) {
                updateTemperatureEffect(child.object, part.temperature);
                adjustMaterialProperties(child.object, part.temperature);
                applyHeatOverlay(child.object, part.temperature);
              }
            });
          }
        });
      } catch (err) {
        console.error("Failed to GET temperature data:", err);
      }
    };

    // Fetch immediately once, then start interval
    fetchTemperatureData();
    const interval = setInterval(fetchTemperatureData, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return temperatureData;
};

export default useAPITemperature;
