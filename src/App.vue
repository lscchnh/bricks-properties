<script>
  export default {
          name: 'App',
          data() {
              return {
                  authenticated: false
              }
          },
          mounted() {
              if(!this.authenticated) {
                  this.$router.replace({ name: "login" });
              }
          },
          methods: {
              setAuthenticated(status) {
                  this.authenticated = status;
              },
              logout() {
                  this.authenticated = false;
              }
          }
      }
</script>

<template style="overflow: hidden">
  <header>
    <div class="wrapper">
      <div id="nav">
          <router-link v-if="authenticated" to="/login" v-on:click.native="logout()" replace>Logout</router-link>
      </div>
    </div>
  </header>
  <RouterView @authenticated="setAuthenticated"/> 
</template>

<style>
@import '@/assets/base.css';

#app {
  display: flex;
  flex: 1;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  font-weight: normal;
  flex-direction: column;
}

header {
  line-height: 1.5;
  max-height: 100vh;
  text-align: right;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
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

a:link { text-decoration: none; }
a:visited { text-decoration: none; }
a:hover { text-decoration: none; }
a:active { text-decoration: none; }

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #nav {
    width: 100%;
    text-align: right;
    background-color: lightblue;
  }

  a:link { text-decoration: none; }
  a:visited { text-decoration: none; }
  a:hover { text-decoration: none; }
  a:active { text-decoration: none; }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
