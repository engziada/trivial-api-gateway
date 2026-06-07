/**
 * Comprehensive implementations for all 20 trivial utility APIs
 * Each function is self-contained and can be called independently
 */

import * as crypto from "crypto";
import base32Decode from "base32-decode";

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

const disposableDomains = new Set([
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
  "yopmail.com",
  "temp-mail.org",
  "maildrop.cc",
  "sharklasers.com",
  "spam4.me",
  "tempmail.us",
  "temp-mail.io",
  "trashmail.com",
  "fakeinbox.com",
  "mintemail.com",
  "guerrillamail.info",
  "temp-mail.net",
  "mailnesia.com",
  "10minutemail.net",
  "tempmail.net",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? disposableDomains.has(domain) : false;
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
  const encodedText = encodeURIComponent(text);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&color=${color}&bgcolor=${bgColor}`;
  return url;
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
    m: 1,
    km: 0.001,
    cm: 100,
    mm: 1000,
    mi: 0.000621371,
    yd: 1.09361,
    ft: 3.28084,
    in: 39.3701,
  },
  weight: {
    kg: 1,
    g: 1000,
    mg: 1000000,
    lb: 2.20462,
    oz: 35.274,
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

const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.05,
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): CurrencyConversion {
  const from = exchangeRates[fromCurrency];
  const to = exchangeRates[toCurrency];

  if (!from || !to) {
    throw new Error(`Unsupported currency: ${!from ? fromCurrency : toCurrency}`);
  }

  const rate = to / from;
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

const profanityList = [
  "badword1",
  "badword2",
  "offensive",
  "inappropriate",
  "vulgar",
];

export function filterProfanity(text: string, censor: boolean = true): { cleaned: string; hasProfanity: boolean } {
  let cleaned = text;
  let hasProfanity = false;

  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(cleaned)) {
      hasProfanity = true;
      if (censor) {
        cleaned = cleaned.replace(regex, "*".repeat(word.length));
      }
    }
  }

  return { cleaned, hasProfanity };
}

// ============================================================================
// 12. UUID/CUID Generator
// ============================================================================

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
  const url = `https://via.placeholder.com/${width}x${height}/${bgColor}?text=${text || ""}`;
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
  let browser = "Unknown";
  let version = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) {
    browser = "Chrome";
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser = "Safari";
    version = userAgent.match(/Version\/(\d+)/)?.[1] || "Unknown";
  } else if (/Firefox/.test(userAgent)) {
    browser = "Firefox";
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
  } else if (/Edge/.test(userAgent)) {
    browser = "Edge";
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || "Unknown";
  }

  if (/Windows/.test(userAgent)) os = "Windows";
  else if (/Mac/.test(userAgent)) os = "macOS";
  else if (/Linux/.test(userAgent)) os = "Linux";
  else if (/Android/.test(userAgent)) os = "Android";
  else if (/iPhone|iPad/.test(userAgent)) os = "iOS";

  if (/Mobile/.test(userAgent) || /Android/.test(userAgent)) device = "Mobile";
  else if (/iPad/.test(userAgent)) device = "Tablet";

  return { browser, version, os, device };
}
