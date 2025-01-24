import React, { FC } from "react";
import "./TemperatureMap.css";

import * as THREE from 'three'
import { Canvas } from "@react-three/fiber";
import useWindowDimensions from "../../../../utilities/useWindowDimensions"

interface TemperatureMapProps {}

const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
document.querySelector('#canvas-container')?.appendChild(renderer.domElement)

const mesh = new THREE.Mesh()
mesh.geometry = new THREE.BoxGeometry()
mesh.material = new THREE.MeshStandardMaterial()

scene.add(mesh)

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()

const TemperatureMap: FC<TemperatureMapProps> = () => (
  <div className="TemperatureMap">
    
    <div id="canvas-container">
    <Canvas>
    <pointLight position={[10, 10, 10]} />
    <mesh>
      <sphereGeometry />
      <meshStandardMaterial />
    </mesh>
  </Canvas>
    </div>
  </div>
);

export default TemperatureMap;
