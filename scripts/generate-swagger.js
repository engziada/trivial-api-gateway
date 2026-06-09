import fs from "fs";

const swagger = {
  openapi: "3.0.0",
  info: {
    title: "Trivial API Gateway",
    version: "1.0.0",
    description: "A collection of 20 trivial utility APIs."
  },
  servers: [
    { url: "/api/v1", description: "Standard REST API" }
  ],
  paths: {
    "/totp/generate": { get: { summary: "Generate TOTP", parameters: [{ name: "secret", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/totp/validate": { get: { summary: "Validate TOTP", parameters: [{ name: "secret", in: "query", required: true, schema: { type: "string" } }, { name: "token", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/email/checkDisposable": { get: { summary: "Check Disposable Email", parameters: [{ name: "email", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/qrcode/generate": { get: { summary: "Generate QR Code", parameters: [{ name: "text", in: "query", required: true, schema: { type: "string" } }, { name: "size", in: "query", schema: { type: "string" } }, { name: "color", in: "query", schema: { type: "string" } }, { name: "bgColor", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/geo/getIPInfo": { get: { summary: "Get IP Geolocation", parameters: [{ name: "ip", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/workingDays/calculate": { get: { summary: "Calculate Working Days", parameters: [{ name: "startDate", in: "query", required: true, schema: { type: "string" } }, { name: "endDate", in: "query", required: true, schema: { type: "string" } }, { name: "holidays", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/password/strength": { get: { summary: "Evaluate Password Strength", parameters: [{ name: "password", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/units/convert": { get: { summary: "Convert Units", parameters: [{ name: "value", in: "query", required: true, schema: { type: "string" } }, { name: "fromUnit", in: "query", required: true, schema: { type: "string" } }, { name: "toUnit", in: "query", required: true, schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/currency/convert": { get: { summary: "Convert Currency", parameters: [{ name: "amount", in: "query", required: true, schema: { type: "string" } }, { name: "fromCurrency", in: "query", required: true, schema: { type: "string" } }, { name: "toCurrency", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/text/caseConvert": { get: { summary: "Convert Text Case", parameters: [{ name: "text", in: "query", required: true, schema: { type: "string" } }, { name: "format", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/text/base64Encode": { get: { summary: "Encode Base64", parameters: [{ name: "text", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/text/base64Decode": { get: { summary: "Decode Base64", parameters: [{ name: "encoded", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/text/filterProfanity": { get: { summary: "Filter Profanity", parameters: [{ name: "text", in: "query", required: true, schema: { type: "string" } }, { name: "censor", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/generateUUID": { get: { summary: "Generate UUID", responses: { "200": { description: "Success" } } } },
    "/dev/generateCUID": { get: { summary: "Generate CUID", responses: { "200": { description: "Success" } } } },
    "/dev/loremIpsum": { get: { summary: "Generate Lorem Ipsum", parameters: [{ name: "wordCount", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/jsonToCSV": { post: { summary: "JSON to CSV", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { json: { type: "array", items: { type: "object" } } } } } } }, responses: { "200": { description: "Success" } } } },
    "/dev/colorPalette": { get: { summary: "Generate Color Palette", parameters: [{ name: "hex", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/gravatarURL": { get: { summary: "Get Gravatar URL", parameters: [{ name: "email", in: "query", required: true, schema: { type: "string" } }, { name: "size", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/placeholderImage": { get: { summary: "Get Placeholder Image URL", parameters: [{ name: "width", in: "query", required: true, schema: { type: "string" } }, { name: "height", in: "query", required: true, schema: { type: "string" } }, { name: "bgColor", in: "query", schema: { type: "string" } }, { name: "text", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/morseEncode": { get: { summary: "Encode Morse", parameters: [{ name: "text", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/morseDecode": { get: { summary: "Decode Morse", parameters: [{ name: "morse", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/calculateBMI": { get: { summary: "Calculate BMI", parameters: [{ name: "weight", in: "query", required: true, schema: { type: "string" } }, { name: "height", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } },
    "/dev/parseUserAgent": { get: { summary: "Parse User Agent", parameters: [{ name: "userAgent", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } } }
  }
};

fs.writeFileSync("swagger.json", JSON.stringify(swagger, null, 2));
console.log("swagger.json generated!");
