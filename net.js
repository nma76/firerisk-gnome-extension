import Soup from 'gi://Soup';

const session = new Soup.Session();
session.user_agent = 'gnome-shell-extension';

export async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const message = Soup.Message.new('GET', url);

        // Vissa endpoints kräver detta i Soup 3
        message.request_headers.append('Accept', 'application/json');

        session.send_and_read_async(message, 0, null, (obj, res) => {
            try {
                const bytes = session.send_and_read_finish(res);
                const data = bytes.get_data();

                if (!data || data.length === 0) {
                    reject(new Error('Empty response body'));
                    return;
                }

                // resolve(JSON.parse(data));
                resolve(JSON.parse(new TextDecoder().decode(data)));
            } catch (e) {
                reject(e);
            }
        });
    });
}

export async function fetchJsonWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fetchJson(url);
        } catch (e) {
            if (i === retries - 1)
                throw e;

            await new Promise(r => setTimeout(r, 200));
        }
    }
}