// src/store/index.js
import {createStore} from 'vuex';
import {fetchUserIdAndRole, isAdmin, isAuthenticated, login, logout} from '@/service/authService';


const store = createStore({
    state: {
        isAuthenticated: false,
        isAdmin: false,
        userId: null,
        userRole: null,
    },
    mutations: {
        setAuth(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        setAdmin(state, isAdmin) {
            state.isAdmin = isAdmin;
        },
        setUserId(state, userId) {
            state.userId = userId;
        },
        setUserRole(state, userRole) {
            state.userRole = userRole;
        },
    },
    actions: {
        async checkAuth({ commit }) {
            const userData = await fetchUserIdAndRole();
            const authStatus = await isAuthenticated(userData);
            commit('setAuth', authStatus);
            if (authStatus) {
                const adminStatus = await isAdmin(userData);
                commit('setAdmin', adminStatus);
                commit('setUserId', userData.id);
                commit('setUserRole', userData.role);
            }
        },
        async login({ dispatch }, { username, password }) {
            await login(username, password);
            await dispatch('checkAuth');
        },
        async logout({ commit }) {
            await logout();
            commit('setAuth', false);
            commit('setAdmin', false);
            commit('setUserId', null);
            commit('setUserRole', null);
        },
    },
});

export default store;