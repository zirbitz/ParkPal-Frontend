<script>
import CountryService from "@/service/countryService.js";
import axios from "axios";
import {API_ROUTES} from "@/apiRoutes.js";

export default {
  data() {
    return {
      genderOptions: ['FEMALE', 'MALE', 'OTHER'],
      firstName: '',
      lastName: '',
      firstNameValid: false,
      lastNameValid: false,
      firstNameDirty: false,
      lastNameDirty: false,
      salutation: '',
      gender: '',
      salutationValid: false,
      salutationDirty: false,
      genderValid: false,
      genderDirty: false,
      email: '',
      emailValid: false,
      emailDirty: false,
      username: '',
      usernameValid: false,
      usernameDirty: false,
      password: '',
      confirmPassword: '',
      passwordError: '',
      passwordErrorMessage: '',
      passwordsMatch: true,
      showPassword: false,
      showConfirmPassword: false,
      country: '',
      countries: [],
      countryValid: false,
      countryDirty: false,
      address: '',
      addressValid: false,
      addressDirty: false,
      city: '',
      cityValid: false,
      cityDirty: false,
      zip: '',
      zipValid: false,
      zipDirty: false,
      userPicture: null,
      pictureError: '',
      terms: false,
      termsValid: false,
      termsDirty: false,
      dsvgo: false,
      dsvgoValid: false,
      dsvgoDirty: false,
      showSuccessMessage: false,
      showFlashMessage: false,
      flashMessageText: ''
    };
  },
  async created() { // by Create the Component fetch the countries
    this.countries = await CountryService.getCountries(); // Fetch countries on component creation
  },
  methods: {
    checkPasswordsMatch() {
      this.passwordsMatch = this.password === this.confirmPassword
    },
    async register() {
      this.validatePassword();
      if (!this.passwordValid) {
        return;
      }

      this.markAllFieldsDirty();
      this.runValidations();

      if (!this.allFieldsValid()) {
        return;
      }


      if (!this.validateUserPicture()) {
        return;
      }

      /*Connect to API correctly later*/
      const formData = {
        firstName: this.firstName,
        lastName: this.lastName,
        salutation: this.salutation,
        gender: this.gender?.toUpperCase() ?? null,
        email: this.email,
        userName: this.username,
        password: this.password,
        countryId: this.country,
      };

      for (let [key, value] of Object.entries(formData)) {
        console.log(key + ": " + value);
      }

      if (!this.passwordsMatch) {
        alert("Passwords do not match")
        return
      }

      try {

        const response = await axios.post(API_ROUTES.AUTH_REGISTER, formData
        , {withCredentials: true})

        // Registration successful
        //alert('Registration successful!');
        // Inside your register method, after successful registration
        //this.showSuccessMessage = true;

        this.showFlashMessage = true
        this.flashMessageText = 'Registration successful'
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.showFlashMessage = false
        }, 3000); // Adjust time as needed

        //this.$router.replace({ name: 'Home' });
        this.resetForm();
      } catch (error) {
        console.error('Fetch error:', error);
        const errors = error.response.data.errors;
        if (errors != null) {
          errors.forEach(err => {
            this.passwordError += err.defaultMessage + '\n';
          })
        }
        //alert('An error occurred during registration.');
      }
    },
    markAllFieldsDirty() {
      this.firstNameDirty = true;
      this.lastNameDirty = true;
      this.salutationDirty = true;
      this.genderDirty = true;
      this.emailDirty = true;
      this.usernameDirty = true;
      this.countryDirty = true;
      this.addressDirty = true;
      this.cityDirty = true;
      this.zipDirty = true;
      this.termsDirty = true;
      this.dsvgoDirty = true;
    },
    runValidations() {
      this.validateFirstName();
      this.validateLastName();
      this.validateSalutation();
      this.validateGender();
      this.validateEmail();
      this.validateUsername();
      this.validatePassword();
      this.validateAddress();
      this.validateCity();
      this.validateZip();
      this.validateTerms();
      this.validateDsvgo();
    },
    validateUserPicture() {
      if (this.userPicture) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(this.userPicture.type)) {
          this.pictureError = 'Only JPG, PNG, or GIF files are allowed.';
          return false;
        }
      }
      return true;
    },
    validatePassword() {
      // Regular expression to ensure password is at least 12 characters long and contains at least one special character
      const passwordPattern = /^(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{12,}$/;
      this.passwordValid = passwordPattern.test(this.password);

      if (!this.passwordValid) {
        this.passwordErrorMessage = ' Password must be at least 12 characters long and include at least one special character.';
      }
    },
    validateFirstName() {
      this.firstNameValid = /^[a-zA-Z]+$/.test(this.firstName.trim());
    },
    validateLastName() {
      this.lastNameValid = /^[a-zA-Z]+$/.test(this.lastName.trim());
    },
    // Method to get validation class
    getValidationClass(fieldName) {
      return {
        'is-invalid': !this[`${fieldName}Valid`] && this[`${fieldName}Dirty`],
        'is-valid': this[`${fieldName}Valid`] && this[`${fieldName}Dirty`]
      };
    },
    // Method to get validation feedback message
    getValidationMessage(fieldName) {
      if (!this[`${fieldName}Valid`] && this[`${fieldName}Dirty`]) {
        return 'Please enter a valid ' + fieldName + '.';
      }
      if (this[`${fieldName}Valid`] && this[`${fieldName}Dirty`]) {
        return 'Looks good!';
      }
      return ''; // Default message
    },
    validateSalutation() {
      // This method might be simplified as salutation validation is now part of validateGender
      // But ensure it's called when the custom salutation input field is changed
      this.salutationValid = !!this.salutation.trim();
    },
    validateGender() {
      if (!this.gender) {
        this.genderValid = false;
        return;
      }
      this.genderValid = true;
      if (this.gender === 'OTHER') {
        // For 'OTHER', the salutation must be validated separately
        this.salutationValid = !!this.salutation?.trim();
      } else {
        // Automatically set salutation for 'MALE' and 'FEMALE'
        this.salutation = this.gender === 'MALE' ? 'Mr.' : 'Mrs.';
        this.salutationValid = true;
      }
    },
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailValid = emailPattern.test(this.email.trim());
    },
    validateUsername() {
      this.usernameValid = this.username.trim().length > 0;
    },
    validateAddress() {
      this.addressValid = this.address.trim().length > 0;
    },
    validateCity() {
      this.cityValid = this.city.trim().length > 0;
    },
    validateZip() {
      this.zipValid = this.zip.trim().length > 0;
    },
    validateTerms() {
      this.termsValid = this.terms;
    },
    validateDsvgo() {
      this.dsvgoValid = this.dsvgo;
    },
    allFieldsValid() {
      return this.firstNameValid &&
          this.lastNameValid &&
          this.salutationValid &&
          this.genderValid &&
          this.emailValid &&
          this.usernameValid &&
          this.termsValid &&
          this.dsvgoValid;
    },
    handleFileUpload(event) {
      this.userPicture = event.target.files[0];
      this.pictureError = '';
    },
    resetForm() {
      this.firstName = '';
      this.lastName = '';
      this.firstNameValid = false;
      this.lastNameValid = false;
      this.firstNameDirty = false;
      this.lastNameDirty = false;
      this.salutation = '';
      this.gender = '';
      this.salutationValid = false;
      this.salutationDirty = false;
      this.genderValid = false;
      this.genderDirty = false;
      this.email = '';
      this.emailValid = false;
      this.emailDirty = false;
      this.username = '';
      this.usernameValid = false;
      this.usernameDirty = false;
      this.country = '';
      this.countryValid = false;
      this.countryDirty = false;
      /*
      this.userPicture = null;
      this.pictureError = '';
       */
      this.terms = false;
      this.termsValid = false;
      this.termsDirty = false;
      this.dsvgo = false;
      this.dsvgoValid = false;
      this.dsvgoDirty = false;
    },
  },

  watch: {
    gender(newVal) {
      if (newVal === 'OTHER') {
        this.salutation = '';
        this.salutationValid = false;
      }
      this.validateGender();
    }
  }
};
</script>

