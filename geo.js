import { fetchJson } from "./net.js";

export async function getLocation() {
    log("Getting location");
    try {
        const json = await fetchJson('https://ipwho.is');

        if (!json.success)
            throw new Error('ipwho.is returned an error');

        const pos = {
            lat: json.latitude,
            lon: json.longitude,
            city: json.city,
            country: json.country,
        };
        return pos;
    } catch (e) {
        logError(e, 'Failed to fetch geolocation');
        return null;
    }
}
