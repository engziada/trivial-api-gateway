/**
 * Comprehensive implementations for all 20 trivial utility APIs
 * Each function is self-contained and can be called independently
 */

import * as crypto from "crypto";
import base32Decode from "base32-decode";
import disposableDomains from "disposable-email-domains";
import { Filter } from "bad-words";
import QRCode from "qrcode";
import { UAParser } from "ua-parser-js";
import { LRUCache } from "lru-cache";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { CronExpressionParser } from "cron-parser";
import { diffLines, diffWords } from "diff";

// ============================================================================
// 1. TOTP Generator/Validator (RFC 6238)
// ============================================================================

export function generateTOTP(secret: string): string {
  const decoded = base32Decode(secret.replace(/\s/g, ""), "RFC4648");
  const buffer = Buffer.from(decoded);
  const counter = Math.floor(Date.now() / 30000);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac("sha1", buffer);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    (digest[offset] & 0x7f) << 24 |
    (digest[offset + 1] & 0xff) << 16 |
    (digest[offset + 2] & 0xff) << 8 |
    (digest[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

export function validateTOTP(secret: string, token: string): boolean {
  const current = generateTOTP(secret);
  return current === token;
}

// ============================================================================
// 2. Disposable Email Detector
// ============================================================================

const disposableDomainSet = new Set([
  ...disposableDomains,
  "tempmail.com",
  "guerrillamail.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? disposableDomainSet.has(domain) : false;
}

// ============================================================================
// 3. QR Code Generator (using simple text encoding)
// ============================================================================

export async function generateQRCode(
  text: string,
  size: number = 200,
  color: string = "000000",
  bgColor: string = "FFFFFF"
): Promise<string> {
  if (!text) throw new Error("Missing text input");
  return QRCode.toDataURL(text, {
    width: size,
    color: {
      dark: `#${color}`,
      light: `#${bgColor}`,
    },
    margin: 2,
  });
}

// ============================================================================
// 4. IP to Timezone/Country
// ============================================================================

interface GeoData {
  country: string;
  timezone: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export async function getIPGeoData(ip: string): Promise<GeoData> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,timezone,city,lat,lon`);
    const data = (await response.json()) as {
      country?: string;
      timezone?: string;
      city?: string;
      lat?: number;
      lon?: number;
    };

    return {
      country: data.country || "Unknown",
      timezone: data.timezone || "Unknown",
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return {
      country: "Unknown",
      timezone: "Unknown",
    };
  }
}

// ============================================================================
// 5. Working Days Calculator
// ============================================================================

export function calculateWorkingDays(
  startDate: string,
  endDate: string,
  holidays: string[] = []
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const holidaySet = new Set(holidays.map((h) => new Date(h).toDateString()));

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(current.toDateString())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// ============================================================================
// 6. Password Strength Meter
// ============================================================================

interface PasswordStrength {
  score: number;
  strength: "very weak" | "weak" | "fair" | "good" | "strong" | "very strong";
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

  if (password.length < 8) feedback.push("Use at least 8 characters");
  if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters");
  if (!/[0-9]/.test(password)) feedback.push("Add numbers");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    feedback.push("Add special characters");

  let strength: PasswordStrength["strength"];
  if (score < 20) strength = "very weak";
  else if (score < 40) strength = "weak";
  else if (score < 60) strength = "fair";
  else if (score < 80) strength = "good";
  else if (score < 100) strength = "strong";
  else strength = "very strong";

  return { score: Math.min(score, 100), strength, feedback };
}

// ============================================================================
// 7. Unit Converter
// ============================================================================

interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  result: number;
}

const unitConversions: Record<string, Record<string, number>> = {
  length: {
    m: 1, km: 0.001, cm: 100, mm: 1000, um: 1e6, nm: 1e9,
    mi: 0.000621371, yd: 1.09361, ft: 3.28084, in: 39.3701,
    nmi: 0.000539957, ly: 1.057e-16,
  },
  weight: {
    kg: 1, g: 1000, mg: 1e6, ug: 1e9, lb: 2.20462, oz: 35.274,
    st: 0.157473, t: 0.001, gr: 15432.4, ct: 5000,
  },
  area: {
    "m2": 1, "km2": 1e-6, "cm2": 1e4, "mm2": 1e6, ha: 1e-4, acre: 0.000247105,
    "ft2": 10.7639, "in2": 1550, "yd2": 1.19599, "mi2": 3.861e-7,
  },
  volume: {
    l: 1, ml: 1000, "m3": 0.001, "cm3": 1000, gal: 0.264172, qt: 1.05669,
    pt: 2.11338, cup: 4.22675, fl_oz: 33.8141, "ft3": 0.0353147, "in3": 61.0237,
  },
  speed: {
    "m/s": 1, "km/h": 3.6, "mph": 2.23694, "ft/s": 3.28084, knot: 1.94384, mach: 0.00293858,
  },
  time: {
    s: 1, min: 1 / 60, h: 1 / 3600, d: 1 / 86400, wk: 1 / 604800,
    mo: 1 / 2.628e6, yr: 1 / 3.154e7, ms: 1000, us: 1e6, ns: 1e9,
  },
  pressure: {
    pa: 1, kpa: 0.001, bar: 1e-5, mbar: 0.01, psi: 0.000145038, atm: 9.8692e-6, torr: 0.00750062,
  },
  energy: {
    j: 1, kj: 0.001, cal: 0.239006, kcal: 0.000239006, wh: 0.000277778, kwh: 2.77778e-7,
    ev: 6.242e18, btu: 0.000947817,
  },
  data: {
    b: 1, kb: 1 / 1024, mb: 1 / 1048576, gb: 1 / 1073741824, tb: 1 / 1099511627776,
    kib: 1 / 1024, mib: 1 / 1048576, gib: 1 / 1073741824, tib: 1 / 1099511627776,
  },
};

export function convertUnits(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string = "length"
): ConversionResult {
  const conversions = unitConversions[category];
  if (!conversions || !conversions[fromUnit] || !conversions[toUnit]) {
    throw new Error(`Invalid unit conversion: ${fromUnit} to ${toUnit} in ${category}`);
  }

  const baseValue = value / (conversions[fromUnit] as number);
  const result = baseValue * (conversions[toUnit] as number);

  return {
    value,
    fromUnit,
    toUnit,
    result: Math.round(result * 10000) / 10000,
  };
}

export function convertTemperature(
  value: number,
  fromUnit: "c" | "f" | "k",
  toUnit: "c" | "f" | "k"
): ConversionResult {
  let celsius = value;

  if (fromUnit === "f") celsius = ((value - 32) * 5) / 9;
  else if (fromUnit === "k") celsius = value - 273.15;

  let result = celsius;
  if (toUnit === "f") result = (celsius * 9) / 5 + 32;
  else if (toUnit === "k") result = celsius + 273.15;

  return {
    value,
    fromUnit,
    toUnit,
    result: Math.round(result * 100) / 100,
  };
}

// ============================================================================
// 8. Currency Converter (using fixed rates for demo)
// ============================================================================

interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  result: number;
}

const fallbackRates: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.52,
  CAD: 1.36, CHF: 0.88, CNY: 7.24, INR: 83.12, MXN: 17.05,
};

const rateCache = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

async function fetchRate(from: string, to: string): Promise<number> {
  const cacheKey = `${from}-${to}`;
  const cached = rateCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );
    if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
    const data = await res.json();
    const rate = data.rates[to] as number;
    if (typeof rate !== "number") throw new Error("Rate not found in response");
    rateCache.set(cacheKey, rate);
    return rate;
  } catch {
    // Fallback to static rates
    const fromRate = fallbackRates[from];
    const toRate = fallbackRates[to];
    if (!fromRate || !toRate) {
      throw new Error(`Unsupported currency: ${!fromRate ? from : to}`);
    }
    return toRate / fromRate;
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<CurrencyConversion> {
  const rate = await fetchRate(fromCurrency, toCurrency);
  const result = amount * rate;

  return {
    amount,
    fromCurrency,
    toCurrency,
    rate: Math.round(rate * 10000) / 10000,
    result: Math.round(result * 100) / 100,
  };
}

// ============================================================================
// 9. Text Case Converter
// ============================================================================

export function convertTextCase(
  text: string,
  format: "camelCase" | "snake_case" | "kebab-case" | "PascalCase" | "slug"
): string {
  const words = text.split(/[\s_-]+/);

  switch (format) {
    case "camelCase":
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
    case "snake_case":
      return words.map((w) => w.toLowerCase()).join("_");
    case "kebab-case":
      return words.map((w) => w.toLowerCase()).join("-");
    case "PascalCase":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "slug":
      return words
        .map((w) => w.toLowerCase())
        .join("-")
        .replace(/[^a-z0-9-]/g, "");
    default:
      return text;
  }
}

// ============================================================================
// 10. Base64 Encoder/Decoder
// ============================================================================

export function encodeBase64(text: string): string {
  return Buffer.from(text).toString("base64");
}

export function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

// ============================================================================
// 11. Profanity Filter
// ============================================================================

const profanityFilter = new Filter();

export function filterProfanity(text: string, censor: boolean = true): { cleaned: string; hasProfanity: boolean } {
  const hasProfanity = profanityFilter.isProfane(text);
  const cleaned = censor ? profanityFilter.clean(text) : text;
  return { cleaned, hasProfanity };
}

// ============================================================================
// 12. UUID/CUID Generator
// ============================================================================

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateCUID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `c${timestamp}${randomPart}`;
}

// ============================================================================
// 13. Lorem Ipsum Generator
// ============================================================================

const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
];

export function generateLoremIpsum(wordCount: number = 50): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
  }
  return words.join(" ");
}

// ============================================================================
// 14. JSON to CSV Converter
// ============================================================================

export function jsonToCSV(jsonArray: unknown[]): string {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return "";
  }

  const headers = Object.keys(jsonArray[0] as Record<string, unknown>);
  const rows = jsonArray.map((obj) =>
    headers
      .map((header) => {
        const value = (obj as Record<string, unknown>)[header];
        return typeof value === "string" && value.includes(",") ? `"${value}"` : String(value ?? "");
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

// ============================================================================
// 15. Color Palette Generator
// ============================================================================

interface ColorPalette {
  base: string;
  complementary: string;
  triadic: string[];
  analogous: string[];
}

export function generateColorPalette(hexColor: string): ColorPalette {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const hslToHex = (h: number, s: number, l: number): string => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }

    return `#${Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round((b + m) * 255)
      .toString(16)
      .padStart(2, "0")}`;
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  };

  const [h, s, l] = rgbToHsl(r, g, b);

  return {
    base: `#${hex}`,
    complementary: hslToHex((h + 180) % 360, s, l),
    triadic: [hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
    analogous: [hslToHex((h + 30) % 360, s, l), hslToHex((h - 30 + 360) % 360, s, l)],
  };
}

// ============================================================================
// 16. Gravatar URL Resolver
// ============================================================================

export function getGravatarURL(email: string, size: number = 200): string {
  const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

// ============================================================================
// 17. Placeholder Image Generator
// ============================================================================

export function getPlaceholderImageURL(
  width: number,
  height: number,
  bgColor: string = "cccccc",
  text?: string
): string {
  const textParam = text ? `?text=${encodeURIComponent(text)}` : "";
  const url = `https://placehold.co/${width}x${height}/${bgColor}/000000${textParam}`;
  return url;
}

// ============================================================================
// 18. Morse Code Converter
// ============================================================================

const morseCodeMap: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
};

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => morseCodeMap[char] || " ")
    .join(" ");
}

export function morseToText(morse: string): string {
  const reverseMorse = Object.fromEntries(Object.entries(morseCodeMap).map(([k, v]) => [v, k]));
  return morse
    .split(" ")
    .map((code) => reverseMorse[code] || "?")
    .join("");
}

// ============================================================================
// 19. BMI Calculator
// ============================================================================

interface BMIResult {
  bmi: number;
  category: string;
  weight: number;
  height: number;
}

export function calculateBMI(weight: number, height: number): BMIResult {
  const bmi = weight / (height * height);
  let category = "";

  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return {
    bmi: Math.round(bmi * 100) / 100,
    category,
    weight,
    height,
  };
}

// ============================================================================
// 20. User Agent Parser
// ============================================================================

interface UserAgentInfo {
  browser: string;
  version: string;
  os: string;
  device: string;
}

export function parseUserAgent(userAgent: string): UserAgentInfo {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    browser: browser.name || "Unknown",
    version: browser.version || "Unknown",
    os: os.name || "Unknown",
    device: device.type ? device.type.charAt(0).toUpperCase() + device.type.slice(1) : "Desktop",
  };
}

