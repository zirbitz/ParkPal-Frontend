// src/services/CountryService.js
import axios from 'axios';
import {API_ROUTES} from "@/apiRoutes.js";

export default {
    async getCountries() {
        try {
            const response = await axios.get(API_ROUTES.COUNTRIES);
            return response.data.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch countries:', error);
            return [];
        }
    }
};