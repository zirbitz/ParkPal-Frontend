import axios from 'axios';
import {API_ROUTES} from "@/apiRoutes.js";

export async function fetchUserData() {
    try {
        const response = await axios.get(API_ROUTES.AUTH_ME, {
            withCredentials: true,
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export async function login(username, password) {
    try {
        const loginData = {
            username,
            password
        }
        const response = await axios.post(API_ROUTES.AUTH_LOGIN, loginData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function logout() {
    try {
        await axios.post(API_ROUTES.AUTH_LOGOUT, '', {
            withCredentials: true,
        });
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}
/*
export async function refreshToken() {
    try {
        const response = await axios.post(API_ROUTES.AUTH_REFRESH, '', {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}
 */

export async function isAuthenticated(userData) {
    return userData !== null;
}

export async function isAdmin(userData) {
    return userData && userData.role === 'ADMIN';
}
