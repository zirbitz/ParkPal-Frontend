<script setup>
import '@/scripts/registration.js';
</script>

<template>
  <div class="container md">
    <form class="row g-3">
      <div class="col-md-4">
        <label for="validationServer01" class="form-label">First name</label>
        <input type="text" class="form-control is-valid" id="validationServer01" value="Mark" required>
        <div class="valid-feedback">
          Looks good!
        </div>
      </div>
      <div class="col-md-4">
        <label for="validationServer02" class="form-label">Last name</label>
        <input type="text" class="form-control is-valid" id="validationServer02" value="Otto" required>
        <div class="valid-feedback">
          Looks good!
        </div>
      </div>

      <div class="col-md-3">
        <label for="validationServer04" class="form-label">Salutation</label>
        <select class="form-select is-invalid" id="validationServer04" aria-describedby="validationServer04Feedback"
                required>
          <option selected disabled value="">Choose...</option>
          <option>Female</option>
          <option>Male</option>
          <option>Other</option> <!-- add event listener and load site with option to wirte in here-->
        </select>
        <div id="validationServer04Feedback" class="invalid-feedback">
          Please select a valid state.
        </div>
      </div>

      <div class="col-md-4">
        <label for="validationServerUsername" class="form-label">E-Mail</label>
        <div class="input-group has-validation">
          <input type="text" class="form-control is-invalid" id="validationServerUsername"
                 aria-describedby="inputGroupPrepend3 validationServerUsernameFeedback" required>
          <div id="validationServerUsernameFeedback" class="invalid-feedback">
            Please choose a valid Email.
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <label for="validationServerUsername" class="form-label">Username</label>
        <div class="input-group has-validation">
          <span class="input-group-text" id="inputGroupPrepend3">@</span>
          <input type="text" class="form-control is-invalid" id="validationServerUsername"
                 aria-describedby="inputGroupPrepend3 validationServerUsernameFeedback" required>
          <div id="validationServerUsernameFeedback" class="invalid-feedback">
            Please choose a username.
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <label for="validationServer04" class="form-label">Country</label>
        <select class="form-select is-invalid" id="validationServer04" aria-describedby="validationServer04Feedback"
                required>
          <option selected disabled value="">Choose...</option>
          <option><!-- get List of Countries from API--></option>
        </select>
        <div id="validationServer04Feedback" class="invalid-feedback">
          Please select a valid country.
        </div>
      </div>

      <div class="col-md-6">
        <label for="validationServer03" class="form-label">Address</label>
        <input type="text" class="form-control is-invalid" id="validationServer03"
               aria-describedby="validationServer03Feedback" required>
        <div id="validationServer03Feedback" class="invalid-feedback">
          Please provide a valid address.
        </div>
      </div>

      <div class="col-md-3">
        <label for="validationServer03" class="form-label">City</label>
        <input type="text" class="form-control is-invalid" id="validationServer03"
               aria-describedby="validationServer03Feedback" required>
        <div id="validationServer03Feedback" class="invalid-feedback">
          Please provide a valid city.
        </div>
      </div>

      <div class="col-md-3">
        <label for="validationServer05" class="form-label">Zip / PLZ</label>
        <input type="text" class="form-control is-invalid" id="validationServer05"
               aria-describedby="validationServer05Feedback" required>
        <div id="validationServer05Feedback" class="invalid-feedback">
          Please provide a valid zip-code or PLZ.
        </div>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input is-invalid" type="checkbox" value="" id="invalidCheck3Terms"
                 aria-describedby="invalidCheck3TermsFeedback" required>
          <label class="form-check-label" for="invalidCheck3Terms">
            Agree to terms and conditions. See more details in: <a
              href="nutzungsvereinbarung.html">Nutzungsvereinbarung</a>
          </label>
          <div id="invalidCheck3TermsFeedback" class="invalid-feedback">
            You must agree to our terms and conditions before submitting.
          </div>
        </div>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input is-invalid" type="checkbox" value="" id="invalidCheck3DSVGO"
                 aria-describedby="invalidCheck3DSVGOFeedback" required>
          <label class="form-check-label" for="invalidCheck3DSVGO">
            Agree to storage and usage of User data. Get more info: <a href="DSVGO.html">Datenschutzgrundverordnung</a>
          </label>
          <div id="invalidCheck3DSVGOFeedback" class="invalid-feedback">
            You must agree to the DSVGO before submitting.
          </div>
        </div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" type="submit">Registration</button>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>