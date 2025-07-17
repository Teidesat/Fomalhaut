import { FC } from "react";
import "./About.css";

type AboutProps = object;

const About: FC<AboutProps> = () => (
  <div className="About">
    <h1>About</h1>
    <h2>Authors:</h2>
    <div>
      <h3>New react project</h3>
      <p>Mikel Mugica Arregui</p>
      <p>Álvaro Rodríguez Gómez</p>
      <p>Sergio Tabares Hernández</p>
    </div>
    <div>
      <h3>Older node/vue project</h3>
      <p>Jorge Sierra Acosta</p>
      <p>Andrés Calimero</p>
      <p>Fabio Ovidio Bianchini Cano</p>
      {/*ToDo: Add the remaining authors*/}
    </div>
    <div>
      <h2>Technologies used:</h2>
      <p>React</p>
      <p>React Router</p>
      <p>Vite</p>
      <p>Bootstrap</p>
      <p>ThreeJS</p>
      <p>Grafana</p>
    </div>
  </div>
);

export default About;
