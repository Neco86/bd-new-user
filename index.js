const https = require("https");

const getCookie = (generateNew) => {
    if (generateNew) {
        return new Promise((resolve, reject) => {
            https
                .get("https://www.baidu.com/", (res) => {
                    const cookie =
                        res.headers["set-cookie"]
                            .map((str) => str.split(";")[0])
                            .find((cookie) => /^BAIDUID=/.test(cookie)) || "";
                    globalThis.BD_NEW_USER = cookie;
                    resolve(cookie);
                })
                .on("error", (err) => {
                    reject(err);
                });
        });
    } else if (globalThis.BD_NEW_USER) {
        return Promise.resolve(globalThis.BD_NEW_USER);
    }
    return getCookie(true);
};

exports.rulesServer = (server) => {
    server.on("request", (req, res) => {
        const url = req.url;
        const { ruleValue } = req.originalReq;

        getCookie(ruleValue && new RegExp(ruleValue).test(url)).then(
            (cookie) => {
                const rule = `
            \`\`\`reqHeaders
            Cookie: ${cookie}
            \`\`\`
            \`\`\`resHeaders
            Bd-New-User: ${cookie}
            \`\`\`
            * reqHeaders://{reqHeaders} resHeaders://{resHeaders}
            `;
                res.end(rule);
            }
        );
    });
};
