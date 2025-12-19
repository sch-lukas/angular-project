import https from 'node:https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const query = `query Buecher($page:Int,$size:Int){buecher(page:$page,size:$size){content{id} page{size number totalElements totalPages}}}`;

const data = JSON.stringify({ query, variables: { page: 1, size: 10 } });

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
    rejectUnauthorized: false,
};

const req = https.request('https://localhost:3000/graphql', options, (res) => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log(JSON.stringify(json, null, 2));
        } catch (err) {
            console.error('Response parse error:', err, '\nBody:', body);
            process.exit(1);
        }
    });
});

req.on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
});

req.write(data);
req.end();
