<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-8 text-start">
        <hr />
        <h1>About</h1>
        <ul>
          <h3>App made by:</h3>
          <li>Jorge Sierra Acosta</li>
          <li>Fabio Ovidio Bianchini Cano</li>
        </ul>

        <ul>
          <h5>Technologies used:</h5>
          <li>Vue Cli</li>
          <li>Vue Router</li>
          <li>Bootstrap</li>
          <li>ThreeJS</li>
          <li>Electron</li>
          <li>test</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  padding-left: 1.3em;
}
li:before {
  content: "\f105"; /* FontAwesome Unicode */
  font-family: FontAwesome;
  display: inline-block;
  margin-left: -1.3em; /* same as padding-left set on li */
  width: 1.3em; /* same as padding-left set on li */
}
</style>
