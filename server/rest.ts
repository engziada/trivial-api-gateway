import express from "express";
import * as api from "./utils/apiImplementations";

export const restRouter = express.Router();

restRouter.get("/totp/generate", (req, res) => {
  try {
    const { secret } = req.query;
    if (!secret || typeof secret !== "string") throw new Error("Missing or invalid 'secret' query parameter");
    res.json({ success: true, data: { token: api.generateTOTP(secret) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/totp/validate", (req, res) => {
  try {
    const { secret, token } = req.query;
    if (!secret || typeof secret !== "string" || !token || typeof token !== "string") {
      throw new Error("Missing 'secret' or 'token' query parameters");
    }
    res.json({ success: true, data: { valid: api.validateTOTP(secret, token) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/email/checkDisposable", (req, res) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") throw new Error("Missing 'email'");
    res.json({ success: true, data: { isDisposable: api.isDisposableEmail(email), email } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/qrcode/generate", async (req, res) => {
  try {
    const { text, size, color, bgColor } = req.query;
    if (!text || typeof text !== "string") throw new Error("Missing 'text'");
    const url = await api.generateQRCode(
      text,
      size ? parseInt(size as string) : 200,
      (color as string) || "000000",
      (bgColor as string) || "FFFFFF"
    );
    res.json({ success: true, data: { url } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/geo/getIPInfo", async (req, res) => {
  try {
    const { ip } = req.query;
    if (!ip || typeof ip !== "string") throw new Error("Missing 'ip'");
    const data = await api.getIPGeoData(ip);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/workingDays/calculate", (req, res) => {
  try {
    const { startDate, endDate, holidays } = req.query;
    if (!startDate || typeof startDate !== "string" || !endDate || typeof endDate !== "string") {
      throw new Error("Missing 'startDate' or 'endDate'");
    }
    let parsedHolidays: string[] | undefined;
    if (holidays && typeof holidays === "string") {
      try { parsedHolidays = JSON.parse(holidays); } catch { parsedHolidays = [holidays]; }
    }
    res.json({ success: true, data: { days: api.calculateWorkingDays(startDate, endDate, parsedHolidays) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/password/strength", (req, res) => {
  try {
    const { password } = req.query;
    if (!password || typeof password !== "string") throw new Error("Missing 'password'");
    res.json({ success: true, data: api.evaluatePasswordStrength(password) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/units/convert", (req, res) => {
  try {
    const { value, fromUnit, toUnit, category } = req.query;
    if (!value || !fromUnit || !toUnit || typeof fromUnit !== "string" || typeof toUnit !== "string") {
      throw new Error("Missing required parameters");
    }
    res.json({ success: true, data: api.convertUnits(parseFloat(value as string), fromUnit, toUnit, (category as string) || "length") });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/currency/convert", async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.query;
    if (!amount || !fromCurrency || !toCurrency || typeof fromCurrency !== "string" || typeof toCurrency !== "string") {
      throw new Error("Missing required parameters");
    }
    const data = await api.convertCurrency(parseFloat(amount as string), fromCurrency, toCurrency);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/text/caseConvert", (req, res) => {
  try {
    const { text, format } = req.query;
    if (typeof text !== "string" || typeof format !== "string") throw new Error("Missing text or format");
    res.json({ success: true, data: { result: api.convertTextCase(text, format as any) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/text/base64Encode", (req, res) => {
  try {
    const { text } = req.query;
    if (typeof text !== "string") throw new Error("Missing text");
    res.json({ success: true, data: { encoded: api.encodeBase64(text) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/text/base64Decode", (req, res) => {
  try {
    const { encoded } = req.query;
    if (typeof encoded !== "string") throw new Error("Missing encoded");
    res.json({ success: true, data: { decoded: api.decodeBase64(encoded) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/text/filterProfanity", (req, res) => {
  try {
    const { text, censor } = req.query;
    if (typeof text !== "string") throw new Error("Missing text");
    res.json({ success: true, data: api.filterProfanity(text, censor !== "false") });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/generateUUID", (req, res) => {
  res.json({ success: true, data: { uuid: api.generateUUID() } });
});

restRouter.get("/dev/generateCUID", (req, res) => {
  res.json({ success: true, data: { cuid: api.generateCUID() } });
});

restRouter.get("/dev/loremIpsum", (req, res) => {
  const { wordCount } = req.query;
  res.json({ success: true, data: { text: api.generateLoremIpsum(wordCount ? parseInt(wordCount as string) : 50) } });
});

restRouter.post("/dev/jsonToCSV", (req, res) => {
  try {
    const { json } = req.body;
    if (!Array.isArray(json)) throw new Error("Body must contain a 'json' array");
    res.json({ success: true, data: { csv: api.jsonToCSV(json) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/colorPalette", (req, res) => {
  try {
    const { hex } = req.query;
    if (typeof hex !== "string") throw new Error("Missing hex");
    res.json({ success: true, data: api.generateColorPalette(hex) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/gravatarURL", (req, res) => {
  try {
    const { email, size } = req.query;
    if (typeof email !== "string") throw new Error("Missing email");
    res.json({ success: true, data: { url: api.getGravatarURL(email, size ? parseInt(size as string) : 200) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/placeholderImage", (req, res) => {
  try {
    const { width, height, bgColor, text } = req.query;
    if (!width || !height) throw new Error("Missing width or height");
    res.json({ success: true, data: { url: api.getPlaceholderImageURL(
      parseInt(width as string),
      parseInt(height as string),
      (bgColor as string) || "cccccc",
      text as string
    ) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/morseEncode", (req, res) => {
  try {
    const { text } = req.query;
    if (typeof text !== "string") throw new Error("Missing text");
    res.json({ success: true, data: { morse: api.textToMorse(text) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/morseDecode", (req, res) => {
  try {
    const { morse } = req.query;
    if (typeof morse !== "string") throw new Error("Missing morse");
    res.json({ success: true, data: { text: api.morseToText(morse) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/calculateBMI", (req, res) => {
  try {
    const { weight, height } = req.query;
    if (!weight || !height) throw new Error("Missing weight or height");
    res.json({ success: true, data: api.calculateBMI(parseFloat(weight as string), parseFloat(height as string)) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/dev/parseUserAgent", (req, res) => {
  try {
    const { userAgent } = req.query;
    if (typeof userAgent !== "string") throw new Error("Missing userAgent");
    res.json({ success: true, data: api.parseUserAgent(userAgent) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/hash/generate", (req, res) => {
  try {
    const { text, algorithm } = req.query;
    if (typeof text !== "string") throw new Error("Missing text");
    res.json({ success: true, data: { hash: api.generateHash(text, (algorithm as any) || "sha256") } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/jwt/encode", (req, res) => {
  try {
    const { payload, secret } = req.body;
    if (!payload || typeof secret !== "string") throw new Error("Missing payload or secret");
    res.json({ success: true, data: { token: api.encodeJWT(payload, secret) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/jwt/decode", (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== "string") throw new Error("Missing token");
    res.json({ success: true, data: api.decodeJWT(token) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/jwt/validate", (req, res) => {
  try {
    const { token, secret } = req.body;
    if (typeof token !== "string" || typeof secret !== "string") throw new Error("Missing token or secret");
    res.json({ success: true, data: { valid: api.validateJWT(token, secret) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/fakeData/generate", (req, res) => {
  try {
    const { type, count } = req.query;
    if (typeof type !== "string") throw new Error("Missing type");
    res.json({ success: true, data: { data: api.generateFakeData(type, count ? parseInt(count as string) : 1) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/markdown/toHTML", (req, res) => {
  try {
    const { markdown } = req.body;
    if (typeof markdown !== "string") throw new Error("Missing markdown");
    res.json({ success: true, data: { html: api.markdownToHTML(markdown) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/html/sanitize", (req, res) => {
  try {
    const { dirty } = req.body;
    if (typeof dirty !== "string") throw new Error("Missing dirty");
    res.json({ success: true, data: { clean: api.sanitizeHTML(dirty) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/cron/parse", (req, res) => {
  try {
    const { expression } = req.query;
    if (typeof expression !== "string") throw new Error("Missing expression");
    res.json({ success: true, data: api.parseCron(expression) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/regex/test", (req, res) => {
  try {
    const { pattern, flags, testString } = req.query;
    if (typeof pattern !== "string") throw new Error("Missing pattern");
    res.json({ success: true, data: api.testRegex(pattern, (flags as string) || "", (testString as string) || "") });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/diff/calculate", (req, res) => {
  try {
    const { textA, textB, type } = req.body;
    if (typeof textA !== "string" || typeof textB !== "string") throw new Error("Missing textA or textB");
    res.json({ success: true, data: api.calculateDiff(textA, textB, (type as any) || "lines") });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.get("/ip/validate", (req, res) => {
  try {
    const { ip } = req.query;
    if (typeof ip !== "string") throw new Error("Missing ip");
    res.json({ success: true, data: api.validateIP(ip) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

restRouter.post("/batch", async (req, res) => {
  try {
    const { requests } = req.body;
    if (!Array.isArray(requests)) throw new Error("Missing requests array");
    const data = await api.batchAPI(requests);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