// ============================================================================
// 21. Hash Generator
// ============================================================================

export function generateHash(text: string, algorithm: "md5" | "sha256" | "sha512" = "sha256"): string {
  if (!["md5", "sha256", "sha512"].includes(algorithm)) {
    throw new Error("Unsupported algorithm. Use md5, sha256, or sha512.");
  }
  return crypto.createHash(algorithm).update(text).digest("hex");
}

// ============================================================================
// 22. JWT Encoder / Decoder / Validator
// ============================================================================

function base64UrlEscape(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function base64UrlUnescape(str: string): string {
  str += Array(5 - (str.length % 4)).join("=");
  return str.replace(/\-/g, "+").replace(/\_/g, "/");
}

export function encodeJWT(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEscape(Buffer.from(JSON.stringify(header)).toString("base64"));
  const encodedPayload = base64UrlEscape(Buffer.from(JSON.stringify(payload)).toString("base64"));
  const signature = crypto.createHmac("sha256", secret).update(`${encodedHeader}.${encodedPayload}`).digest("base64");
  return `${encodedHeader}.${encodedPayload}.${base64UrlEscape(signature)}`;
}

export function decodeJWT(token: string): { header: unknown; payload: unknown } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const header = JSON.parse(Buffer.from(base64UrlUnescape(parts[0]), "base64").toString());
  const payload = JSON.parse(Buffer.from(base64UrlUnescape(parts[1]), "base64").toString());
  return { header, payload };
}

