<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card mt-3 mb-5 login-card">
          <div class="card-body">
            <div class="card-logo">
              <img id="LogoParkpal" src="/src/assets/icons/Parkpal_Logo.svg" alt="Park Pal Logo">
            </div>
            <h1 class="text-center mb-4">Sign In</h1>
            <p class="login-info-text">Login to Create and Join Events</p>
            <form @submit.prevent="submitForm">


              <div class="mb-3">
                <input
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="abc@example.com"
                    v-model="email"
                    required
                    aria-describedby="emailHelp">

                <div v-if="emailError" class="text-danger">{{ emailError }}</div>
              </div>


              <div class="mb-3">
                <div class="input-group">
                  <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      placeholder="Your password"
                      v-model="password"
                      required>
                  <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="togglePasswordVisibility">
                    <span v-if="showPassword">
                      <i class="bi bi-eye-slash"></i>
                    </span>
                    <span v-else>
                      <i class="bi bi-eye"></i>
                    </span>
                  </button>
                </div>


                <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
              </div>


              <div class="text-center">
                <a href="#" @click.prevent="showForgotPasswordModal = true">Forgot your Password?</a>
              </div>


              <div class="mt-3 text-center">
                <button type="submit" class="btn btn-primary">
                  Log in
                  <span class="icon"></span>
                </button>
              </div>
            </form>


            <div class="mt-3 text-center">
              <router-link to="/register" class="btn btn-secondary" aria-label="Register for an account">
                Register
                <span class="icon"></span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal-content">
        <!-- Close Button -->
        <button @click="closeModal" class="close-modal-btn">×</button>
        <h2>Error</h2>
        <p>{{ errorMessage }}</p>
        <p>Trouble logging in? You might not be a user yet.</p>
        <button class="btn btn-secondary mb-3" @click="routeToRegister">Register Now</button>
        <button @click="closeModal" class="btn btn-primary">Close</button>
      </div>
    </div>

    <div v-if="showForgotPasswordModal" class="modal-overlay">
      <div class="modal-content">
        <button @click="closeForgotPasswordModal" class="close-modal-btn">×</button>
        <h2>Forgot Password</h2>
        <p>
          Currently, we can only reset your password manually.
          Please contact us at
          <a href="mailto:ww23e018@technikum-wien.at">ww23e018@technikum-wien.at</a>.
        </p>
        <p>Otherwise, you are free to register a new account.</p>
        <button class="btn btn-primary mb-3" @click="routeToRegister">Register Now</button>
        <button @click="closeForgotPasswordModal" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { isAdmin, isAuthenticated } from "@/service/authService.js";

export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      showErrorModal: false,
      showForgotPasswordModal: false,
      errorMessage: '',
      emailError: '',
      passwordError: '',
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    validateInputs() {
      let valid = true;
      this.emailError = '';
      this.passwordError = '';

      if (!this.email) {
        this.emailError = "Email field cannot be blank.";
        valid = false;
      } else if (!this.email.includes('@')) {
        this.emailError = "Please enter a valid email address.";
        valid = false;
      }

      if (!this.password) {
        this.passwordError = "Password cannot be blank.";
        valid = false;
      }

      return valid;
    },
    async submitForm() {
      if (!this.validateInputs()) {
        return;
      }

      const loginData = {
        username: this.email,
        password: this.password
      };

      try {
        const response = await axios.post('http://localhost:8080/auth/login', loginData, {
          withCredentials: true
        });

        const isAuthenticatedUser = await isAuthenticated();
        const isAdminUser = await isAdmin();

        if (isAuthenticatedUser && isAdminUser) {
          window.location.href = '/eventOverview';
        } else {
          this.errorMessage = "You don't have permission to access this page.";
          this.showErrorModal = true;
        }

      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          if (status === 401 || 403) {
            this.errorMessage = "Incorrect username or password.";
            this.showErrorModal = true;
          } else if (status >= 500 && status < 600) {
            this.errorMessage = "A server error occurred. Please try again later.";
            this.showErrorModal = true;
          } else {
            this.errorMessage = "Incorrect username or password.";
            this.showErrorModal = true;
          }
        } else if (error.request) {
          this.errorMessage = "Unable to connect to the server. Please check your internet connection.";
          this.showErrorModal = true;
        } else {
          this.errorMessage = "Something went wrong. Please try again later.";
          this.showErrorModal = true;
        }
      }
    },
    routeToRegister() {
      window.location.href = '/register';
    },
    closeModal() {
      this.showErrorModal = false;
    },
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  color: #333;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90%;
  position: relative;
}

.close-modal-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.card {
  background: #ffffff;
  .card-logo {
    align-items: center;
    text-align: center;
    margin:12px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #B00101;
    color: whitesmoke;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

  }

  .btn-primary .icon {
    margin-left: 23px;
    display: inline-block;
    width: 24px;
    height: 24px;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M10 8l4 4-4 4" fill="white"/></svg>')
    no-repeat center;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: white;
    color: #B00101;
    border: solid 2px #B00101;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    text-decoration: none;
  }

  .btn-secondary .icon {
    margin-left: 13px;
    display: inline-block;
    width: 27px;
    height: 27px;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="%23B00101" stroke="white" stroke-width="2"/><path d="M10 8l4 4-4 4" fill="white"/></svg>') no-repeat center;
    background-size: contain;
  }

  .login-info-text {
    font-style: italic;
    color: #B00101;
    text-align: center;
  }
}

</style>
