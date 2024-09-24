import axios from 'axios';

export async function fetchUserData() {
    try {
        // Make a request to the backend to get user data
        // The browser will automatically include the HttpOnly cookie in the request
        const response = await axios.get('http://localhost:8080/auth/me', {
            withCredentials: true,
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null; // Return null if there's any error (e.g., unauthorized)
    }
}

export async function isAuthenticated() {
    const userData = await fetchUserData();
    //TODO: Add validation logic here.
    // If user data is fetched, the user is authenticated
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
