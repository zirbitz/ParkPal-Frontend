import { jwtDecode } from 'jwt-decode';
// Helper function to get a specific cookie by name

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export function isAuthenticated() {
    const token = getCookie('token'); // Retrieve JWT from cookies
    if (!token) return false;

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if the token is expired
        if (decodedToken.exp < currentTime) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

export function isAdmin() {
    const token = getCookie('token'); // Retrieve JWT from cookies
    if (!token) return false;

    try {
        const decodedToken = jwtDecode(token);

        // Check if 'role' is an array and includes 'ADMIN'
        return decodedToken.role && Array.isArray(decodedToken.role) &&
            decodedToken.role.some(authority => authority === 'ADMIN');
    } catch (error) {
        return false;
    }
}
