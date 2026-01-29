// Shim to use native fetch instead of node-fetch in Workers
// oxlint-disable-next-line import/no-default-export
export default fetch;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
