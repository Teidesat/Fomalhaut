import { FC, useRef, useEffect, useState } from "react";
import "./TemperatureMap.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  createScene,
  createRenderer,
  createCamera,
  createControls,
  createLight,
  createSatelliteModel,
} from "./threeUtils";
import * as TWEEN from "@tweenjs/tween.js";
import TemperatureIndicators from "./TemperatureIndicators";
import TemperatureGraphs from "./TemperatureGraphs";
import useAPITemperature, { TemperatureReading} from "./useAPITemperature";

interface TemperatureMapProps {}

const groupByPartName = (data: TemperatureReading[]) => {
  const grouped: Record<string, { temperature: number; timestamp: string }[]> = {};

  data.forEach(({ part_name, temperature, timestamp }) => {
    if (!grouped[part_name]) {
      grouped[part_name] = [];
    }
    grouped[part_name].push({ temperature, timestamp: timestamp || "" });
  });

  return grouped;
};

// Main component
const TemperatureMap: FC<TemperatureMapProps> = () => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const satelliteRef = useRef<THREE.Group | null>(null);
  

  // This render function is used throughout to update the canvas
  const renderScene = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const rawTemperatureData = useAPITemperature(10000);
  const grouped = groupByPartName(rawTemperatureData);

  const latestTemps = Object.entries(grouped).map(([partName, readings]) => {
    const latest = readings[readings.length - 1];
    return { name: partName, temperature: latest.temperature };
  });

  /* INITIALIZATION useEffect */
  useEffect(() => {
    if (!canvasMountRef.current) return;
    const canvasContainer =  document.querySelector(".canvas-container") || canvasMountRef.current;
    const width = canvasContainer.clientWidth || window.innerWidth;
    const height = canvasContainer.clientHeight || window.innerHeight;

    const scene = createScene();
    const renderer = createRenderer(width, height);
    const camera = createCamera(width, height);
    const controls = createControls(camera, renderer);
    createLight(scene);

    cameraRef.current = camera;
    rendererRef.current = renderer;
    sceneRef.current = scene;
    controlsRef.current = controls;

    createSatelliteModel(scene, renderScene, satelliteRef);
    canvasMountRef.current.appendChild(renderer.domElement);

    return () => {
      if (rendererRef.current) {
        canvasMountRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  /* ANIMATION useEffect */
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      TWEEN.update();
      if (controlsRef.current) controlsRef.current.update();
      renderScene();
    };
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (controlsRef.current) controlsRef.current.dispose();
    };
  }, []);

  /* RESIZE useEffect */
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        const canvasContainer =
          document.querySelector(".canvas-container") || canvasMountRef.current;
        if (document.fullscreenElement) {
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        } else {
          const width = canvasContainer?.clientWidth || window.innerWidth;
          const height = canvasContainer?.clientHeight || window.innerHeight;
          rendererRef.current.setSize(width, height);
          cameraRef.current.aspect = width / height;
        }
        cameraRef.current.updateProjectionMatrix();
        renderScene();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="temperature-map">
      <div className="canvas-container" ref={canvasMountRef}>
        <div className="canvas-title">TEIDESAT-1 Temperature Map</div>
      </div>
      <TemperatureIndicators temperatureData={latestTemps}/>
      <TemperatureGraphs/>
    </div>
  );
};

export default TemperatureMap;