<template>
  <div class="container md">
    <h1>Registration</h1>
    <div v-if="showFlashMessage" class="flash-message">
      {{ flashMessageText }}
      <span class="icon"></span>
    </div>
    <div v-if="showSuccessMessage" class="alert alert-success" role="alert">
      Registration successful!
    </div>
    <form class="register-form" @submit.prevent="register">
      <div class="row g-3 register-row">
        <div class="col-md-5">
          <label for="validationServer01" class="form-label">First name</label>
          <input type="text" placeholder="First Name" class="form-control" :class="{'is-invalid': !firstNameValid && firstNameDirty, 'is-valid': firstNameValid && firstNameDirty}" id="validationServer01" v-model="firstName" @blur="validateFirstName" >
          <div v-if="!firstNameValid && firstNameDirty" class="invalid-feedback">
            Please enter a valid first name.
          </div>
          <div v-if="firstNameValid && firstNameDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
        <div class="col-md-5">
          <label for="validationServer02" class="form-label">Last name</label>
          <input type="text" placeholder="Last Name" class="form-control" :class="{'is-invalid': !lastNameValid && lastNameDirty, 'is-valid': lastNameValid && lastNameDirty}" id="validationServer02" v-model="lastName" @blur="validateLastName" >
          <div v-if="!lastNameValid && lastNameDirty" class="invalid-feedback">
            Please enter a valid last name.
          </div>
          <div v-if="lastNameValid && lastNameDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
      </div>

      <div class="row g-3 register-row">
        <div class="col-md-5">
          <label for="validationServerEmail" class="form-label">E-Mail</label>
          <div class="input-group has-validation">
            <input type="email" placeholder="your@email.com" class="form-control" :class="{'is-invalid': !emailValid && emailDirty, 'is-valid': emailValid && emailDirty}" id="validationServerEmail" v-model="email" @blur="validateEmail" >
            <div v-if="!emailValid && emailDirty" class="invalid-feedback">
              Please choose a valid Email.
            </div>
            <div v-if="emailValid && emailDirty" class="valid-feedback">
              Looks good!
            </div>
          </div>
        </div>
        <div class="col-md-5 mb-3">
          <label for="validationServerUsername" class="form-label">Username</label>
          <div class="input-group has-validation">
            <span class="input-group-text" id="inputGroupPrepend3">@</span>
            <input type="text" placeholder="yourUsername" class="form-control" :class="{'is-invalid': !usernameValid && usernameDirty, 'is-valid': usernameValid && usernameDirty}" id="validationServerUsername" v-model="username" @blur="validateUsername">
            <div v-if="!usernameValid && usernameDirty" class="invalid-feedback">
              Please choose a username.
            </div>
            <div v-if="usernameValid && usernameDirty" class="valid-feedback">
              Looks good!
            </div>
          </div>
        </div>
      </div>

      <div v-if="passwordErrorMessage" class="alert alert-danger" role="alert" style="display: block; ">

        {{ passwordErrorMessage }}
      </div>

      <div class="register-row input-group mb-3">
        <input placeholder="Password" :type="showPassword ? 'text' : 'password'" class="form-control" id="password" v-model="password" @input="passwordErrorMessage = ''">
        <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
          <span>{{showPassword ? 'Hide' : 'Show'}}</span>
        </button>
      </div>


      <div class="register-row input-group mb-3">
        <input placeholder="Repeat your Password" :type="showConfirmPassword ? 'text' : 'password'" class="form-control" id="confirmPassword" v-model="confirmPassword" @blur="checkPasswordsMatch" >
        <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
          <span v-if="showConfirmPassword">Hide</span>
          <span v-else>Show</span>
        </button>
      </div>
      <div v-if="!passwordsMatch" class="invalid-feedback" style="display: block;">
        Passwords do not match.
      </div>

      <!--div class="row g-3 register-row">
        <div class="col-md-6">
          <label for="userPicture" class="form-label">Upload User Picture</label>
          <input type="file" class="form-control" id="userPicture" accept="image/*" @change="handleFileUpload">
          <div class="invalid-feedback" v-if="pictureError">
            {{ pictureError }}
          </div>
        </div>
      </div-->

      <div class="row g-3 register-row">
        <div class="col-md-4">
          <label for="validationServerCountry" class="form-label">Country</label>
          <select class="form-select" :class="{'is-invalid': !countryValid && countryDirty, 'is-valid': countryValid && countryDirty}" id="validationServerCountry" v-model="country" >
            <option selected disabled value="">Choose...</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
          </select>
        </div>
      </div>

      <div class="col-md-3">
        <label for="validationServer04" class="form-label">Gender</label>
        <select class="form-select" :class="getValidationClass('gender')" id="validationServer04" v-model="gender" @change="validateGender" >
          <option selected disabled value="">Choose...</option>
          <option v-for="option in genderOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <div v-if="!genderValid && genderDirty" class="invalid-feedback">
          {{ getValidationMessage('gender') }}
        </div>
        <div v-if="genderValid && genderDirty" class="valid-feedback">
          {{ getValidationMessage('gender') }}
        </div>
      </div>
      <div v-if="gender === 'OTHER'" class="col-md-5">
        <label for="customSalutationInput" class="form-label">Specify Salutation</label>
        <input type="text" class="form-control" :class="getValidationClass('salutation')" id="customSalutationInput" v-model="salutation" @blur="validateSalutation">
        <div v-if="!salutationValid && salutationDirty" class="invalid-feedback" id="salutationFeedback">
          {{ getValidationMessage('salutation') }}
        </div>
        <div v-if="salutationValid && salutationDirty" class="valid-feedback" id="salutationFeedback">
          {{ getValidationMessage('salutation') }}
        </div>
      </div>

      <div class="row g-3 register-row">
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" :class="{'is-invalid': !termsValid && termsDirty, 'is-valid': termsValid && termsDirty}" type="checkbox" v-model="terms" @change="validateTerms" id="invalidCheck3Terms" >
            <label class="form-check-label" for="invalidCheck3Terms">
              Agree to terms and conditions. See more details in:
              <router-link to="/usageAgreement">Usage Agreement</router-link>
            </label>
            <div v-if="!termsValid && termsDirty" class="invalid-feedback">
              You must agree to our terms and conditions before submitting.
            </div>
            <div v-if="termsValid && termsDirty" class="valid-feedback">
              Looks good!
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" :class="{'is-invalid': !dsvgoValid && dsvgoDirty, 'is-valid': dsvgoValid && dsvgoDirty}" type="checkbox" v-model="dsvgo" @change="validateDsvgo" id="invalidCheck3DSVGO" >
            <label class="form-check-label" for="invalidCheck3DSVGO">
              Agree to storage and usage of User data. Get more info:
              <router-link to="/DSVGO">Datenschutzgrundverordnung</router-link>
            </label>
            <div v-if="!dsvgoValid && dsvgoDirty" class="invalid-feedback">
              You must agree to the DSVGO before submitting.
            </div>
            <div v-if="dsvgoValid && dsvgoDirty" class="valid-feedback">
              Looks good!
            </div>
          </div>
        </div>
      </div>

      <div class="col mt-5 sign-in-redirect">
        <div class="row g-3">
          <div class="col-md-6 mt-4">
            <button class="btn btn-primary" type="submit">Sign Up <span class="icon"></span></button>
          </div>
          <div class="col-md-4 add-info">
            <div class="add-text">
              <p>Already have an Account?</p>
              <router-link to="/Login">Sign In</router-link>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 20px auto;
}

