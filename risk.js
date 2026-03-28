import { fetchJson, fetchJsonWithRetry } from "./net.js";

export async function getRisk(lat, lon, lang) {
    log('Fetching risk from API');
    try {
        const url = `https://api.msb.se/brandrisk/v2/CurrentRisk/${lang}/${lat}/${lon}`;
        log("-------------------------------------------");
        log(url);

        const json = await fetchJsonWithRetry(url);

        if (!json || !json.forecast)
            throw new Error('Risk API returned an error');

        const risk = {
            date: json.forecast.date,
            issuedDate: json.forecast.issuedDate,
            risk: json.forecast.riskIndex,
            riskMessage: json.forecast.riskMessage,
        };

        log("-------------------------------------------");
        log(risk);


        return risk;
    } catch (e) {
        logError(e, 'Failed to fetch risk');
        return null;
    }
}