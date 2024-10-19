// src/store/index.js
import {createStore} from 'vuex';
import {fetchUserData, isAdmin, isAuthenticated, login, logout} from '@/service/authService';

const store = createStore({
    state: {
        isAuthenticated: false,
        isAdmin: false,
    },
    mutations: {
        setAuth(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        setAdmin(state, isAdmin) {
            state.isAdmin = isAdmin;
        },
        setExpiresAt(state, expiresAt) {
            state.expiresAt = expiresAt;
        }
    },
    actions: {
        async checkAuth({ commit }) {
            const userData = await fetchUserData();
            const authStatus = isAuthenticated(userData);
            commit('setAuth', authStatus);
            if (authStatus) {
                const adminStatus = isAdmin(userData);
                commit('setAdmin', adminStatus);
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
        },
    },
});

/*
function setLogoutTimer(expiresAt) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = expiresAt - currentTime;
    console.log('Token expires in', timeUntilExpiration, 'seconds');

    if (timeUntilExpiration > 0) {
        setTimeout(() => {
            store.dispatch('logout');
        }, timeUntilExpiration * 1000);
    }
}

 */

export default store;