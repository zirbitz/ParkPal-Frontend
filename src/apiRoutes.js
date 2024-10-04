const BASE_URL = 'http://localhost:8080';

export const API_ROUTES = {
    AUTH: `${BASE_URL}/auth`,
    AUTH_ME: `${BASE_URL}/auth/me`,
    AUTH_LOGIN: `${BASE_URL}/auth/login`,
    AUTH_LOGOUT: `${BASE_URL}/auth/logout`,
    AUTH_REFRESH: `${BASE_URL}/auth/refresh`,
    AUTH_REGISTER: `${BASE_URL}/auth/register`,
    ADMINS: `${BASE_URL}/admins`,
    ADMINS_UPDATE_STATUS: buildAdminUpdateStatusUrl,
    ADMINS_DELETE: (userId) => `${BASE_URL}/admins/${userId}`,
    COUNTRIES: `${BASE_URL}/countries`,
    COUNTRIES_BY_ID: (countryId) => `${BASE_URL}/countries/${countryId}`,
    COUNTRIES_UPDATE: (countryId) => `${BASE_URL}/countries/${countryId}`,
    COUNTRIES_DELETE: (countryId) => `${BASE_URL}/countries/${countryId}`,
    EVENTS_WITH_OPTIONAL_PARAMS: buildEventsUrl,
    EVENTS_BY_ID: (eventId) => `${BASE_URL}/events/${eventId}`,
    EVENTTAGS: buildEventTagsUrl,
    EVENTTAGS_BY_ID: (eventTagId) => `${BASE_URL}/event-tags/${eventTagId}`,
    FILES: buildFilesUrl,
    FILES_BY_EXTERNAL_ID: (externalId) => `${BASE_URL}/files/${externalId}`,
    PARKS: `${BASE_URL}/parks`,
    PARKS_BY_ID: (parkId) => `${BASE_URL}/parks/${parkId}`,
    USERS: `${BASE_URL}/users`,
    USERS_BY_ID: (userId) => `${BASE_URL}/users/${userId}`,


    // Add other routes here
};


function buildAdminUpdateStatusUrl(userId, locked, role) {
    let url = `${BASE_URL}/admins/${userId}/status?`;
    if (locked !== undefined && locked !== '') {
        url += `locked=${locked}&`;
    }
    if (role !== undefined && role !== '') {
        url += `role=${role}`;
    }
    return url.endsWith('&') ? url.slice(0, -1) : url;
}

function buildEventsUrl(userId, parkId) {
    let url = `${BASE_URL}/events?`;
    if (userId !== undefined && userId !== '') {
        url += `userId=${userId}&`;
    }
    if (parkId !== undefined && parkId !== '') {
        url += `parkId=${parkId}`;
    }
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    console.log("url: ", url);
    return url;
}

function buildEventTagsUrl(eventId) {
    let url = `${BASE_URL}/event-tags?`;
    if (eventId !== undefined && eventId !== '') {
        url += `eventId=${eventId}`;
    }
    return url.endsWith('?') ? url.slice(0, -1) : url;
}

function buildFilesUrl(eventId, parkId, userId) {
    let url = `${BASE_URL}/files?`;
    if (eventId !== undefined && eventId !== '') {
        url += `eventId=${eventId}&`;
    }
    if (parkId !== undefined && parkId !== '') {
        url += `parkId=${parkId}&`;
    }
    if (userId !== undefined && userId !== '') {
        url += `userId=${userId}`;
    }
    return url.endsWith('&') ? url.slice(0, -1) : url;
}