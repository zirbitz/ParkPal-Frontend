import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, isAdmin } from '@/service/authService.js';

// Import your components
import CreateEvent from '@/components/event/CreateEvent.vue';
import EventOverView from '@/components/event/EventOverView.vue';
import Home from '@/components/Home.vue';
import Login from '@/components/user/Login.vue';
import ParksOverview from '@/components/park/ParksOverview.vue';
import Register from '@/components/user/Register.vue';
import Logout from '@/components/user/Logout.vue';
import Faq from '@/components/info/Faq.vue';
import EventFilter from '@/components/event/EventFilter.vue';
import UserDashboard from '@/components/user/UserDashboard.vue';
import Impressum from '@/components/Impressum.vue';
import AdminDashboard from '@/components/admin/AdminDashboard.vue';

// Routes configuration
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/createEvent',
        name: 'CreateEvent',
        component: CreateEvent,
        meta: { requiresAuth: true },
    },
    {
        path: '/eventOverview',
        name: 'EventOverview',
        component: EventOverView,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/parksoverview',
        name: 'ParksOverview',
        component: ParksOverview,
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path: '/logout',
        name: 'Logout',
        meta: { requiresAuth: true },
        component: Logout,
    },
    {
        path: '/faq',
        name: 'Faq',
        component: Faq,
    },
    {
        path: '/eventFilter',
        name: 'EventFilter',
        component: EventFilter,
    },
    {
        path: '/userDashboard',
        name: 'UserDashboard',
        component: UserDashboard,
        meta: { requiresAuth: true },
    },
    {
        path: '/adminDashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
        path: '/impressum',
        name: 'Impressum',
        component: Impressum,
    },
];

// Create the router instance
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
    // Check if the route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        const authenticated = await isAuthenticated(); // Wait for the authentication check
        if (!authenticated) {
           next('/login'); // Redirect to login if not authenticated
        } else {
            // Check if the route requires admin privileges
            if (to.matched.some((record) => record.meta.requiresAdmin)) {
                const admin = await isAdmin(); // Wait for the admin check
                if (admin) {
                    next(); // Proceed to the admin route
                } else {
                    next('/'); // Redirect non-admins to home
                }
            } else {
                next(); // If no admin check is needed, proceed normally
            }
        }
    } else {
        next(); // Proceed normally if no auth is required
    }
});

export default router;
