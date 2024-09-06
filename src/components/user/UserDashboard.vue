<script setup>
import EventCard from "@/components/event/EventCard.vue";
</script>

<script>
import CountryService from "@/service/countryService.js";
import axios from "axios";

export default {
  data() {
    return {
      // Profile and Authentication Data
      user: null,
      token: null,

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
  async created() {
    // Check for JWT token and fetch user data for profile
    this.token = localStorage.getItem('jwtToken');
    if (this.token) {
      try {
        const response = await axios.get('http://localhost:8080/users/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.user = response.data;
        this.firstName = this.user.firstName;
        this.lastName = this.user.lastName;
        this.email = this.user.email;
        this.username = this.user.username;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        localStorage.removeItem('jwtToken'); // Clear token if invalid
      }
    }

    this.countries = await CountryService.getCountries(); // Fetch countries on component creation
  },
  methods: {
    async updateProfile() {
      try {
        const response = await axios.put(
            'http://localhost:8080/users/me',
            {
              firstName: this.firstName,
              lastName: this.lastName,
              email: this.email,
            },
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            }
        );
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Error updating profile.');
      }
    },

    checkPasswordsMatch() {
      this.passwordsMatch = this.password === this.confirmPassword
    },
    async register() {
      this.validatePassword();
      if (!this.passwordValid) {
        return;
      }

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
        const response = await axios.post('http://localhost:8080/auth/register', formData
        )

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
  <div class="container">
    <h1>
      My UserProfile
    </h1>
    <hr>
    <div v-if="showFlashMessage" class="flash-message">
      {{ flashMessageText }}
      <span class="icon"></span>
    </div>
    <div v-if="showSuccessMessage" class="alert alert-success" role="alert">
      Registration successful!
    </div>

    <!-- User Profile Section -->
    <div v-if="user">
      <h2>User Profile</h2>
      <form @submit.prevent="updateProfile">
        <div class="row row-cols-1 g-4">
          <div class="col">
            <label for="firstName">First Name:</label>
            <input v-model="firstName" type="text" id="firstName" class="form-control" />
          </div>
          <div class="col">
            <label for="lastName">Last Name:</label>
            <input v-model="lastName" type="text" id="lastName" class="form-control" />
          </div>
          <div class="col">
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" class="form-control" />
          </div>
          <div class="col">
            <label for="username">Username:</label>
            <input v-model="username" type="text" id="username" class="form-control" disabled />
          </div>
          <button type="submit" class="btn btn-primary mt-3">Update Profile</button>
        </div>
      </form>
    </div>
    <div v-else>
      <p>Please log in to view your profile.</p>
    </div>

    <form class="register-form" @submit.prevent="register">
      <div class="row row-cols-1 g-4">
        <div class="col">
          <div class="card">
            <img :src="imageUrl" class="card-img-top" :alt="title">
            <div class="card-body">
              <h3 class="card-title">My UserProfile</h3>

              <div class="col-md-5">
                <label for="validationServer01" class="form-label">First name</label>
                <input type="text" placeholder="First Name" class="form-control" :class="{'is-invalid': !firstNameValid && firstNameDirty, 'is-valid': firstNameValid && firstNameDirty}" id="validationServer01" v-model="firstName" @blur="validateFirstName" required>
                <div v-if="!firstNameValid && firstNameDirty" class="invalid-feedback">
                  Please enter a valid first name.
                </div>
                <div v-if="firstNameValid && firstNameDirty" class="valid-feedback">
                  Looks good!
                </div>
              </div>

              <div class="col-md-5">
                <label for="validationServer02" class="form-label">Last name</label>
                <input type="text" placeholder="Last Name" class="form-control" :class="{'is-invalid': !lastNameValid && lastNameDirty, 'is-valid': lastNameValid && lastNameDirty}" id="validationServer02" v-model="lastName" @blur="validateLastName" required>
                <div v-if="!lastNameValid && lastNameDirty" class="invalid-feedback">
                  Please enter a valid last name.
                </div>
                <div v-if="lastNameValid && lastNameDirty" class="valid-feedback">
                  Looks good!
                </div>
              </div>

              <div class="col-md-5">
                <label for="validationServerEmail" class="form-label">E-Mail</label>
                <div class="input-group has-validation">
                  <input type="email" placeholder="your@email.com" class="form-control" :class="{'is-invalid': !emailValid && emailDirty, 'is-valid': emailValid && emailDirty}" id="validationServerEmail" v-model="email" @blur="validateEmail" required>
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
                  <input type="text" placeholder="yourUsername" class="form-control" :class="{'is-invalid': !usernameValid && usernameDirty, 'is-valid': usernameValid && usernameDirty}" id="validationServerUsername" v-model="username" @blur="validateUsername" required>
                  <div v-if="!usernameValid && usernameDirty" class="invalid-feedback">
                    Please choose a username.
                  </div>
                  <div v-if="usernameValid && usernameDirty" class="valid-feedback">
                    Looks good!
                  </div>
                </div>
              </div>

              <div class="register-row input-group mb-3">
                <input placeholder="Password" :type="showPassword ? 'text' : 'password'" class="form-control" id="password" v-model="password" @input="passwordErrorMessage = ''" required>
                <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                  <span>{{showPassword ? 'Hide' : 'Show'}}</span>
                </button>
              </div>

              <div class="register-row input-group mb-3">
                <input placeholder="Repeat your Password" :type="showConfirmPassword ? 'text' : 'password'" class="form-control" id="confirmPassword" v-model="confirmPassword" @blur="checkPasswordsMatch" required>
                <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
                  <span v-if="showConfirmPassword">Hide</span>
                  <span v-else>Show</span>
                </button>
              </div>

              <div>
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
              </div>

              <div class="row g-3 register-row">
                <div class="col-md-4">
                  <label for="validationServerCountry" class="form-label">Country</label>
                  <select class="form-select" :class="{'is-invalid': !countryValid && countryDirty, 'is-valid': countryValid && countryDirty}" id="validationServerCountry" v-model="country" required>
                    <option selected disabled value="">Choose...</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
                  </select>
                </div>
              </div>

              <div class="col mt-5 sign-in-redirect">
                <div class="row g-3">
                  <div class="col-md-6 mt-4">
                    <button class="btn btn-primary" type="submit">Update your Account <span class="icon"></span></button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="col">
          <div class="card">
            <img :src="imageUrl" class="card-img-top" :alt="title">
            <div class="card-body">
              <h3 class="card-title">My Created Events</h3>
              <div class="row row-cols-1 row-cols-md-2 g-4">

                <div class="card">
                  <div class="col-2 mt-2">
                    <button class="btn btn-primary" >Delete</button>
                  </div>
                  <div class="card-body">
                    <EventCard></EventCard>
                  </div>
                </div>

                <div class="card">
                  <div class="col-2 mt-2">
                    <button class="btn btn-primary">Delete</button>
                  </div>
                  <div class="card-body">
                    <EventCard></EventCard>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card">

            <div class="card-body">
              <h3 class="card-title">My Media</h3>
              <p class="card-text">Here are your media files:</p>

              <div id="app">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th>Preview</th>
                    <th>File Name</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(file, index) in paginatedFiles" :key="index">
                    <td>
                      <img v-if="isImage(file)" :src="file.url" class="img-thumbnail" width="100">
                      <video v-if="isVideo(file)" :src="file.url" class="video-preview" width="100" controls></video>
                    </td>
                    <td>{{ file.name }}</td>
                    <td>{{ formatSize(file.size) }}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" @click="deleteFile(index)">Delete</button>
                    </td>
                  </tr>
                  </tbody>
                </table>

                <nav aria-label="Page navigation">
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="prevPage">Previous</button>
                    </li>
                    <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                      <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="nextPage">Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>


  </div>

</template>

<style scoped>

</style>