export function validateJWT(token: string, secret: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const signature = crypto.createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest("base64");
    return base64UrlEscape(signature) === parts[2];
  } catch {
    return false;
  }
}

// ============================================================================
// 23. Fake Data Generator
// ============================================================================

const firstNames = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Elizabeth","David","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen"];
const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin"];
const domains = ["example.com","test.org","demo.net","mail.io","sample.dev"];
const companies = ["Acme Corp","Globex","Soylent Corp","Initech","Umbrella Corp","Stark Ind","Wayne Ent","Cyberdyne","Massive Dynamic","Hooli"];
const streets = ["Main St","Elm St","Maple Ave","Oak Dr","Pine Ln","Cedar Rd","Birch Blvd","Willow Way","Spruce St","Ash Ave"];
const cities = ["Springfield","Rivertown","Lakeview","Hill Valley","Smallville","Gotham","Metropolis","Star City","Central City","Coast City"];

export function generateFakeData(type: string, count: number = 1): unknown[] {
  const results: unknown[] = [];
  for (let i = 0; i < count; i++) {
    const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    switch (type) {
      case "name":
        results.push(`${rand(firstNames)} ${rand(lastNames)}`);
        break;
      case "email":
        results.push(`${rand(firstNames).toLowerCase()}.${rand(lastNames).toLowerCase()}@${rand(domains)}`);
        break;
      case "company":
        results.push(rand(companies));
        break;
      case "address":
        results.push(`${Math.floor(Math.random() * 9000) + 1000} ${rand(streets)}, ${rand(cities)}, USA`);
        break;
      case "phone":
        results.push(`+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`);
        break;
      case "uuid":
        results.push(crypto.randomUUID());
        break;
      case "sentence": {
        const words = ["the","quick","brown","fox","jumps","over","lazy","dog","hello","world","lorem","ipsum","dolor","sit","amet"];
        const s = Array.from({ length: 6 }, () => rand(words)).join(" ");
        results.push(s.charAt(0).toUpperCase() + s.slice(1) + ".");
        break;
      }
      default:
        throw new Error(`Unsupported fake data type: ${type}`);
    }
  }
  return results;
}

