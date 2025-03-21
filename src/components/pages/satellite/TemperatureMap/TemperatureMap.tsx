import React, { FC, useRef, useEffect, useState } from "react";
import "./TemperatureMap.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as TWEEN from "@tweenjs/tween.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TemperatureMapProps {}

const satelliteParts: { [key: string]: any[] } = {};

const initialParts = [
  { name: "Eps Storage", temperature: -40 },
  { name: "Obc + Transceptor", temperature: 0 },
  { name: "Lomoboard", temperature: 30 },
  { name: "Pyl Controller", temperature: 70 },
];

const nameToPart = [
  { name: "Eps Storage", part: "21_06_050v2_-_epsstorage1" },
  { name: "Obc + Transceptor", part: "21_03_000v2_-_obc_+_transceptor1" },
  { name: "Lomoboard", part: "21_08_010v2_-lomoboard1" },
  { name: "Pyl Controller", part: "21_01_030v2_-_pylcontroller1" },
]

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

//const raycaster = new THREE.Raycaster(); // Used for mouse interaction

const createScene = () => new THREE.Scene();

const createRenderer = (width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({
    logarithmicDepthBuffer: true,
    antialias: true,
  });
  renderer.setSize(width, height);
  return renderer;
};

const createCamera = (width: number, height: number) => {
  const NEAR = 1e-3,
    FAR = 1e3;
  const camera = new THREE.PerspectiveCamera(60, width / height, NEAR, FAR);
  camera.position.set(3, 3, 0);
  camera.lookAt(0, 0, 0);
  return camera;
};

const createControls = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  return controls;
};

const createLight = (scene: THREE.Scene) => {
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(10, 10, 10);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-10, -10, -10);
  scene.add(directionalLight2);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);
};


const createSatelliteModel = (
  scene: THREE.Scene,
  render: () => void,
  satelliteRef: React.MutableRefObject<THREE.Group | null>
) => {
  const loader = new GLTFLoader();
  loader.load(
    "/cubesat.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(10, 10, 10);

      satelliteRef.current = model;
      scene.add(model);

      const processedObjects = new Set();

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.parent?.parent) {
            const parentName = child.parent.parent.name;
            if (!satelliteParts[parentName]) {
              satelliteParts[parentName] = [];
            }
            if (!processedObjects.has(child)) {
              satelliteParts[parentName].push({
                name: child.name,
                type: child.type,
                object: child,
              });
              processedObjects.add(child);
            }
          }
          child.material = child.material.clone();
        }
      });
      
      render();
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
    }
  );
};

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


interface TemperatureIndicatorsProps {
  temperatureData: { name: string; temperature: number }[];
}

