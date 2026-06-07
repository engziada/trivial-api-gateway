# Trivial API Gateway - Complete API Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Base URL:** `https://trivialapi.manus.space/api/trpc`

---

## Overview

The Trivial API Gateway provides 20 essential developer utilities in a single, easy-to-use API. All endpoints are public, require no authentication, and return JSON responses. Perfect for rapid prototyping, testing, and production applications.

---

## Authentication

**No authentication required.** All endpoints are public and rate-limited by RapidAPI.

---

## Response Format

All successful responses follow this structure:

```json
{
  "result": {
    "data": {
      "json": {
        // Endpoint-specific response data
      }
    }
  }
}
```

Error responses:

```json
{
  "error": {
    "json": {
      "message": "Error description",
      "code": -32600
    }
  }
}
```

---

## Endpoints

### 1. TOTP Generator
**Endpoint:** `utils.totp.generate`  
**Method:** GET  
**Description:** Generate a time-based one-time password (TOTP) following RFC 6238.

**Parameters:**
- `secret` (string, required): Base32-encoded secret key

**Example Request:**
```
GET /api/trpc/utils.totp.generate?input={"json":{"secret":"JBSWY3DPEBLW64TMMQ======"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "token": "916491"
      }
    }
  }
}
```

**Use Case:** Multi-factor authentication, TOTP-based 2FA verification

---

### 2. Disposable Email Detector
**Endpoint:** `utils.email.checkDisposable`  
**Method:** GET  
**Description:** Check if an email domain is a known temporary/throwaway provider.

**Parameters:**
- `email` (string, required): Email address to check

**Example Request:**
```
GET /api/trpc/utils.email.checkDisposable?input={"json":{"email":"user@tempmail.com"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "isDisposable": true,
        "domain": "tempmail.com"
      }
    }
  }
}
```

**Use Case:** User registration validation, preventing spam signups

---

### 3. QR Code Generator
**Endpoint:** `utils.qrcode.generate`  
**Method:** GET  
**Description:** Generate a styled QR code with custom colors.