// ============================================================================
// 24. Markdown to HTML
// ============================================================================

export function markdownToHTML(markdown: string): string {
  return marked.parse(markdown) as string;
}

// ============================================================================
// 25. HTML Sanitizer
// ============================================================================

export function sanitizeHTML(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img","h1","h2"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src","alt"] },
  });
}

// ============================================================================
// 26. Cron Expression Parser
// ============================================================================

export function parseCron(expression: string): { readable: string; next: string[]; valid: boolean } {
  try {
    const parsed = CronExpressionParser.parse(expression);
    const next = [
      parsed.next().toDate().toISOString(),
      parsed.next().toDate().toISOString(),
      parsed.next().toDate().toISOString(),
    ];
    return { readable: parsed.stringify(), next, valid: true };
  } catch {
    return { readable: "", next: [], valid: false };
  }
}

// ============================================================================
// 27. Regex Tester + Explainer
// ============================================================================

export function testRegex(pattern: string, flags: string = "", testString: string = ""): {
  valid: boolean;
  matches: string[];
  error: string | null;
  explain: string;
} {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = (testString.match(regex) || []).filter((m): m is string => m !== null);
    const explain = explainRegexPattern(pattern);
    return { valid: true, matches, error: null, explain };
  } catch (e: any) {
    return { valid: false, matches: [], error: e.message || "Invalid regex", explain: "" };
  }
}

