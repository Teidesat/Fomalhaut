import * as THREE from 'three';

const getTemperatureColor = (temp: number) => {
  const minTemp = -60;
  const maxTemp = 80;
  const normalized = (temp - minTemp) / (maxTemp - minTemp);
  return `hsl(${(1 - normalized) * 240}, 100%, 50%)`; // Blue (240°) → Red (0°)
};

const updateTemperatureEffect = (part: THREE.Mesh, temperature: number) => {
  const material = part.material as THREE.MeshStandardMaterial;
  
  if (temperature > 40) {
    material.emissive.setHex(0xff4500); // Hot (orange glow)
    material.emissiveIntensity = 0.5;
  } else if (temperature < -20) {
    material.emissive.setHex(0x0000ff); // Cold (blue glow)
    material.emissiveIntensity = 0.3;
  } else {
    material.emissive.setHex(0x000000); // Neutral (no glow)
    material.emissiveIntensity = 0;
  }
};

const adjustMaterialProperties = (part: THREE.Mesh, temperature: number) => {
  const material = part.material as THREE.MeshStandardMaterial;

  // Reduce roughness for heat, increase for cold
  material.roughness = temperature > 40 ? 0.2 : temperature < -20 ? 0.8 : 0.5;

  // Slight increase in metalness for hot parts
  material.metalness = temperature > 40 ? 1.0 : 0.7;
};

const applyHeatOverlay = (part: THREE.Mesh, temperature: number) => {
  const material = part.material as THREE.MeshStandardMaterial;
  
  // Create a red/orange transparent overlay effect
  material.transparent = true;
  material.opacity = temperature > 40 ? 0.9 : 1.0;
};

export { getTemperatureColor, updateTemperatureEffect, adjustMaterialProperties, applyHeatOverlay };