**Parameters:**
- `text` (string, required): Text or URL to encode
- `foreground` (string, optional): Foreground color (hex, default: #000000)
- `background` (string, optional): Background color (hex, default: #FFFFFF)

**Example Request:**
```
GET /api/trpc/utils.qrcode.generate?input={"json":{"text":"https://example.com","foreground":"#FF0000"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAY..."
      }
    }
  }
}
```

**Use Case:** Payment QR codes, contact sharing, URL shortening

---

### 4. IP Geolocation
**Endpoint:** `utils.geo.getIPInfo`  
**Method:** GET  
**Description:** Get timezone and country information from an IP address.

**Parameters:**
- `ip` (string, required): IP address to lookup

**Example Request:**
```
GET /api/trpc/utils.geo.getIPInfo?input={"json":{"ip":"8.8.8.8"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "ip": "8.8.8.8",
        "country": "United States",
        "timezone": "America/Los_Angeles",
        "continent": "North America"
      }
    }
  }
}
```

**Use Case:** User location detection, timezone-aware scheduling, content localization

---

### 5. Working Days Calculator
**Endpoint:** `utils.workingDays.calculate`  
**Method:** GET  
**Description:** Calculate business days between two dates, excluding weekends and holidays.

**Parameters:**
- `startDate` (string, required): Start date (YYYY-MM-DD)
- `endDate` (string, required): End date (YYYY-MM-DD)
- `holidays` (array, optional): Array of holiday dates (YYYY-MM-DD)

**Example Request:**
```
GET /api/trpc/utils.workingDays.calculate?input={"json":{"startDate":"2026-01-01","endDate":"2026-01-31"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "workingDays": 21,
        "weekendDays": 8,
        "totalDays": 30
      }
    }
  }
}
```

**Use Case:** Project timeline estimation, SLA calculations, HR scheduling

---

### 6. Password Strength Meter
**Endpoint:** `utils.password.strength`  
**Method:** GET  
**Description:** Evaluate password strength and provide actionable feedback.

**Parameters:**
- `password` (string, required): Password to evaluate

**Example Request:**
```
GET /api/trpc/utils.password.strength?input={"json":{"password":"MyP@ssw0rd123"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "score": 85,
        "strength": "Strong",
        "feedback": "Excellent password with uppercase, lowercase, numbers, and symbols",
        "suggestions": []
      }
    }
  }
}
```

**Use Case:** User registration validation, password policy enforcement

---

### 7. Unit Converter
**Endpoint:** `utils.units.convert`  
**Method:** GET  
**Description:** Convert between 100+ units (length, weight, temperature, volume, etc.).

**Parameters:**
- `value` (number, required): Value to convert
- `fromUnit` (string, required): Source unit (e.g., "meter", "kilometer", "mile")
- `toUnit` (string, required): Target unit (e.g., "foot", "yard")

**Example Request:**
```
GET /api/trpc/utils.units.convert?input={"json":{"value":100,"fromUnit":"meter","toUnit":"foot"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "value": 100,
        "fromUnit": "meter",
        "toUnit": "foot",
        "result": 328.084
      }
    }
  }
}
```

**Use Case:** E-commerce product specs, scientific calculations, international commerce

---

### 8. Currency Converter
**Endpoint:** `utils.currency.convert`  
**Method:** GET  
**Description:** Convert between major world currencies.

**Parameters:**
- `amount` (number, required): Amount to convert
- `fromCurrency` (string, required): Source currency code (e.g., "USD")
- `toCurrency` (string, required): Target currency code (e.g., "EUR")

**Example Request:**
```
GET /api/trpc/utils.currency.convert?input={"json":{"amount":100,"fromCurrency":"USD","toCurrency":"EUR"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "amount": 100,
        "fromCurrency": "USD",
        "toCurrency": "EUR",
        "result": 92.50,
        "rate": 0.925,
        "timestamp": "2026-06-07T20:42:00Z"
      }
    }
  }
}
```

**Use Case:** E-commerce pricing, international payments, financial calculations

---

### 9. Text Case Converter
**Endpoint:** `utils.text.caseConvert`  
**Method:** GET  
**Description:** Convert text to various case formats.

**Parameters:**
- `text` (string, required): Text to convert
- `targetCase` (string, required): Target case format (camelCase, snake_case, kebab-case, PascalCase, slug)

**Example Request:**
```
GET /api/trpc/utils.text.caseConvert?input={"json":{"text":"hello world","targetCase":"camelCase"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "original": "hello world",
        "converted": "helloWorld",
        "format": "camelCase"
      }
    }
  }
}
```

**Use Case:** Code generation, URL slug creation, variable naming

---

### 10. Base64 Encoder/Decoder
**Endpoint:** `utils.text.base64Encode`  
**Method:** GET  
**Description:** Encode and decode Base64 strings.

**Parameters:**
- `text` (string, required): Text to encode or decode
- `mode` (string, required): "encode" or "decode"

**Example Request:**
```
GET /api/trpc/utils.text.base64Encode?input={"json":{"text":"Hello World","mode":"encode"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "original": "Hello World",
        "result": "SGVsbG8gV29ybGQ=",
        "mode": "encode"
      }
    }
  }
}
```

**Use Case:** Data encoding, API authentication, file transfers

---

### 11. Profanity Filter
**Endpoint:** `utils.text.filterProfanity`  
**Method:** GET  
**Description:** Filter and censor inappropriate language.

**Parameters:**
- `text` (string, required): Text to filter
- `censorChar` (string, optional): Character to use for censoring (default: "*")

**Example Request:**
```
GET /api/trpc/utils.text.filterProfanity?input={"json":{"text":"This is a bad word"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "original": "This is a bad word",
        "filtered": "This is a *** word",
        "flagged": true,
        "matches": ["bad"]
      }
    }
  }
}
```

**Use Case:** User-generated content moderation, comment filtering

---

### 12. UUID/CUID Generator
**Endpoint:** `utils.dev.generateUUID`  
**Method:** GET  
**Description:** Generate unique identifiers (UUID v4 or CUID).

**Parameters:**
- `type` (string, optional): "uuid" or "cuid" (default: "uuid")

**Example Request:**
```
GET /api/trpc/utils.dev.generateUUID?input={"json":{"type":"uuid"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "uuid"
      }
    }
  }
}
```

**Use Case:** Database IDs, session tokens, request tracking

---

### 13. Lorem Ipsum Generator
**Endpoint:** `utils.dev.loremIpsum`  
**Method:** GET  
**Description:** Generate placeholder text for UI mockups and testing.

**Parameters:**
- `paragraphs` (number, optional): Number of paragraphs (default: 1)
- `sentences` (number, optional): Sentences per paragraph (default: 3)

**Example Request:**
```
GET /api/trpc/utils.dev.loremIpsum?input={"json":{"paragraphs":2,"sentences":3}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        "paragraphs": 2,
        "sentences": 3
      }
    }
  }
}
```

**Use Case:** UI mockups, content placeholders, testing

---

### 14. JSON to CSV Converter
**Endpoint:** `utils.dev.jsonToCSV`  
**Method:** GET  
**Description:** Convert JSON arrays to CSV format.

**Parameters:**
- `data` (array, required): Array of objects to convert
- `headers` (array, optional): Custom column headers

**Example Request:**
```
GET /api/trpc/utils.dev.jsonToCSV?input={"json":{"data":[{"name":"John","age":30},{"name":"Jane","age":25}]}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "csv": "name,age\nJohn,30\nJane,25"
      }
    }
  }
}
```

**Use Case:** Data export, reporting, spreadsheet generation

---

### 15. Color Palette Generator
**Endpoint:** `utils.dev.colorPalette`  
**Method:** GET  
**Description:** Generate complementary and triadic color palettes from a hex value.

**Parameters:**
- `hexColor` (string, required): Base color in hex format (e.g., "#FF5733")

**Example Request:**
```
GET /api/trpc/utils.dev.colorPalette?input={"json":{"hexColor":"#FF5733"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "base": "#FF5733",
        "complementary": "#33FFFF",
        "triadic": ["#FF5733", "#33FF57", "#5733FF"],
        "analogous": ["#FF7733", "#FF5733", "#FF3733"]
      }
    }
  }
}
```

**Use Case:** Design systems, theme generation, UI color picking

---

### 16. Gravatar URL Resolver
**Endpoint:** `utils.dev.gravatarURL`  
**Method:** GET  
**Description:** Get the Gravatar URL for an email address.

**Parameters:**
- `email` (string, required): Email address
- `size` (number, optional): Image size in pixels (default: 80)
- `default` (string, optional): Default image type (identicon, monsterid, wavatar, retro)

**Example Request:**
```
GET /api/trpc/utils.dev.gravatarURL?input={"json":{"email":"user@example.com","size":200}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "url": "https://www.gravatar.com/avatar/5d41402abc4b2a76b9719d911017c592?s=200",
        "email": "user@example.com",
        "size": 200
      }
    }
  }
}
```

**Use Case:** User avatars, profile pictures, team directories

---

### 17. Placeholder Image Generator
**Endpoint:** `utils.dev.placeholderImage`  
**Method:** GET  
**Description:** Generate dynamic placeholder images for UI testing.

**Parameters:**
- `width` (number, required): Image width in pixels
- `height` (number, required): Image height in pixels
- `text` (string, optional): Text to display on image
- `backgroundColor` (string, optional): Background color (hex)

**Example Request:**
```
GET /api/trpc/utils.dev.placeholderImage?input={"json":{"width":400,"height":300,"text":"Placeholder"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "url": "https://via.placeholder.com/400x300?text=Placeholder",
        "width": 400,
        "height": 300
      }
    }
  }
}
```

**Use Case:** UI mockups, image placeholders, testing

---

### 18. Morse Code Converter
**Endpoint:** `utils.dev.morseEncode`  
**Method:** GET  
**Description:** Convert text to and from Morse code.

**Parameters:**
- `text` (string, required): Text to convert
- `mode` (string, required): "encode" or "decode"

**Example Request:**
```
GET /api/trpc/utils.dev.morseEncode?input={"json":{"text":"HELLO","mode":"encode"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "original": "HELLO",
        "morse": ".... . .-.. .-.. ---",
        "mode": "encode"
      }
    }
  }
}
```

**Use Case:** Educational tools, accessibility, retro communication

---

### 19. BMI Calculator
**Endpoint:** `utils.dev.calculateBMI`  
**Method:** GET  
**Description:** Calculate Body Mass Index with health category.

**Parameters:**
- `weight` (number, required): Weight in kilograms
- `height` (number, required): Height in meters

**Example Request:**
```
GET /api/trpc/utils.dev.calculateBMI?input={"json":{"weight":70,"height":1.75}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "bmi": 22.86,
        "category": "Normal weight",
        "weight": 70,
        "height": 1.75
      }
    }
  }
}
```

**Use Case:** Health apps, fitness trackers, wellness platforms

---

### 20. User Agent Parser
**Endpoint:** `utils.dev.parseUserAgent`  
**Method:** GET  
**Description:** Parse user agent strings to extract browser, OS, and device info.

**Parameters:**
- `userAgent` (string, required): User agent string

**Example Request:**
```
GET /api/trpc/utils.dev.parseUserAgent?input={"json":{"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}}
```

**Example Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "browser": "Chrome",
        "os": "Windows",
        "device": "Desktop",
        "version": "90.0"
      }
    }
  }
}
```

**Use Case:** Analytics, device detection, browser compatibility checking

---

## Error Handling

All errors return a standard error response:

```json
{
  "error": {
    "json": {
      "message": "Error description",
      "code": -32600,
      "data": {
        "code": "BAD_REQUEST",
        "httpStatus": 400
      }
    }
  }
}
```

**Common Error Codes:**
- `400 BAD_REQUEST`: Invalid input parameters
- `500 INTERNAL_SERVER_ERROR`: Server error

---

## Rate Limiting

Rate limits are enforced by RapidAPI based on your subscription plan. Check RapidAPI documentation for current limits.

---

## Support & Issues

For issues or feature requests, visit the GitHub repository or contact support through RapidAPI.

---

## License

MIT License - See LICENSE file for details.

---

**Last Updated:** June 7, 2026  
**API Version:** 1.0.0
