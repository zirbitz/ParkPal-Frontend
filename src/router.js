import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, isAdmin } from '@/service/authService';

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
        component: Logout,
        meta: { requiresAuth: true },
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
router.beforeEach((to, from, next) => {
    // Check if the route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isAuthenticated()) {
            next('/login'); // Redirect to login if not authenticated
        } else {
            // If the route requires admin privileges
            if (to.matched.some((record) => record.meta.requiresAdmin)) {
                if (isAdmin()) {
                    next('/adminDashboard');
                } else {
                    next('/'); // Redirect non-admins to home or show an error
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
