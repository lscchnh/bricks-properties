<template>
    <div id="login">
        <h1>Bricks.co credentials</h1>
        <input type="text" name="email" v-model="input.email" placeholder="Email" />
        <input type="password" name="password" v-model="input.password" placeholder="Password" />
        <button type="button" v-on:click="login()">Login</button>
    </div>
</template>

<script>
    import axios from "axios";
    export default {
        name: 'Login',
        data() {
            return {
                input: {
                    email: "",
                    password: ""
                }
            }
        },
        methods: {
            async login() {
                if(this.input.email != "" && this.input.password != "") {    
                    const loginUrl = 'https://api.bricks.co/customers/email/sign-in';
                    const loginPayload = { email: this.input.email, password: this.input.password };
                    const loginResponse = await axios.post(loginUrl, loginPayload); 
                    localStorage.setItem('Token', loginResponse.data.token)              
                    this.$emit("authenticated", true);
                    this.$router.replace({ name: "map" });
                             
                } else {
                    console.log("An email and password must be present");
                }
            }
        }
    }
</script>

<style scoped>
    #login {
        width: 500px;
        border: 1px solid #CCCCCC;
        background-color: #FFFFFF;
        margin: auto;
        margin-top: 200px;
        padding: 20px;
    }
</style>