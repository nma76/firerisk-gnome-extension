import { fetchJson, fetchJsonWithRetry } from "./net.js";

export async function getFireBan(lat, lon, lang) {
    log('Fetching fire ban from API');
    try {
        const url = `https://api.msb.se/brandrisk/v2/FireProhibition/${lang}/${lat}/${lon}`;
        const json = await fetchJsonWithRetry(url);

        if (!json || !json.fireProhibition)
            throw new Error('Risk API returned an error');

        const ban = {
            status: json.fireProhibition.status,
            statusMessage: json.fireProhibition.statusMessage,
            authority: json.fireProhibition.authority,
        };

        return ban;
    } catch (e) {
        logError(e, 'Failed to fetch fire ban');
        return null;
    }
}