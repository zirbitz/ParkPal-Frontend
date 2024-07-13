<script>
import CountryService from "@/service/countryService.js";
import axios from "axios";

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
      /* Uncomment this code to enable form validation if you want to test it if it's working
      // i don't want to validate the form
      this.markAllFieldsDirty();
      this.runValidations();

      if (!this.allFieldsValid()) {
        return;
      }


      if (!this.validateUserPicture()) {
        return;
      }
      */


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

        const response = await axios.post('http://localhost:8080/auth/register', formData)

        // Registration successful
        //alert('Registration successful!');
        // Inside your register method, after successful registration
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
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
    createFormData() {
      const formData = new FormData();
      formData.append('firstName', this.firstName);
      formData.append('lastName', this.lastName);
      formData.append('salutation', this.salutation);
      formData.append('gender', this.gender);
      formData.append('email', this.email);
      formData.append('username', this.username);
      formData.append('countryId', this.country);
      //formData.append('address', this.address);
      //formData.append('city', this.city);
      //formData.append('zip', this.zip);
      //formData.append('userPicture', this.userPicture);
      //formData.append('terms', this.terms);
      //formData.append('dsvgo', this.dsvgo);
      return formData;
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
    <div v-if="showSuccessMessage" class="alert alert-success" role="alert">
      Registration successful!
    </div>
    <form class="register-form" @submit.prevent="register">
      <div class="row g-3 register-row">
        <div class="col-md-5">
          <label for="validationServer01" class="form-label">First name</label>
          <input type="text" class="form-control" :class="{'is-invalid': !firstNameValid && firstNameDirty, 'is-valid': firstNameValid && firstNameDirty}" id="validationServer01" v-model="firstName" @blur="validateFirstName" required>
          <div v-if="!firstNameValid && firstNameDirty" class="invalid-feedback">
            Please enter a valid first name.
          </div>
          <div v-if="firstNameValid && firstNameDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
        <div class="col-md-5">
          <label for="validationServer02" class="form-label">Last name</label>
          <input type="text" class="form-control" :class="{'is-invalid': !lastNameValid && lastNameDirty, 'is-valid': lastNameValid && lastNameDirty}" id="validationServer02" v-model="lastName" @blur="validateLastName" required>
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
            <input type="email" class="form-control" :class="{'is-invalid': !emailValid && emailDirty, 'is-valid': emailValid && emailDirty}" id="validationServerEmail" v-model="email" @blur="validateEmail" required>
            <div v-if="!emailValid && emailDirty" class="invalid-feedback">
              Please choose a valid Email.
            </div>
            <div v-if="emailValid && emailDirty" class="valid-feedback">
              Looks good!
            </div>
          </div>
        </div>
        <div class="col-md-5">
          <label for="validationServerUsername" class="form-label">Username</label>
          <div class="input-group has-validation">
            <span class="input-group-text" id="inputGroupPrepend3">@</span>
            <input type="text" class="form-control" :class="{'is-invalid': !usernameValid && usernameDirty, 'is-valid': usernameValid && usernameDirty}" id="validationServerUsername" v-model="username" @blur="validateUsername" required>
            <div v-if="!usernameValid && usernameDirty" class="invalid-feedback">
              Please choose a username.
            </div>
            <div v-if="usernameValid && usernameDirty" class="valid-feedback">
              Looks good!
            </div>
          </div>
        </div>
      </div>

      <div class="register-row input-group mb-3">
        <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password" v-model="password" @input="passwordError = ''" required>
        <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
          <span>{{showPassword ? 'Hide' : 'Show'}}</span>
        </button>
      </div>
      <div v-if="passwordError" class="invalid-feedback" style="display: block;">
        {{ passwordError }}
      </div>

      <div class="register-row input-group mb-3">
        <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" id="confirmPassword" v-model="confirmPassword" @blur="checkPasswordsMatch" required>
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
          <select class="form-select" :class="{'is-invalid': !countryValid && countryDirty, 'is-valid': countryValid && countryDirty}" id="validationServerCountry" v-model="country" required>
            <option selected disabled value="">Choose...</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
          </select>
        </div>
      </div>

      <div class="col-md-3">
        <label for="validationServer04" class="form-label">Gender</label>
        <select class="form-select" :class="getValidationClass('gender')" id="validationServer04" v-model="gender" @change="validateGender" required>
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
        <input type="text" class="form-control" :class="getValidationClass('salutation')" id="customSalutationInput" v-model="salutation" @blur="validateSalutation" required>
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
            <input class="form-check-input" :class="{'is-invalid': !termsValid && termsDirty, 'is-valid': termsValid && termsDirty}" type="checkbox" v-model="terms" @change="validateTerms" id="invalidCheck3Terms" required>
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
            <input class="form-check-input" :class="{'is-invalid': !dsvgoValid && dsvgoDirty, 'is-valid': dsvgoValid && dsvgoDirty}" type="checkbox" v-model="dsvgo" @change="validateDsvgo" id="invalidCheck3DSVGO" required>
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
</style>