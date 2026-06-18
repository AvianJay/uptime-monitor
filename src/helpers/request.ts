import axios, { AxiosRequestConfig } from "axios";
import https from "https";
import { UpptimeConfig } from "../interfaces";
import { replaceEnvironmentVariables } from "./environment";

const parseHeaders = (headers: string[] = []) =>
  headers.reduce((result, header) => {
    const separatorIndex = header.indexOf(":");
    if (separatorIndex === -1) return result;

    const name = header.substring(0, separatorIndex).trim();
    const value = replaceEnvironmentVariables(header.substring(separatorIndex + 1).trimStart());

    if (name) result[name] = value;
    return result;
  }, {} as Record<string, string>);

export const curl = (
  site: UpptimeConfig["sites"][0]
): Promise<{ httpCode: number; totalTime: number; data: string }> => {
  const url = replaceEnvironmentVariables(site.url);
  const method = site.method || "GET";
  const maxRedirects = Number.isInteger(site.maxRedirects) ? Number(site.maxRedirects) : 3;
  const headers = parseHeaders(site.headers);
  const shouldDisableTlsVerification =
    site.__dangerous__insecure ||
    site.__dangerous__disable_verify_peer ||
    site.__dangerous__disable_verify_host;

  const config: AxiosRequestConfig = {
    url,
    method: method as AxiosRequestConfig["method"],
    data: site.body ? replaceEnvironmentVariables(site.body) : undefined,
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
      ? new https.Agent({ rejectUnauthorized: false })
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

  return axios(config)
    .then((response) => {
      const totalTime = (performance.now() - startedAt) / 1000;
      const data =
        typeof response.data === "string"
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
