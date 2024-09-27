<script setup>

</script>

<template>
  <footer id="myFooter">
    <div class="container footer-custom">
      <footer class="py-5">
        <div class="row">
          <div class="col-6 col-md-2 mb-3">
            <h5>Events</h5>
            <ul class="nav flex-column">

              <li class="nav-item mb-2">
                <router-link :to="{name:'EventOverview'}" class="footer-item">Overview</router-link>
              </li>
              <li class="nav-item mb-2">
                <router-link :to="{name:'EventFilter'}" class="footer-item">Filter</router-link>
              </li>
              <li class="nav-item mb-2">
                <router-link :to="{name:'CreateEvent'}" class="footer-item">CreateEvent</router-link>
              </li>
            </ul>
          </div>

          <div class="col-6 col-md-2 mb-3">
            <h5>User</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2">
                <router-link :to="{name:'Login'}" class="footer-item">Login</router-link>
              </li>
              <li class="nav-item mb-2">
                <router-link :to="{name:'Register'}" class="footer-item">Register</router-link>
              </li>
              <li class="nav-item mb-2">
                <router-link :to="{name:'UserDashboard'}" class="footer-item">Dashboard</router-link>
              </li>
            </ul>
          </div>

          <div class="col-6 col-md-2 mb-3">
            <h5>ParkPal</h5>
            <ul class="nav flex-column">
              <li class="nav-item mb-2"><router-link :to="{ name:'Home' }" class="footer-item">Home</router-link></li>
              <li class="nav-item mb-2"><router-link :to="{ name:'ParksOverview' }" class="footer-item">Parks</router-link></li>
              <li class="nav-item mb-2"><router-link :to="{ name:'Faq' }" class="footer-item">FAQs</router-link></li>
              <li class="nav-item mb-2"><router-link :to="{ name:'Impressum' }" class="footer-item">Impressum</router-link></li>

            </ul>
          </div>

          <div class="col-md-5 offset-md-1 mb-3">
            <form>
              <h5>Subscribe to our newsletter</h5>
              <p>Monthly digest of what's new and exciting from us.</p>
              <div class="d-flex flex-column flex-sm-row w-100 gap-2">
                <label for="newsletter1" class="visually-hidden">Email address</label>
                <input id="newsletter1" type="text" class="form-control" placeholder="Email address">
                <button class="btn btn-primary" type="button">Subscribe</button>
              </div>
            </form>
          </div>
        </div>


        <div class="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
          <p>&copy; {{ new Date().getFullYear() }} ParkPal Inc. All rights reserved.</p>
          <ul class="list-unstyled d-flex">
            <li class="ms-3">
              <a class="link-dark" href="https://twitter.com" target="_blank" aria-label="Link to Twitter">
                <i class="bi bi-twitter"></i>
              </a>
            </li>
            <li class="ms-3">
              <a class="link-dark" href="https://instagram.com" target="_blank" aria-label="Link to Instagram">
                <i class="bi bi-instagram"></i>
              </a>
            </li>
            <li class="ms-3">
              <a class="link-dark" href="https://facebook.com" target="_blank" aria-label="Link to Facebook">
                <i class="bi bi-facebook"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>

  </footer>
</template>

<style scoped>

.footer-custom {
  .footer-item {
    color: white;
  }
  i {
    color: white;
    font-size: 24px;
  }
}
</style>