function explainRegexPattern(pattern: string): string {
  const explanations: string[] = [];
  if (pattern.startsWith("^")) explanations.push("Anchors to start of string");
  if (pattern.endsWith("$")) explanations.push("Anchors to end of string");
  if (pattern.includes(".")) explanations.push("Matches any character (except newline)");
  if (pattern.includes("*")) explanations.push("Zero or more quantifier");
  if (pattern.includes("+")) explanations.push("One or more quantifier");
  if (pattern.includes("?")) explanations.push("Optional (zero or one) quantifier");
  if (pattern.includes("\\d")) explanations.push("Matches digits");
  if (pattern.includes("\\w")) explanations.push("Matches word characters");
  if (pattern.includes("\\s")) explanations.push("Matches whitespace");
  if (pattern.includes("[")) explanations.push("Character class");
  if (pattern.includes("(")) explanations.push("Capturing group");
  if (pattern.includes("|")) explanations.push("Alternation (OR)");
  if (explanations.length === 0) explanations.push("Custom pattern");
  return explanations.join("; ");
}

// ============================================================================
// 28. Text / JSON Diff Calculator
// ============================================================================

export function calculateDiff(textA: string, textB: string, type: "lines" | "words" | "json" = "lines"): {
  diff: { value: string; added?: boolean; removed?: boolean }[];
} {
  let rawDiff: any[];
  if (type === "json") {
    const a = JSON.stringify(JSON.parse(textA), null, 2);
    const b = JSON.stringify(JSON.parse(textB), null, 2);
    rawDiff = diffLines(a, b);
  } else if (type === "words") {
    rawDiff = diffWords(textA, textB);
  } else {
    rawDiff = diffLines(textA, textB);
  }
  return {
    diff: rawDiff.map((part) => ({
      value: part.value,
      added: part.added || undefined,
      removed: part.removed || undefined,
    })),
  };
}

// ============================================================================
// 29. IP Validator
// ============================================================================

export function validateIP(ip: string): { valid: boolean; type: "IPv4" | "IPv6" | "unknown" } {
  const ipv4 = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  const ipv6 = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv4.test(ip)) return { valid: true, type: "IPv4" };
  if (ipv6.test(ip)) return { valid: true, type: "IPv6" };
  return { valid: false, type: "unknown" };
}

// ============================================================================
// 30. Batch API
// ============================================================================

interface BatchRequest {
  endpoint: string;
  params?: Record<string, unknown>;
}