const TemperatureIndicators: FC<TemperatureIndicatorsProps> = ({ temperatureData }) => {
  
  const [activePart, setActivePart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const togglePart = (partName: string) => {
    setActivePart((prevActivePart) => (prevActivePart === partName ? null : partName));
  };


  const movePart = (mesh: THREE.Mesh, moveOffset: { x: number; y: number; z: number }) => {
    if (mesh.userData.tween) {
      mesh.userData.tween.stop();
    }
    mesh.userData.tween = new TWEEN.Tween(mesh.position)
      .to(moveOffset, 500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
  };

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

        let moveOffset = { x: mesh.userData.originalPosition.x, y: mesh.userData.originalPosition.y, z: mesh.userData.originalPosition.z };

        if (mesh.parent.parent.name === "21_06_050v2_-_epsstorage1") {
          moveOffset.y += mesh.name.match(/(39|40|41|42|43|44)/) ? 0.1 : -0.1;
        } else if (mesh.parent.parent.name === "21_01_030v2_-_pylcontroller1") {
          moveOffset.y -= 10;
        } else {
          moveOffset.x += 10;
        }

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
        if (!mesh.userData.originalPosition) {
          mesh.userData.originalPosition = mesh.position.clone();
        }

        let moveOffset = { ...mesh.position };

        if (mesh.parent.parent.name === "21_06_050v2_-_epsstorage1") {
          moveOffset.y += mesh.name.match(/(39|40|41|42|43|44)/) ? 0.1 : -0.1;
        } else if (mesh.parent.parent.name === "21_01_030v2_-_pylcontroller1") {
          moveOffset.y -= 10;
        } else {
          moveOffset.x += 10;
        }

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

interface TemperatureGraphsProps {
  temperatureData: { name: string; temperature: number }[];
}


const predefinedColors: Record<string, string> = {
  "Eps Storage": "#FF0000", // Red
  "Obc + Transceptor": "#00FF00", // Green
  "Lomoboard": "#ADD8E6", // Light Blue
  "Pyl Controller": "#FFFF00", // Yellow
};

const getColorForPart = (partName: string) => {
  return predefinedColors[partName] || `hsl(${Math.random() * 360}, 100%, 50%)`;
};

const TemperatureGraphs: FC<TemperatureGraphsProps> = ({ temperatureData }) => {
  const [history, setHistory] = useState<{ time: number; [key: string]: number }[]>([]);

  useEffect(() => {
    if (temperatureData.length === 0) return;

    const newEntry: { time: number; [key: string]: number } = { time: Date.now() };
    temperatureData.forEach((part) => {
      newEntry[part.name] = part.temperature;
    });

    setHistory((prevHistory) => [...prevHistory.slice(-15), newEntry]);
  }, [temperatureData]);

  const calculateStats = (partName: string) => {
    const values = history.map((entry) => entry[partName]).filter((value) => value !== undefined);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { min, max, avg };
  };

  return (
    <div className="temperature-graphs">
      <div className="graphs-title">TEMPERATURE GRAPHS</div>
      <ResponsiveContainer className="chart-container">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
        dataKey="time"
        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip
        labelFormatter={(label) => new Date(label).toLocaleTimeString()}
          />
          <Legend />
          {temperatureData.map((part) => (
        <Line
          key={part.name}
          type="monotone"
          dataKey={part.name}
          stroke={getColorForPart(part.name)}
          strokeWidth={2}
          dot={false}
        />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="temperature-stats">
      <div className="stats-title">TEMPERATURE STATS</div>
      <table className="stats-content">
        <thead>
        <tr>
          <th>Part Name</th>
          <th>Min Temperature</th>
          <th>Max Temperature</th>
          <th>Avg Temperature</th>
        </tr>
        </thead>
        <tbody>
        {temperatureData.map((part) => {
          const stats = calculateStats(part.name);
          return (
          <tr key={part.name} className="stat-item">
            <td className="stat-label">{part.name}</td>
            <td className="stat-value">{stats.min.toFixed(1)}°C</td>
            <td className="stat-value">{stats.max.toFixed(1)}°C</td>
            <td className="stat-value">{stats.avg.toFixed(1)}°C</td>
          </tr>
          );
        })}
        </tbody>
      </table>
      </div>
    </div>
  );
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

  const temperatureData = useRandomTemperatures(initialParts);

  /* INITIALIZATION useEffect */
  useEffect(() => {
    if (!canvasMountRef.current) return;
    const canvasContainer =
      document.querySelector(".canvas-container") || canvasMountRef.current;
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

    /* MOUSE MOVE useEffect
    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = canvasMountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(
        sceneRef.current.children,
        true
      );
      if (intersects.length > 0) {
        
      }
    };
    */

    /* MOUSE CLICK useEffect 
    const handleMouseDown = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = canvasMountRef.current!.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(
        sceneRef.current.children,
        true
      );
      if (intersects.length > 0) {
        console.log("Clicked on:", intersects[0].object.name);
        
      }
    };
    */

    //window.addEventListener("pointermove", handleMouseMove);
    //window.addEventListener("pointerdown", handleMouseDown);

    return () => {
      //window.removeEventListener("pointermove", handleMouseMove);
      //window.removeEventListener("pointerdown", handleMouseDown);
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
      <TemperatureIndicators temperatureData={temperatureData}/>
      <TemperatureGraphs temperatureData={temperatureData}/>
    </div>
  );
};

export default TemperatureMap;
