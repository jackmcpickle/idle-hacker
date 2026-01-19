// Shim to use native fetch instead of node-fetch in Workers
export default fetch;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
