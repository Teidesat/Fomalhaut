import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { updateTemperatureEffect, adjustMaterialProperties,applyHeatOverlay } from "./TemperatureFunctions";
import { satelliteParts, nameToPart } from "./SatelliteModelParts";

const useRandomTemperatures = (
  initialParts: { name: string; temperature: number }[]
) => {
  const [temperatureData, setTemperatureData] = useState(initialParts);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperatureData((prevData) => {
        const newData = prevData.map((part) => ({
          ...part,
          temperature: Math.max(-60, Math.min(80, part.temperature + (Math.random() * 10 - 5))),
        }));
        newData.forEach((part) => {
          const parent = nameToPart.find((p) => p.name === part.name)?.part;
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
        return newData;
      });
    }, 10000);
    
    return () => clearInterval(interval);

  }, []);
  return temperatureData;
};

export default useRandomTemperatures;