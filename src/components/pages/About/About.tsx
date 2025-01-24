import React, { FC } from "react";
import "./About.css";

interface AboutProps {}

const About: FC<AboutProps> = () => (
  <div className="About">
    <h1>About</h1>
    <h2>Authors:</h2>
    <h3>Older vue project</h3>
    <ul>
      <li>Jorge Sierra Acosta</li>
      <li>Fabio Ovidio Bianchini Cano</li>
      <li>Christopher Medina</li>
    </ul>
    <h3>New react project</h3>
    <ul>
      <li>Álvaro Rodríguez Gómez</li>
    </ul>
    <h2>Technologies used:</h2>
    <ul>
      <li>React</li>
      <li>React Router</li>
      <li>Bootstrap</li>
      <li>ThreeJS</li>
    </ul>
  </div>
);

export default About;
