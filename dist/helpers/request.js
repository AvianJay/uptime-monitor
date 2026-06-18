"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.curl = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const environment_1 = require("./environment");
const parseHeaders = (headers = []) => headers.reduce((result, header) => {
    const separatorIndex = header.indexOf(":");
    if (separatorIndex === -1)
        return result;
    const name = header.substring(0, separatorIndex).trim();
    const value = (0, environment_1.replaceEnvironmentVariables)(header.substring(separatorIndex + 1).trimStart());
    if (name)
        result[name] = value;
    return result;
}, {});
const curl = (site) => {
    const url = (0, environment_1.replaceEnvironmentVariables)(site.url);
    const method = site.method || "GET";
    const maxRedirects = Number.isInteger(site.maxRedirects) ? Number(site.maxRedirects) : 3;
    const headers = parseHeaders(site.headers);
    const shouldDisableTlsVerification = site.__dangerous__insecure ||
        site.__dangerous__disable_verify_peer ||
        site.__dangerous__disable_verify_host;
    const config = {
        url,
        method: method,
        data: site.body ? (0, environment_1.replaceEnvironmentVariables)(site.body) : undefined,
        headers: {
            ...headers,
            "User-Agent": headers["User-Agent"] || headers["user-agent"] || "upptime.js.org",
        },
        maxRedirects,
        timeout: 30000,
        responseType: "text",
        transformResponse: [(data) => data],
        validateStatus: () => true,
        httpsAgent: shouldDisableTlsVerification
            ? new https_1.default.Agent({ rejectUnauthorized: false })
            : undefined,
    };
    if (site.verbose) {
        console.log("HTTP request", {
            url,
            method,
            maxRedirects,
            insecure: Boolean(shouldDisableTlsVerification),
        });
    }
    const startedAt = performance.now();
    return (0, axios_1.default)(config)
        .then((response) => {
        const totalTime = (performance.now() - startedAt) / 1000;
        const data = typeof response.data === "string"
            ? response.data
            : response.data === undefined || response.data === null
                ? ""
                : String(response.data);
        if (site.verbose) {
            console.log("HTTP response", {
                url,
                status: response.status,
                totalTime,
            });
        }
        return { httpCode: Number(response.status), totalTime, data };
    })
        .catch((error) => {
        console.log("Got an error (axios)", error);
        return { httpCode: 0, totalTime: 0, data: "" };
    });
};
exports.curl = curl;
//# sourceMappingURL=request.js.map