interface BatchResponse {
  endpoint: string;
  status: "success" | "error";
  data?: unknown;
  error?: string;
}

export async function batchAPI(requests: BatchRequest[]): Promise<BatchResponse[]> {
  const responses: BatchResponse[] = [];
  for (const req of requests) {
    try {
      responses.push({ endpoint: req.endpoint, status: "success", data: await executeBatchEndpoint(req.endpoint, req.params) });
    } catch (e: any) {
      responses.push({ endpoint: req.endpoint, status: "error", error: e.message });
    }
  }
  return responses;
}

async function executeBatchEndpoint(endpoint: string, params?: Record<string, unknown>): Promise<unknown> {
  const p = params || {};
  switch (endpoint) {
    case "totp.generate": return { token: generateTOTP(p.secret as string) };
    case "totp.validate": return { valid: validateTOTP(p.secret as string, p.token as string) };
    case "email.checkDisposable": return { isDisposable: isDisposableEmail(p.email as string), email: p.email };
    case "qrcode.generate": return { url: await generateQRCode(p.text as string, p.size as number, p.color as string, p.bgColor as string) };
    case "geo.getIPInfo": return await getIPGeoData(p.ip as string);
    case "workingDays.calculate": return { days: calculateWorkingDays(p.startDate as string, p.endDate as string, p.holidays as string[]) };
    case "password.strength": return evaluatePasswordStrength(p.password as string);
    case "units.convert": return convertUnits(p.value as number, p.fromUnit as string, p.toUnit as string, p.category as string);
    case "units.convertTemperature": return convertTemperature(p.value as number, p.fromUnit as "c" | "f" | "k", p.toUnit as "c" | "f" | "k");
    case "currency.convert": return await convertCurrency(p.amount as number, p.fromCurrency as string, p.toCurrency as string);
    case "text.caseConvert": return { result: convertTextCase(p.text as string, p.format as any) };
    case "text.base64Encode": return { encoded: encodeBase64(p.text as string) };
    case "text.base64Decode": return { decoded: decodeBase64(p.encoded as string) };
    case "text.filterProfanity": return filterProfanity(p.text as string, p.censor as boolean);
    case "dev.generateUUID": return { uuid: generateUUID() };
    case "dev.generateCUID": return { cuid: generateCUID() };
    case "dev.loremIpsum": return { text: generateLoremIpsum(p.wordCount as number) };
    case "dev.jsonToCSV": return { csv: jsonToCSV(p.json as any[]) };
    case "dev.colorPalette": return generateColorPalette(p.hex as string);
    case "dev.gravatarURL": return { url: getGravatarURL(p.email as string, p.size as number) };
    case "dev.placeholderImage": return { url: getPlaceholderImageURL(p.width as number, p.height as number, p.bgColor as string, p.text as string) };
    case "dev.morseEncode": return { morse: textToMorse(p.text as string) };
    case "dev.morseDecode": return { text: morseToText(p.morse as string) };
    case "dev.calculateBMI": return calculateBMI(p.weight as number, p.height as number);
    case "dev.parseUserAgent": return parseUserAgent(p.userAgent as string);
    case "hash.generate": return { hash: generateHash(p.text as string, p.algorithm as any) };
    case "jwt.encode": return { token: encodeJWT(p.payload as any, p.secret as string) };
    case "jwt.decode": return decodeJWT(p.token as string);
    case "jwt.validate": return { valid: validateJWT(p.token as string, p.secret as string) };
    case "fakeData.generate": return { data: generateFakeData(p.type as string, p.count as number) };
    case "markdown.toHTML": return { html: markdownToHTML(p.markdown as string) };
    case "html.sanitize": return { clean: sanitizeHTML(p.dirty as string) };
    case "cron.parse": return parseCron(p.expression as string);
    case "regex.test": return testRegex(p.pattern as string, p.flags as string, p.testString as string);
    case "diff.calculate": return calculateDiff(p.textA as string, p.textB as string, p.type as any);
    case "ip.validate": return validateIP(p.ip as string);
    default:
      throw new Error(`Unknown batch endpoint: ${endpoint}`);
  }
}
