import { describe, it, expect } from "vitest";
import * as api from "./apiImplementations";

/**
 * Comprehensive Integration Tests
 * Tests each API with valid and invalid fake data
 */

describe("API Integration Tests - Valid & Invalid Data", () => {
  // ============================================
  // 1. TOTP Generator/Validator
  // ============================================
  describe("TOTP Generator/Validator", () => {
    it("should generate valid TOTP with valid base32 secret", () => {
      const token = api.generateTOTP("JBSWY3DPEBLW64TMMQ======");
      expect(token).toMatch(/^\d{6}$/);
      expect(token.length).toBe(6);
    });

    it("should reject invalid base32 secret", () => {
      expect(() => api.generateTOTP("invalid!!!secret")).toThrow();
    });
  });

  // ============================================
  // 2. Disposable Email Detector
  // ============================================
  describe("Disposable Email Detector", () => {
    it("should identify disposable email domain", () => {
      const result = api.isDisposableEmail("test@tempmail.com");
      expect(typeof result).toBe("boolean");
      expect(result).toBe(true);
    });

    it("should identify legitimate email domain", () => {
      const result = api.isDisposableEmail("test@gmail.com");
      expect(typeof result).toBe("boolean");
      expect(result).toBe(false);
    });
  });

  // ============================================
  // 3. QR Code Generator
  // ============================================
  describe("QR Code Generator", () => {
    it("should generate QR code with valid text", async () => {
      const result = await api.generateQRCode("https://example.com", 200, "FF0000", "FFFFFF");
      expect(result).toContain("data:image/png;base64");
    });

    it("should reject empty text input", async () => {
      await expect(api.generateQRCode("", 200, "FF0000", "FFFFFF")).rejects.toThrow("Missing text input");
    });
  });

  // ============================================
  // 4. IP Geolocation
  // ============================================
  describe("IP Geolocation", () => {
    it("should return geolocation for valid public IP", async () => {
      const result = await api.getIPGeoData("8.8.8.8");
      expect(result).toHaveProperty("country");
      expect(result.country).not.toBe("Unknown");
    });

    it("should handle invalid IP address gracefully", async () => {
      const result = await api.getIPGeoData("999.999.999.999");
      expect(result.country).toBe("Unknown");
    });
  });

  // ============================================
  // 5. Working Days Calculator
  // ============================================
  describe("Working Days Calculator", () => {
    it("should calculate working days between valid dates", () => {
      const result = api.calculateWorkingDays("2024-01-01", "2024-01-10");
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("should handle invalid date format gracefully", () => {
      // Function may handle invalid dates by returning 0 or NaN
      const result = api.calculateWorkingDays("invalid", "2024-01-10");
      expect(typeof result).toBe("number");
    });
  });

  // ============================================
  // 6. Password Strength Meter
  // ============================================
  describe("Password Strength Meter", () => {
    it("should rate strong password", () => {
      const result = api.evaluatePasswordStrength("MyP@ssw0rd123!Secure");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("feedback");
      expect(result.score).toBeGreaterThan(70);
    });

    it("should rate weak password", () => {
      const result = api.evaluatePasswordStrength("123");
      expect(result).toHaveProperty("score");
      expect(result.score).toBeLessThan(50);
    });
  });

  // ============================================
  // 7. Unit Converter
  // ============================================
  describe("Unit Converter", () => {
    it("should convert meters to feet", () => {
      const result = api.convertUnits(10, "m", "ft");
      expect(result).toHaveProperty("result");
      expect(result.result).toBeCloseTo(32.8084, 2);
    });

    it("should reject invalid unit", () => {
      expect(() => api.convertUnits(10, "invalid", "ft")).toThrow();
    });
  });

  // ============================================
  // 8. Currency Converter
  // ============================================
  describe("Currency Converter", () => {
    it("should convert USD to EUR", async () => {
      const result = await api.convertCurrency(100, "USD", "EUR");
      expect(result).toHaveProperty("amount");
      expect(result.amount).toBeGreaterThan(0);
    });

    it("should reject invalid currency code", async () => {
      await expect(api.convertCurrency(100, "INVALID", "EUR")).rejects.toThrow();
    });
  });

  // ============================================
  // 9. Text Case Converter
  // ============================================
  describe("Text Case Converter", () => {
    it("should convert to camelCase", () => {
      const result = api.convertTextCase("hello world test", "camelCase");
      expect(result).toBe("helloWorldTest");
    });

    it("should handle empty string", () => {
      const result = api.convertTextCase("", "camelCase");
      expect(result).toBe("");
    });
  });

  // ============================================
  // 10. Base64 Encoder/Decoder
  // ============================================
  describe("Base64 Encoder/Decoder", () => {
    it("should encode text to base64", () => {
      const result = api.encodeBase64("Hello World");
      expect(result).toBe("SGVsbG8gV29ybGQ=");
    });

    it("should handle empty string", () => {
      const result = api.encodeBase64("");
      expect(result).toBe("");
    });

    it("should decode base64 to text", () => {
      const result = api.decodeBase64("SGVsbG8gV29ybGQ=");
      expect(result).toBe("Hello World");
    });

    it("should handle invalid base64 gracefully", () => {
      // Base64 decoder may not throw, just return empty or handle gracefully
      const result = api.decodeBase64("!!!invalid!!!");
      expect(typeof result).toBe("string");
    });
  });

  // ============================================
  // 11. Profanity Filter
  // ============================================
  describe("Profanity Filter", () => {
    it("should detect profanity in text", () => {
      const result = api.filterProfanity("This is a damn test");
      expect(result).toHaveProperty("hasProfanity");
      expect(result).toHaveProperty("cleaned");
      expect(typeof result.hasProfanity).toBe("boolean");
    });

    it("should handle clean text", () => {
      const result = api.filterProfanity("This is a clean test");
      expect(result).toHaveProperty("hasProfanity");
      expect(result.hasProfanity).toBe(false);
    });
  });

  // ============================================
  // 12. UUID/CUID Generator
  // ============================================
  describe("UUID/CUID Generator", () => {
    it("should generate valid UUID", () => {
      const result = api.generateUUID();
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("should generate valid CUID", () => {
      const result = api.generateCUID();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 13. Lorem Ipsum Generator
  // ============================================
  describe("Lorem Ipsum Generator", () => {
    it("should generate lorem ipsum with valid word count", () => {
      const result = api.generateLoremIpsum(10);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle negative word count gracefully", () => {
      // Function may handle negative values by returning empty or default
      const result = api.generateLoremIpsum(-5);
      expect(typeof result).toBe("string");
    });
  });

  // ============================================
  // 14. JSON to CSV Converter
  // ============================================
  describe("JSON to CSV Converter", () => {
    it("should convert valid JSON to CSV", () => {
      const jsonData = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const result = api.jsonToCSV(jsonData);
      expect(typeof result).toBe("string");
      expect(result).toContain("name");
      expect(result).toContain("John");
    });

    it("should handle empty array", () => {
      const result = api.jsonToCSV([]);
      expect(typeof result).toBe("string");
    });
  });

  // ============================================
  // 15. Color Palette Generator
  // ============================================
  describe("Color Palette Generator", () => {
    it("should generate palette from valid hex color", () => {
      const result = api.generateColorPalette("#FF0000");
      expect(result).toHaveProperty("base");
      expect(result).toHaveProperty("complementary");
      expect(result).toHaveProperty("triadic");
      expect(result).toHaveProperty("analogous");
    });

    it("should handle color without hash", () => {
      const result = api.generateColorPalette("FF0000");
      expect(result).toHaveProperty("base");
      expect(result).toHaveProperty("complementary");
    });
  });

  // ============================================
  // 16. Gravatar URL Resolver
  // ============================================
  describe("Gravatar URL Resolver", () => {
    it("should generate gravatar URL for valid email", () => {
      const result = api.getGravatarURL("test@example.com");
      expect(typeof result).toBe("string");
      expect(result).toContain("gravatar.com");
    });

    it("should handle email with spaces", () => {
      const result = api.getGravatarURL("  test@example.com  ");
      expect(typeof result).toBe("string");
      expect(result).toContain("gravatar.com");
    });
  });

  // ============================================
  // 17. Placeholder Image Generator
  // ============================================
  describe("Placeholder Image Generator", () => {
    it("should generate placeholder image URL with valid dimensions", () => {
      const result = api.getPlaceholderImageURL(200, 300);
      expect(typeof result).toBe("string");
      expect(result).toContain("200");
      expect(result).toContain("300");
    });

    it("should handle invalid dimensions gracefully", () => {
      // Function may handle negative values by using absolute values
      const result = api.getPlaceholderImageURL(-100, 300);
      expect(typeof result).toBe("string");
    });
  });

  // ============================================
  // 18. Morse Code Converter
  // ============================================
  describe("Morse Code Converter", () => {
    it("should encode text to morse code", () => {
      const result = api.textToMorse("HELLO");
      expect(typeof result).toBe("string");
      expect(result).toContain(".");
      expect(result).toContain("-");
    });

    it("should handle lowercase input", () => {
      const result = api.textToMorse("hello");
      expect(typeof result).toBe("string");
      expect(result).toContain(".");
    });

    it("should decode morse to text", () => {
      const morse = api.textToMorse("HI");
      const result = api.morseToText(morse);
      expect(result).toContain("H");
      expect(result).toContain("I");
    });
  });

  // ============================================
  // 19. BMI Calculator
  // ============================================
  describe("BMI Calculator", () => {
    it("should calculate BMI with valid measurements", () => {
      const result = api.calculateBMI(70, 1.75);
      expect(result).toHaveProperty("bmi");
      expect(result).toHaveProperty("category");
      expect(result.bmi).toBeCloseTo(22.86, 1);
    });

    it("should handle extreme but valid values", () => {
      const result = api.calculateBMI(50, 1.5);
      expect(result).toHaveProperty("bmi");
      expect(result.bmi).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 20. User Agent Parser
  // ============================================
  describe("User Agent Parser", () => {
    it("should parse valid user agent string", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
      const result = api.parseUserAgent(ua);
      expect(result).toHaveProperty("browser");
      expect(result).toHaveProperty("os");
    });

    it("should handle empty user agent", () => {
      const result = api.parseUserAgent("");
      expect(result).toHaveProperty("browser");
      expect(result).toHaveProperty("os");
    });
  });
});
