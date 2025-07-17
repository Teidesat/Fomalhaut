import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { satelliteParts } from "./SatelliteModelParts";
import { MutableRefObject } from "react";

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
  renderer: THREE.WebGLRenderer,
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
  satelliteRef: MutableRefObject<THREE.Group | null>,
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
    },
  );
};

export {
  createScene,
  createRenderer,
  createCamera,
  createControls,
  createLight,
  createSatelliteModel,
};
