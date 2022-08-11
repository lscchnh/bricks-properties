<script>
export default {
  name: "App",
  data() {
    return {
      authenticated: false,
    };
  },
  mounted() {
    if (!this.authenticated) {
      this.$router.replace({ name: "login" });
    }
  },
  methods: {
    setAuthenticated(status) {
      this.authenticated = status;
    },
    logout() {
      this.authenticated = false;
    },
  },
};
</script>

<template>
  <header>
    <div class="wrapper">
      <div id="nav">
        <router-link
          v-if="authenticated"
          to="/login"
          v-on:click="logout()"
          replace
          >Logout</router-link
        >
      </div>
    </div>
  </header>
  <RouterView @authenticated="setAuthenticated" />
</template>

<style>
@import "@/assets/base.css";

#app {
  display: flex;
  flex: 1;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  font-weight: normal;
  flex-direction: column;
}

@media (hover: hover) {
  a:hover {
    cursor: pointer;
  }
}

#nav {
  width: 100%;
  text-align: right;
  background-color: lightblue;
}

a:link {
  text-decoration: none;
}
a:visited {
  text-decoration: none;
}
a:hover {
  text-decoration: none;
}
a:active {
  text-decoration: none;
}
</style>
