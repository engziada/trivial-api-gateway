# Trivial API Gateway - Project TODO

## Phase 1: Backend API Endpoints

### Core Utility Endpoints
- [x] TOTP Generator/Validator (RFC 6238 compliant)
- [x] Disposable Email Detector (check against known providers)
- [x] QR Code Generator (styled with custom colors)
- [x] IP to Timezone/Country (geolocation lookup)
- [x] Working Days Calculator (business days with holidays)
- [x] Password Strength Meter (score + feedback)
- [x] Unit Converter (100+ units)
- [x] Currency Converter (real-time or cached rates)
- [x] Text Case Converter (camelCase, snake_case, slug)
- [x] Base64 Encoder/Decoder
- [x] Profanity Filter (keyword-based)
- [x] UUID/CUID Generator
- [x] Lorem Ipsum Generator (multiple styles)
- [x] JSON to CSV Converter
- [x] Color Palette Generator (from hex value)
- [x] Gravatar URL Resolver
- [x] Placeholder Image Generator
- [x] Morse Code Converter
- [x] BMI Calculator
- [x] User Agent Parser

### Database Schema
- [x] Create API metadata table (name, description, category, endpoint)
- [ ] Create API usage/stats table (optional, for tracking)

## Phase 2: Frontend - Brutalist Landing Page

### Layout & Design
- [x] Implement stark black background (#000000)
- [x] Set up oversized white typography (condensed sans-serif)
- [x] Add full-width red horizontal divider line (#FF0000 or similar)
- [x] Create centered, minimalist grid layout
- [x] Remove all decorative elements, gradients, shadows

### API Explorer Components
- [x] Create API card component (name, description, category, try-it button)
- [x] Build live endpoint tester panel (input fields, execute button, response display)
- [x] Implement response formatting (JSON, error handling, loading states)
- [ ] Create category filter/tabs (optional, for organization)

### Interactive Features
- [x] Live endpoint testing without page reload
- [x] Real-time request/response display
- [x] Input validation and error messages
- [ ] Copy-to-clipboard for responses
- [ ] Request history (optional)

## Phase 3: Integration & Polish

### Testing
- [x] Test all 20 endpoints with sample inputs (vitest: 54 tests passing)
- [x] Verify error handling and edge cases
- [ ] Test on mobile responsiveness (if applicable)

### Documentation
- [x] Add endpoint documentation in API cards
- [ ] Include example inputs/outputs
- [ ] Add usage tips for each endpoint

### Deployment
- [ ] Prepare for RapidAPI publishing
- [ ] Create API documentation
- [ ] Set up rate limiting (if needed)

## Phase 4: Nice-to-Have Features

- [ ] Dark/Light theme toggle (optional, given Brutalist design)
- [ ] API usage analytics
- [ ] Keyboard shortcuts for common actions
- [ ] Export functionality (API calls, responses)
- [x] Advanced filtering/search (search by name, category, description)
- [ ] API endpoint code generation (cURL, Python, JS)
