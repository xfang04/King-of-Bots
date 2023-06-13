<template>
  <NavBar />
  <router-view></router-view>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";

export default {
  components: {
    NavBar,
  },
  setup() {
    // $.ajax({
    //   url: "http://localhost:3000/user/account/token/",
    //   type: "post",
    //   data: {
    //     username: "xfang",
    //     password: "19960830",
    //   },
    //   success(resp) {
    //     console.log(resp);
    //   },
    //   error(err) {
    //     console.log(err);
    //   },
    // });
  },
};
</script>

<style>
body {
  background-image: url("@/assets/images/background.png");
  background-size: cover;
}
</style>
