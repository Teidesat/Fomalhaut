import React, { FC } from "react";
import "./Home.css";

import { CiGlobe } from "react-icons/ci";
import { FaGithub, FaHeart } from "react-icons/fa";

interface HomeProps {}

const Home: FC<HomeProps> = () => (
  <div className="Home">
    <img
      className="about-logo"
      src="src/assets/teidesat_logo.png"
      alt="TeideSat Logo"
    />
    <div className="central-text">
      <p>
        Space is an environment that generates immense fascination for human
        beings because of the many secrets that it still holds. With the
        evolution of new technologies, possibilities increase and new horizons
        are opened. From this point of view, our association is born: Hyperspace
        Canarias, created with the aim to develop several space related
        projects.
      </p>
      <p>
        We are a group of students from the Universidad de La Laguna studying in
        different faculties and branches like astrophysics, physics, mathematics
        and several other engineering subjects.
      </p>
      <p>
        The European Space Agency (ESA) pose a challenge to all the European
        Universities’ students and teachers so they can learn how to design and
        build a nano-satellite. Ours will be oriented to test optical
        communications without the need of lasers between Earth and space.
      </p>
      <p>
        With that in mind <strong>Fomalhaut</strong> is developed as our main
        desktop application.
      </p>
    </div>
    <div className="about-links">
      <div className="button-link">
        <a href="https://github.com/Teidesat/Fomalhaut">
          <FaGithub color="black" />
        </a>
      </div>
      <div className="button-link">
        <a href="https://hyperspacegroup.com/">
          <CiGlobe color="blue"/>
        </a>
      </div>
      <div className="button-link">
        <a href="https://donorbox.org/hyperspace-canarias">
          <FaHeart color="red"/>
        </a>
      </div>
    </div>
  </div>
);

export default Home;
