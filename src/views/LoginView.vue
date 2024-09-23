<template>
  <div id="login">
    <h1>Enter Bricks.co credentials</h1>
    <br />
    <input
      type="email"
      name="email"
      v-model="input.email"
      placeholder="Email"
    />
    <input
      type="password"
      name="password"
      v-model="input.password"
      placeholder="Password"
    />
    <button type="button" v-on:click="login()">Login</button>

    <h3>
      Or sign up
      <a :href="`https://app.bricks.co/sign-up/LOUCOC57`" target="_blank"
        >here</a
      >
      (referral link)
    </h3>
  </div>
</template>

<script>
import axios from "axios";
import { useToast } from "vue-toastification";
const toast = useToast();
export default {
  data() {
    return {
      input: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async login() {
      if (this.input.email != "" && this.input.password != "") {
        const loginUrl = "https://api.bricks.co/customers/email/sign-in";
        
        const loginPayload = {
          email: this.input.email
        };
        
        const loginHeaders = {
          headers: {
            'x-password': this.input.password
          }
        };

        await axios
          .post(loginUrl, loginPayload, loginHeaders)
          .then((loginResponse) => {
            localStorage.setItem("Token", loginResponse.data.token);
            this.$emit("authenticated", true);
            this.$router.replace({ name: "map" });
          })
          .catch((err) => {
            console.log(err);
            toast.error("Invalid credentials");
          });
      } else {
        toast.error("Please fill credentials");
      }
    },
  },
};
</script>

<style scoped>
#login {
  width: 500px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
  margin: auto;
  margin-top: 200px;
  padding: 20px;
}
</style>
