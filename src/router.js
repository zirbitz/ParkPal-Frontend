import { createRouter, createWebHistory}  from "vue-router";
import CreateEvent from "@/components/event/CreateEvent.vue";
import EventOverView from "@/components/event/EventOverView.vue";
import Home from "@/components/Home.vue";
import Login from "@/components/user/Login.vue";
import ParksOverview from "@/components/park/ParksOverview.vue";
import Register from "@/components/user/Register.vue";
import Faq from "@/components/info/Faq.vue";


const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/createEvent",
        name: "CreateEvent",
        component: CreateEvent
    },
    {
        path: "/eventOverview",
        name: "EventOverview",
        component: EventOverView
    },
    {
        path: "/login",
        name: "Login",
        component: Login
    },
    {
        path: "/parksoverview",
        name: "ParksOverview",
        component: ParksOverview
    },
    {
        path: "/register",
        name: "Register",
        component: Register
    },
    {
        path: "/faq",
        name: "Fag",
        component: Faq
    }
    // add more routes here
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;