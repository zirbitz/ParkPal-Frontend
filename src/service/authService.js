import axios from 'axios';

export async function fetchUserData() {
    try {
        const response = await axios.get('http://localhost:8080/auth/me', {
            withCredentials: true,
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export async function isAuthenticated() {
    const userData = await fetchUserData();
    return userData !== null;
}

export async function isAdmin() {
    const userData = await fetchUserData();

    // Check if the user has the 'ADMIN' role as a string
    if (userData && userData.role) {
        return userData.role === 'ADMIN';
    }
    return false;
}
