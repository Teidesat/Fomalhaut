import { FC, useState } from "react";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { getTemperatureColor } from "./TemperatureFunctions";
import { satelliteParts, nameToPart } from "./SatelliteModelParts";

interface TemperatureIndicatorsProps {
  temperatureData: { name: string; temperature: number }[];
}

const TemperatureIndicators: FC<TemperatureIndicatorsProps> = ({
  temperatureData,
}) => {
  const [activePart, setActivePart] = useState<string | null>(null);
  const [_hoveredPart, setHoveredPart] = useState<string | null>(null);

  const togglePart = (partName: string) => {
    setActivePart((prevActivePart) =>
      prevActivePart === partName ? null : partName,
    );
  };

  const movePart = (
    mesh: THREE.Mesh,
    moveOffset: { x: number; y: number; z: number },
  ) => {
    if (mesh.userData.tween) {
      mesh.userData.tween.stop();
    }
    mesh.userData.tween = new TWEEN.Tween(mesh.position)
      .to(moveOffset, 500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
  };

  function check_offset(
    mesh: THREE.Mesh,
    moveOffset: { x: number; y: number; z?: number },
  ) {
    if (!mesh.parent?.parent) return;

    if (mesh.parent.parent.name === "21_06_050v2_-_epsstorage1") {
      moveOffset.y += RegExp(/(39|40|41|42|43|44)/).exec(mesh.name)
        ? 0.1
        : -0.1;
    } else if (mesh.parent.parent.name === "21_01_030v2_-_pylcontroller1") {
      moveOffset.y -= 10;
    } else {
      moveOffset.x += 10;
    }
  }

  const handleMouseClick = (partName: string) => {
    const part = nameToPart.find((p) => p.name === partName)?.part;
    if (!part || !satelliteParts[part]) return;

    // If a part is already clicked, move it back to its original position
    if (activePart && activePart !== partName) {
      const prevPart = nameToPart.find((p) => p.name === activePart)?.part;
      if (prevPart && satelliteParts[prevPart]) {
        satelliteParts[prevPart].forEach((child) => {
          if (child.object instanceof THREE.Mesh) {
            const mesh = child.object;
            if (mesh.userData.originalPosition) {
              movePart(mesh, {
                x: mesh.userData.originalPosition.x,
                y: mesh.userData.originalPosition.y,
                z: mesh.userData.originalPosition.z,
              });
            }
          }
        });
      }
    }

    togglePart(partName);

    // Move the clicked part
    satelliteParts[part].forEach((child) => {
      if (child.object instanceof THREE.Mesh) {
        const mesh = child.object;
        if (!mesh.userData.originalPosition) return;

        const moveOffset = {
          x: mesh.userData.originalPosition.x,
          y: mesh.userData.originalPosition.y,
          z: mesh.userData.originalPosition.z,
        };

        check_offset(mesh, moveOffset);

        movePart(mesh, moveOffset);
      }
    });
  };

  const handleMouseEnter = (partName: string) => {
    if (activePart === partName) return; // If clicked, do nothing

    setHoveredPart(partName);

    const part = nameToPart.find((p) => p.name === partName)?.part;
    if (!part || !satelliteParts[part]) return;

    satelliteParts[part].forEach((child) => {
      if (child.object instanceof THREE.Mesh) {
        const mesh = child.object;
        mesh.userData.originalPosition ??= mesh.position.clone();

        const moveOffset = { ...mesh.position };

        check_offset(mesh, moveOffset);

        movePart(mesh, moveOffset);
      }
    });
  };

  const handleMouseLeave = (partName: string) => {
    if (activePart === partName) return; // If clicked, do nothing

    setHoveredPart(null);

    const part = nameToPart.find((p) => p.name === partName)?.part;
    if (!part || !satelliteParts[part]) return;

    satelliteParts[part].forEach((child) => {
      if (child.object instanceof THREE.Mesh) {
        const mesh = child.object;
        if (!mesh.userData.originalPosition) return;

        movePart(mesh, {
          x: mesh.userData.originalPosition.x,
          y: mesh.userData.originalPosition.y,
          z: mesh.userData.originalPosition.z,
        });
      }
    });
  };

  return (
    <div className="temperature-indicators">
      {temperatureData.map((part, index) => (
        <div
          key={index}
          className={`temp-card ${activePart === part.name ? "active" : ""}`}
          onMouseEnter={() => handleMouseEnter(part.name)}
          onMouseLeave={() => handleMouseLeave(part.name)}
          onClick={() => handleMouseClick(part.name)}
          style={{ cursor: "pointer" }}
        >
          <span className="part-name">{part.name}</span>
          <div className="temp-bar-container">
            <div
              className="temp-bar"
              style={{
                width: `${((part.temperature + 60) / 140) * 100}%`,
                background: getTemperatureColor(part.temperature),
              }}
            ></div>
          </div>
          <span className="temp-value">{part.temperature.toFixed(1)}°C</span>
        </div>
      ))}
    </div>
  );
};

export default TemperatureIndicators;
