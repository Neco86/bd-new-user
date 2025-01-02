const https = require("https");

const createBdNewUser = () => {
    return new Promise((resolve) => {
        https
            .get("https://www.baidu.com/", (res) => {
                const cookie =
                    res.headers["set-cookie"]
                        .map((str) => str.split(";")[0])
                        .find((cookie) => /^BAIDUID=/.test(cookie)) || "";
                globalThis.BD_NEW_USER = cookie;
                resolve(cookie);
            })
            .on("error", () => {
                resolve("");
            });
    });
}

const getBdNewUser = () => {
    return Promise.resolve(globalThis.BD_NEW_USER || '');
};

exports.rulesServer = (server) => {
    server.on("request", (req, res) => {
        const url = req.url;
        const { ruleValue } = req.originalReq;

        const getCookie = (ruleValue && new RegExp(ruleValue).test(url))
            ? createBdNewUser
            : getBdNewUser;

        getCookie().then(cookie => {
            if (cookie) {
                const rule = [
                    '\`\`\`reqHeaders',
                    `Cookie: ${cookie}`,
                    '\`\`\`',
                    '\`\`\`resHeaders',
                    `Bd-New-User: ${cookie}`,
                    '\`\`\`',
                    '* reqHeaders://{reqHeaders} resHeaders://{resHeaders}',
                ].join('\n');
                res.end(rule);
            }
            else {
                res.end('');
            }
        });
    });
};
