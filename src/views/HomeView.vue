<template>
  <div class="container content">
    <div class="row justify-content-center">
      <div class="col-12">
        <img
          class="about-logo"
          src="@/assets/images/teidesat_logo.png"
          style="width: 100%"
          alt="TeideSat Logo"
        />
        <div class="central-text">
          <p>
            Space is an environment that generates immense fascination for human
            beings because of the many secrets that it still holds. With the
            evolution of new technologies, possibilities increase and new
            horizons are opened. From this point of view, our association is
            born: Hyperspace Canarias, created with the aim to develop several
            space related projects.
          </p>
          <p>
            We are a group of students from the Universidad de La Laguna
            studying in different faculties and branches like astrophysics,
            physics, mathematics and several other engineering subjects.
          </p>
          <p>
            The European Space Agency (ESA) pose a challenge to all the European
            Universities’ students and teachers so they can learn how to design
            and build a nano-satellite. Ours will be oriented to test optical
            communications without the need of lasers between Earth and space.
          </p>
          <p>
            With that in mind <strong>Fomalhaut</strong> is developed as our
            main desktop application. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Maecenas tincidunt euismod nulla eu rhoncus. Mauris
            accumsan ante sapien, condimentum dignissim justo blandit eget. In
            vel diam a lorem dapibus dapibus. Curabitur ut lectus at est congue
            tincidunt cursus tristique dolor. Sed eu hendrerit elit. Praesent
            nulla orci, cursus non erat cursus, feugiat scelerisque orci. Fusce
            ante nisi, elementum in nisl id, blandit auctor nunc.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            tincidunt euismod nulla eu rhoncus. Mauris accumsan ante sapien,
            condimentum dignissim justo blandit eget. In vel diam a lorem
            dapibus dapibus. Curabitur ut lectus at est congue tincidunt cursus
            tristique dolor. Sed eu hendrerit elit. Praesent nulla orci, cursus
            non erat cursus, feugiat scelerisque orci. Fusce ante nisi,
            elementum in nisl id, blandit auctor nunc. Maecenas sed ultrices
            purus, cursus congue elit. Fusce ligula mauris, suscipit hendrerit
            diam id, posuere consequat arcu. Aliquam eget mi gravida, ultrices
            risus sed, efficitur velit. Aliquam sem turpis, fringilla et pretium
            quis, vestibulum eget urna. Nullam tincidunt enim et dui euismod,
            pellentesque ultrices dui iaculis. Nulla ultricies leo sed odio
            condimentum dictum. Aenean id nulla sagittis, dignissim ex vitae,
            tincidunt nulla. Praesent tincidunt consectetur leo nec volutpat.
          </p>
          <p>
            Aenean mattis, leo vel ornare efficitur, nunc leo auctor erat, sed
            cursus eros urna a leo. Mauris at nulla sem. Maecenas vehicula eros
            quis leo iaculis, eu convallis sapien molestie. Vivamus ultrices
            pretium elit in venenatis. Vivamus sagittis lorem sed nulla pretium
            commodo. Fusce eu tincidunt felis, luctus porttitor leo. In arcu
            purus, hendrerit ac enim non, fringilla vehicula nunc. Fusce id
            porta odio, posuere feugiat lacus. Quisque eget cursus ligula, ut
            dictum massa. Morbi et vehicula dui, sed congue ante. Quisque
            finibus, leo eu porttitor gravida, lectus ante porttitor nibh, in
            luctus nisl massa non sapien. Pellentesque hendrerit venenatis
            lectus a posuere. Nam porta urna a urna pellentesque vehicula.
            Vivamus rhoncus viverra erat, sit amet ultrices mi vehicula et.
            Integer egestas quis est vitae eleifend. Orci varius natoque
            penatibus et magnis dis parturient montes, nascetur ridiculus mus.
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="about-links">
    <div class="button-link">
      <a href="https://github.com/Teidesat/Fomalhaut"
        ><i class="github fab fa-github"></i
      ></a>
    </div>
    <div class="button-link">
      <a href="https://hyperspacegroup.com/"
        ><i class="website fas fa-globe"></i
      ></a>
    </div>
    <div class="button-link">
      <a href="https://donorbox.org/hyperspace-canarias"
        ><i class="donations fas fa-heart"></i
      ></a>
    </div>
  </div>
</template>

<script>
export default {};
</script>
<style scoped>
/*
.content {
  position: relative;
  left: calc(65px / 2);
  top: calc(65px / 2);
  height: calc(100% - 65px);
}
 .content {
  position: absolute;
  left: 65px;
  top: 65px;
  background: #f9f9f9;
  width: calc(100% - 65px);
  height: calc(100% - 65px);
}
.content .content-about {
  overflow-y: auto;
  height: 100%;
  width: 100%;
  display: block;
}
.content .content-about .central-text {
  font-size: 13pt;
  width: 50%;
  max-width: 567.5px;
  margin-left: auto;
  margin-right: auto;
}
.content .content-about .central-text p {
  text-align: justify;
  text-justify: inter-word;
  text-indent: 25px;
  margin-bottom: 30px;
} */
.about-logo {
  width: 70%;
  max-width: 794.5px;
}
.about-links {
  position: fixed;
  right: 50px;
  bottom: 25px;
}
.about-links .button-link {
  margin-top: 10px;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 6px 6px 12px #c7c7c7, -6px -6px 12px #ffffff;
  border-radius: 40px;
  overflow: hidden;
  width: 40px;
  height: 40px;
  text-align: center;
}
.about-links .button-link:hover {
  transition: 0.3s ease;
  background-color: rgb(210, 210, 210);
}
.about-links .button-link i {
  font-size: 20px;
  line-height: 40px;
  vertical-align: middle;
}
.about-links .button-link:active {
  box-shadow: inset 6px 6px 10px 0 rgba(0, 0, 0, 0.2),
    inset -6px -6px 10px 0 rgba(255, 255, 255, 0.5);
}
.about-links .button-link .github {
  color: #555;
}
.about-links .button-link .website {
  color: #7aefff;
}
.about-links .button-link .donations {
  color: #ff7878;
}

/*# sourceMappingURL=about.css.map */
</style>
