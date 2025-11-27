import https from 'node:https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function fetchPage(page, size = 10) {
    const query = `query Buecher($page:Int,$size:Int){buecher(page:$page,size:$size){content{id} page{size number totalElements totalPages}}}`;
    const data = JSON.stringify({ query, variables: { page, size } });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        },
        rejectUnauthorized: false,
    };

    return new Promise((resolve, reject) => {
        const req = https.request(
            'https://localhost:3000/graphql',
            options,
            (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => (body += chunk));
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (err) {
                        reject(
                            new Error(
                                `Response parse error: ${err} - Body: ${body}`,
                            ),
                        );
                    }
                });
            },
        );
        req.on('error', (err) => reject(err));
        req.write(data);
        req.end();
    });
}

(async () => {
    try {
        for (let p = 1; p <= 6; p++) {
            const res = await fetchPage(p, 10);
            const b = res.data?.buecher;
            console.log(
                `Page ${p} -> items=${b?.content?.length ?? 0}, page.number=${b?.page?.number}, totalElements=${b?.page?.totalElements}, totalPages=${b?.page?.totalPages}`,
            );
        }
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