.invalid-feedback {
  display: block;
}

.form-check-input.is-invalid ~ .form-check-label {
  color: #dc3545;
}

.flash-message {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;

  .icon {
    margin-left: 0;
    display: inline-block;
    width: 36px;
    height:36px;
    background: url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20512%20512%22%3E%3C!--%21Font%20Awesome%20Free%206.6.0%20by%20%40fontawesome%20-%20https%3A//fontawesome.com%20License%20-%20https%3A//fontawesome.com/license/free%20Copyright%202024%20Fonticons%2C%20Inc.--%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M323.8%2034.8c-38.2-10.9-78.1%2011.2-89%2049.4l-5.7%2020c-3.7%2013-10.4%2025-19.5%2035l-51.3%2056.4c-8.9%209.8-8.2%2025%201.6%2033.9s25%208.2%2033.9-1.6l51.3-56.4c14.1-15.5%2024.4-34%2030.1-54.1l5.7-20c3.6-12.7%2016.9-20.1%2029.7-16.5s20.1%2016.9%2016.5%2029.7l-5.7%2020c-5.7%2019.9-14.7%2038.7-26.6%2055.5c-5.2%207.3-5.8%2016.9-1.7%2024.9s12.3%2013%2021.3%2013L448%20224c8.8%200%2016%207.2%2016%2016c0%206.8-4.3%2012.7-10.4%2015c-7.4%202.8-13%209-14.9%2016.7s.1%2015.8%205.3%2021.7c2.5%202.8%204%206.5%204%2010.6c0%207.8-5.6%2014.3-13%2015.7c-8.2%201.6-15.1%207.3-18%2015.2s-1.6%2016.7%203.6%2023.3c2.1%202.7%203.4%206.1%203.4%209.9c0%206.7-4.2%2012.6-10.2%2014.9c-11.5%204.5-17.7%2016.9-14.4%2028.8c.4%201.3%20.6%202.8%20.6%204.3c0%208.8-7.2%2016-16%2016l-97.5%200c-12.6%200-25-3.7-35.5-10.7l-61.7-41.1c-11-7.4-25.9-4.4-33.3%206.7s-4.4%2025.9%206.7%2033.3l61.7%2041.1c18.4%2012.3%2040%2018.8%2062.1%2018.8l97.5%200c34.7%200%2062.9-27.6%2064-62c14.6-11.7%2024-29.7%2024-50c0-4.5-.5-8.8-1.3-13c15.4-11.7%2025.3-30.2%2025.3-51c0-6.5-1-12.8-2.8-18.7C504.8%20273.7%20512%20257.7%20512%20240c0-35.3-28.6-64-64-64l-92.3%200c4.7-10.4%208.7-21.2%2011.8-32.2l5.7-20c10.9-38.2-11.2-78.1-49.4-89zM32%20192c-17.7%200-32%2014.3-32%2032L0%20448c0%2017.7%2014.3%2032%2032%2032l64%200c17.7%200%2032-14.3%2032-32l0-224c0-17.7-14.3-32-32-32l-64%200z%22/%3E%3C/svg%3E') no-repeat center;
  }
}
.register-form {
  margin-left: 8px;

  .btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #B00101;
    color: whitesmoke;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 24px;

  }

  .btn-primary .icon {
    margin-left: 23px;
    display: inline-block;
    width: 32px;
    height: 32px;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M10 8l4 4-4 4" fill="white"/></svg>')
    no-repeat center;
  }

  .form-label {
    font-weight: bold;
  }

  .register-row {
    margin-top: 12px;
  }

  .sign-in-redirect {
    .add-info {
      text-align: center;
      font-style: italic;
      font-weight: 700;
      font-size: 18px;
      border: 2px solid #B00101;
      border-radius: 8px;
      .add-text {
        margin: 14px;
      }
    }

  }
}
</style>