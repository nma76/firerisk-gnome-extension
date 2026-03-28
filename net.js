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

export async function fetchJsonWithRetry(url) {
    return new Promise((resolve, reject) => {
        const session = new Soup.Session();
        session.user_agent = 'gnome-shell-extension';

        const message = Soup.Message.new('GET', url);
        message.request_headers.append('Accept', 'application/json');

        session.send_and_read_async(message, 0, null, (obj, res) => {
            try {
                const bytes = session.send_and_read_finish(res);

                // Kontrollera HTTP-status
                if (message.status_code !== 200) {
                    reject(new Error(`HTTP ${message.status_code}`));
                    return;
                }

                const data = bytes.get_data();

                // Om tomt svar → retry en gång
                if (!data || data.length === 0) {
                    log("Empty response, retrying...");
                    session.send_and_read_async(message, 0, null, (obj2, res2) => {
                        try {
                            const bytes2 = session.send_and_read_finish(res2);
                            const data2 = bytes2.get_data();

                            if (!data2 || data2.length === 0) {
                                reject(new Error('Empty response body'));
                                return;
                            }

                            resolve(JSON.parse(data2));
                        } catch (e2) {
                            reject(e2);
                        }
                    });
                    return;
                }

                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
}