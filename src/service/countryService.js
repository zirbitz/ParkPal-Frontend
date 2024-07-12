// src/services/CountryService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/'; // Change to your actual API URL

export default {
    async getCountries() {
        try {
            const response = await axios.get(`${API_URL}countries`);
            return response.data.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch countries:', error);
            return [];
        }
    }
};