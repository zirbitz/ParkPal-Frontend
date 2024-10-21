<template>
  <div class="confirmation-box">
    <button @click="closeLogoutSection" class="close-btn">×</button>

    <div class="confirmation-content">
      <h2>
        <i class="fas fa-exclamation-circle"></i> Wait! Are you sure you want to leave?
      </h2>
      <div class="assistant-container">
        <img src="@/assets/gif/clippy.gif" alt="Friendly Assistant" class="assistant-animation" />
      </div>
      <p>
        Before you go, why not check out some upcoming events or connect with other users?
        <br />
        If you're set on leaving, we’ll be here when you’re ready to come back!
      </p>
      <div class="action-buttons">
        <button @click="handleLogout" class="btn btn-danger">
          <i class="fas fa-sign-out-alt"></i> Yes, Log me out
        </button>
        <button @click="navigateToEventOverview" class="btn btn-secondary">
          <i class="fas fa-undo"></i> No, Take me back!
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  methods: {
    ...mapActions({
      logoutAction: 'logout'
    }),
    showLogoutSection() {
      this.showLogoutInfo = true;
    },
    closeLogoutSection() {
      this.showLogoutInfo = false;
    },
    navigateToEventOverview() {
      this.closeLogoutSection();
      this.$router.push('/eventOverview');
    },
    async handleLogout() {
      try {
        await this.logoutAction();
        this.$router.push({name: 'Login'});
      } catch (error) {
        console.error('Error during logout:', error);
      }
      this.closeLogoutSection();
    }
  }
};
</script>

<style scoped>
/* Wrapper for the confirmation section */
.confirmation-box {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 40px auto;
  border-left: 5px solid #ffc107; /* Decorative border */
}

/* Assistant animation styling */
.assistant-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.assistant-animation {
  width: 120px;
  height: auto;
  animation: bounce 1.5s infinite; /* Simple bounce animation */
}

/* Bounce animation */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Content inside the confirmation section */
.confirmation-content h2 {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn-danger {
  background-color: #B00101;
  color: whitesmoke;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
}

.btn-danger i {
  margin-right: 5px;
}

.btn-secondary {
  background-color: #6c757d;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.btn-secondary i {
  margin-right: 5px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ff4d4d;
}

.btn-primary i {
  margin-right: 5px;
}
</style>
