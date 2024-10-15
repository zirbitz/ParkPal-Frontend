import {createRouter, createWebHistory} from 'vue-router';
import {isAdmin, isAuthenticated} from '@/service/authService.js';

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
import PictureViewer from "@/components/PictureViewer.vue";
import UpdateEvent from '@/components/event/EditEvent.vue';
import CreatePark from "@/components/park/CreatePark.vue";
import EditPark from "@/components/park/EditPark.vue";


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
        path: '/createpark',
        name: 'CreatePark',
        component: CreatePark,
        meta: { requiresAdmin: true},
    },
    {
        path: '/editpark',
        name: 'EditPark',
        component: EditPark,
        meta: { requiresAdmin: true},
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path: '/logout',
        name: 'Logout',
        meta: { requiresAuth: true},
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
        meta: { requiresAdmin: true },
    },
    {
        path: '/impressum',
        name: 'Impressum',
        component: Impressum,
    },
    {
        path: '/picture/:externalId',
        name: 'PictureViewer',
        component: PictureViewer,
        props: true,
    },
    {
        path: '/editEvent/:eventId',
        name: 'EditEvent',
        component: UpdateEvent,
        props: true,
        meta: { requiresAuth: true },
    }
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
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return next({ name: 'Login' });
        }
    }

    // Check if the route requires admin privileges
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
        const admin = await isAdmin();
        if (!admin) {
            return next({ name: 'Home' });
        }
    }

    // Allow navigation
    next();
});

export default router;
