import Soup from 'gi://Soup';

export async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const session = new Soup.Session();

        // Viktigt i Soup 3
        session.user_agent = 'gnome-shell-extension';

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

                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
}