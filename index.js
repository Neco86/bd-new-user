const fs = require("fs");
const path = require("path");
const https = require("https");

const getBdCookie = () => {
    return new Promise((resolve, reject) => {
        https
            .get("https://www.baidu.com/", (res) => {
                const cookie = res.headers["set-cookie"]
                    .map((str) => str.split(";")[0])
                    .find((cookie) => /^BAIDUID=/.test(cookie));
                resolve(cookie || "");
            })
            .on("error", (err) => {
                reject(err);
            });
    });
};

exports.server = (server, options) => {
    server.on("request", (req, res) => {
        const url = req.url;
        const { ruleValue } = req.originalReq;
        if (ruleValue && new RegExp(ruleValue).test(url)) {
            getBdCookie().then((cookie) => {
                fs.writeFileSync(
                    path.join(__dirname, "headers.txt"),
                    `Cookie: ${cookie}`
                );
                req.passThrough();
            });
        } else {
            req.passThrough();
        }
    });
};
