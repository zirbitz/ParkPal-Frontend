<template>
  <div class="container md">
    <h1>Registration</h1>
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
        <div class="col-md-3">
          <label for="validationServer04" class="form-label">Salutation</label>
          <select class="form-select" :class="{'is-invalid': !salutationValid && salutationDirty, 'is-valid': salutationValid && salutationDirty}" id="validationServer04" v-model="salutation" @change="validateSalutation" required>
            <option selected disabled value="">Choose...</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
          <div v-if="!salutationValid && salutationDirty" class="invalid-feedback">
            Please select a valid salutation.
          </div>
          <div v-if="salutationValid && salutationDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
        <div v-if="salutation === 'Other'" class="col-md-5">
          <label for="genderInput" class="form-label">Gender</label>
          <input type="text" class="form-control" :class="{'is-invalid': !genderValid && genderDirty, 'is-valid': genderValid && genderDirty}" id="genderInput" v-model="gender" @blur="validateGender" required>
          <div v-if="!genderValid && genderDirty" class="invalid-feedback">
            Please enter your gender.
          </div>
          <div v-if="genderValid && genderDirty" class="valid-feedback">
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

      <div class="row g-3 register-row">
        <div class="col-md-6">
          <label for="userPicture" class="form-label">Upload User Picture</label>
          <input type="file" class="form-control" id="userPicture" accept="image/*" @change="handleFileUpload">
          <div class="invalid-feedback" v-if="pictureError">
            {{ pictureError }}
          </div>
        </div>
      </div>

      <div class="row g-3 register-row">
        <div class="col-md-4">
          <label for="validationServerCountry" class="form-label">Country</label>
          <select class="form-select" :class="{'is-invalid': !countryValid && countryDirty, 'is-valid': countryValid && countryDirty}" id="validationServerCountry" v-model="country" @change="validateCountry" required>
            <option selected disabled value="">Choose...</option>
            <option>Country 1</option>
            <option>Country 2</option>
            <option>Country 3</option>
          </select>
          <div v-if="!countryValid && countryDirty" class="invalid-feedback">
            Please select a valid country.
          </div>
          <div v-if="countryValid && countryDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
        <div class="col-md-6">
          <label for="validationServerAddress" class="form-label">Address</label>
          <input type="text" class="form-control" :class="{'is-invalid': !addressValid && addressDirty, 'is-valid': addressValid && addressDirty}" id="validationServerAddress" v-model="address" @blur="validateAddress" required>
          <div v-if="!addressValid && addressDirty" class="invalid-feedback">
            Please provide a valid address.
          </div>
          <div v-if="addressValid && addressDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
      </div>

      <div class="row g-3 register-row">
        <div class="col-md-6">
          <label for="validationServerCity" class="form-label">City</label>
          <input type="text" class="form-control" :class="{'is-invalid': !cityValid && cityDirty, 'is-valid': cityValid && cityDirty}" id="validationServerCity" v-model="city" @blur="validateCity" required>
          <div v-if="!cityValid && cityDirty" class="invalid-feedback">
            Please provide a valid city.
          </div>
          <div v-if="cityValid && cityDirty" class="valid-feedback">
            Looks good!
          </div>
        </div>
        <div class="col-md-4">
          <label for="validationServerZip" class="form-label">Zip / PLZ</label>
          <input type="text" class="form-control" :class="{'is-invalid': !zipValid && zipDirty, 'is-valid': zipValid && zipDirty}" id="validationServerZip" v-model="zip" @blur="validateZip" required>
          <div v-if="!zipValid && zipDirty" class="invalid-feedback">
            Please provide a valid zip-code or PLZ.
          </div>
          <div v-if="zipValid && zipDirty" class="valid-feedback">
            Looks good!
          </div>
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

<script>
export default {
  data() {
    return {
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
      country: '',
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
      dsvgoDirty: false
    };
  },
  methods: {
    async register() {
      this.markAllFieldsDirty();

      this.runValidations();

      if (!this.allFieldsValid()) {
        return;
      }

      if (!this.validateUserPicture()) {
        return;
      }

      /*Connect to API correctly later*/

      /*try {
        const formData = this.createFormData();
        const response = await fetch('/api/register', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData);
          alert('Registration failed: ' + errorData.message);
          return;
        }

        // Registration successful
        alert('Registration successful!');
        this.$router.push('/home');  // Redirect to home page
        this.resetForm();
      } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred during registration.');
      }*/
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
      this.validateCountry();
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
      formData.append('country', this.country);
      formData.append('address', this.address);
      formData.append('city', this.city);
      formData.append('zip', this.zip);
      formData.append('userPicture', this.userPicture);
      formData.append('terms', this.terms);
      formData.append('dsvgo', this.dsvgo);
      return formData;
    },
    validateFirstName() {
      this.firstNameValid = /^[a-zA-Z]+$/.test(this.firstName.trim());
    },
    validateLastName() {
      this.lastNameValid = /^[a-zA-Z]+$/.test(this.lastName.trim());
    },
    validateSalutation() {
      this.salutationValid = !!this.salutation;
      if (this.salutation === 'Other') {
        this.genderDirty = true;
        this.validateGender();
      } else {
        this.genderDirty = false;
        this.genderValid = true;
      }
    },
    validateGender() {
      this.genderValid = this.salutation !== 'Other' || !!this.gender;
    },
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailValid = emailPattern.test(this.email.trim());
    },
    validateUsername() {
      this.usernameValid = this.username.trim().length > 0;
    },
    validateCountry() {
      this.countryValid = !!this.country;
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
          this.countryValid &&
          this.addressValid &&
          this.cityValid &&
          this.zipValid &&
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
      this.address = '';
      this.addressValid = false;
      this.addressDirty = false;
      this.city = '';
      this.cityValid = false;
      this.cityDirty = false;
      this.zip = '';
      this.zipValid = false;
      this.zipDirty = false;
      this.userPicture = null;
      this.pictureError = '';
      this.terms = false;
      this.termsValid = false;
      this.termsDirty = false;
      this.dsvgo = false;
      this.dsvgoValid = false;
      this.dsvgoDirty = false;
    }
  }
};
</script>

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
