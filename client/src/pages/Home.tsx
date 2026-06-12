import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface TestResult {
  loading: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
}

interface APIEndpoint {
  id: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
  inputs: { label: string; key: string; type: "text" | "number" | "email" }[];
  procedurePath: string;
  method?: "GET" | "POST";
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    id: "totp",
    name: "TOTP Generator",
    category: "Security",
    description: "Generate and validate time-based one-time passwords (RFC 6238)",
    endpoint: "utils.totp.generate",
    procedurePath: "utils.totp.generate",
    inputs: [{ label: "Secret Key (Base32)", key: "secret", type: "text" }],
  },
  {
    id: "email",
    name: "Disposable Email Detector",
    category: "Validation",
    description: "Check if an email domain is a known temporary provider",
    endpoint: "utils.email.checkDisposable",
    procedurePath: "utils.email.checkDisposable",
    inputs: [{ label: "Email Address", key: "email", type: "email" }],
  },
  {
    id: "qrcode",
    name: "QR Code Generator",
    category: "Tools",
    description: "Generate styled QR codes with custom colors",
    endpoint: "utils.qrcode.generate",
    procedurePath: "utils.qrcode.generate",
    inputs: [
      { label: "Text/URL", key: "text", type: "text" },
      { label: "Size (px)", key: "size", type: "number" },
      { label: "Color (hex)", key: "color", type: "text" },
      { label: "Background Color (hex)", key: "bgColor", type: "text" },
    ],
  },
  {
    id: "geo",
    name: "IP Geolocation",
    category: "Data",
    description: "Get timezone and country info from an IP address",
    endpoint: "utils.geo.getIPInfo",
    procedurePath: "utils.geo.getIPInfo",
    inputs: [{ label: "IP Address", key: "ip", type: "text" }],
  },
  {
    id: "workingdays",
    name: "Working Days Calculator",
    category: "Utilities",
    description: "Calculate business days between two dates",
    endpoint: "utils.workingDays.calculate",
    procedurePath: "utils.workingDays.calculate",
    inputs: [
      { label: "Start Date (YYYY-MM-DD)", key: "startDate", type: "text" },
      { label: "End Date (YYYY-MM-DD)", key: "endDate", type: "text" },
    ],
  },
  {
    id: "password",
    name: "Password Strength Meter",
    category: "Security",
    description: "Evaluate password strength with actionable feedback",
    endpoint: "utils.password.strength",
    procedurePath: "utils.password.strength",
    inputs: [{ label: "Password", key: "password", type: "text" }],
  },
  {
    id: "units",
    name: "Unit Converter",
    category: "Utilities",
    description: "Convert between 100+ units (length, weight, temperature)",
    endpoint: "utils.units.convert",
    procedurePath: "utils.units.convert",
    inputs: [
      { label: "Value", key: "value", type: "number" },
      { label: "From Unit", key: "fromUnit", type: "text" },
      { label: "To Unit", key: "toUnit", type: "text" },
      { label: "Category", key: "category", type: "text" },
    ],
  },
  {
    id: "currency",
    name: "Currency Converter",
    category: "Finance",
    description: "Convert between major world currencies",
    endpoint: "utils.currency.convert",
    procedurePath: "utils.currency.convert",
    inputs: [
      { label: "Amount", key: "amount", type: "number" },
      { label: "From Currency", key: "fromCurrency", type: "text" },
      { label: "To Currency", key: "toCurrency", type: "text" },
    ],
  },
  {
    id: "textcase",
    name: "Text Case Converter",
    category: "Text",
    description: "Convert text to camelCase, snake_case, kebab-case, PascalCase, or slug",
    endpoint: "utils.text.caseConvert",
    procedurePath: "utils.text.caseConvert",
    inputs: [
      { label: "Text", key: "text", type: "text" },
      { label: "Format (camelCase|snake_case|kebab-case|PascalCase|slug)", key: "format", type: "text" },
    ],
  },
  {
    id: "base64",
    name: "Base64 Encoder/Decoder",
    category: "Text",
    description: "Encode and decode Base64 strings",
    endpoint: "utils.text.base64Encode",
    procedurePath: "utils.text.base64Encode",
    inputs: [{ label: "Text to Encode", key: "text", type: "text" }],
  },
  {
    id: "profanity",
    name: "Profanity Filter",
    category: "Text",
    description: "Filter and censor inappropriate language",
    endpoint: "utils.text.filterProfanity",
    procedurePath: "utils.text.filterProfanity",
    inputs: [
      { label: "Text", key: "text", type: "text" },
      { label: "Censor (true/false)", key: "censor", type: "text" },
    ],
  },
  {
    id: "uuid",
    name: "UUID/CUID Generator",
    category: "Developer",
    description: "Generate unique identifiers (UUID v4 or CUID)",
    endpoint: "utils.dev.generateUUID",
    procedurePath: "utils.dev.generateUUID",
    inputs: [],
  },
  {
    id: "lorem",
    name: "Lorem Ipsum Generator",
    category: "Developer",
    description: "Generate placeholder text for UI mockups",
    endpoint: "utils.dev.loremIpsum",
    procedurePath: "utils.dev.loremIpsum",
    inputs: [{ label: "Word Count", key: "wordCount", type: "number" }],
  },
  {
    id: "json2csv",
    name: "JSON to CSV Converter",
    category: "Developer",
    description: "Convert JSON arrays to CSV format",
    endpoint: "utils.dev.jsonToCSV",
    procedurePath: "utils.dev.jsonToCSV",
    inputs: [{ label: "JSON Array (paste JSON)", key: "json", type: "text" }],
  },
  {
    id: "color",
    name: "Color Palette Generator",
    category: "Design",
    description: "Generate complementary and triadic color palettes from a hex value",
    endpoint: "utils.dev.colorPalette",
    procedurePath: "utils.dev.colorPalette",
    inputs: [{ label: "Hex Color (#RRGGBB)", key: "hex", type: "text" }],
  },
  {
    id: "gravatar",
    name: "Gravatar URL Resolver",
    category: "Developer",
    description: "Get the Gravatar URL for an email address",
    endpoint: "utils.dev.gravatarURL",
    procedurePath: "utils.dev.gravatarURL",
    inputs: [
      { label: "Email", key: "email", type: "email" },
      { label: "Size (px)", key: "size", type: "number" },
    ],
  },
  {
    id: "placeholder",
    name: "Placeholder Image Generator",
    category: "Design",
    description: "Generate dynamic placeholder images for UI testing",
    endpoint: "utils.dev.placeholderImage",
    procedurePath: "utils.dev.placeholderImage",
    inputs: [
      { label: "Width", key: "width", type: "number" },
      { label: "Height", key: "height", type: "number" },
      { label: "Background Color (hex)", key: "bgColor", type: "text" },
      { label: "Text (optional)", key: "text", type: "text" },
    ],
  },
  {
    id: "morse",
    name: "Morse Code Converter",
    category: "Utilities",
    description: "Convert text to and from Morse code",
    endpoint: "utils.dev.morseEncode",
    procedurePath: "utils.dev.morseEncode",
    inputs: [{ label: "Text", key: "text", type: "text" }],
  },
  {
    id: "bmi",
    name: "BMI Calculator",
    category: "Health",
    description: "Calculate Body Mass Index with health category",
    endpoint: "utils.dev.calculateBMI",
    procedurePath: "utils.dev.calculateBMI",
    inputs: [
      { label: "Weight (kg)", key: "weight", type: "number" },
      { label: "Height (m)", key: "height", type: "number" },
    ],
  },
  {
    id: "useragent",
    name: "User Agent Parser",
    category: "Developer",
    description: "Parse user agent strings to extract browser, OS, and device info",
    endpoint: "utils.dev.parseUserAgent",
    procedurePath: "utils.dev.parseUserAgent",
    inputs: [{ label: "User Agent String", key: "userAgent", type: "text" }],
  },
  {
    id: "hash",
    name: "Hash Generator",
    category: "Security",
    description: "Generate MD5, SHA-256, or SHA-512 hashes from any text",
    endpoint: "utils.hash.generate",
    procedurePath: "utils.hash.generate",
    inputs: [
      { label: "Text", key: "text", type: "text" },
      { label: "Algorithm (md5|sha256|sha512)", key: "algorithm", type: "text" },
    ],
  },
  {
    id: "jwtencode",
    name: "JWT Encoder",
    category: "Security",
    description: "Encode a JSON payload into a signed JWT token",
    endpoint: "utils.jwt.encode",
    procedurePath: "utils.jwt.encode",
    method: "POST",
    inputs: [
      { label: "Payload (JSON)", key: "payload", type: "text" },
      { label: "Secret", key: "secret", type: "text" },
    ],
  },
  {
    id: "jwtdecode",
    name: "JWT Decoder",
    category: "Security",
    description: "Decode a JWT token to inspect its payload and metadata",
    endpoint: "utils.jwt.decode",
    procedurePath: "utils.jwt.decode",
    method: "POST",
    inputs: [{ label: "Token", key: "token", type: "text" }],
  },
  {
    id: "jwtvalidate",
    name: "JWT Validator",
    category: "Security",
    description: "Validate a JWT signature against a secret key",
    endpoint: "utils.jwt.validate",
    procedurePath: "utils.jwt.validate",
    method: "POST",
    inputs: [
      { label: "Token", key: "token", type: "text" },
      { label: "Secret", key: "secret", type: "text" },
    ],
  },
  {
    id: "fakedata",
    name: "Fake Data Generator",
    category: "Developer",
    description: "Generate realistic fake data for testing and prototyping",
    endpoint: "utils.fakeData.generate",
    procedurePath: "utils.fakeData.generate",
    inputs: [
      { label: "Type (name|email|company|address|phone|uuid|sentence)", key: "type", type: "text" },
      { label: "Count", key: "count", type: "number" },
    ],
  },
  {
    id: "markdown",
    name: "Markdown to HTML",
    category: "Developer",
    description: "Convert Markdown text to sanitized HTML",
    endpoint: "utils.markdown.toHTML",
    procedurePath: "utils.markdown.toHTML",
    method: "POST",
    inputs: [{ label: "Markdown", key: "markdown", type: "text" }],
  },
  {
    id: "htmlsanitize",
    name: "HTML Sanitizer",
    category: "Security",
    description: "Strip dangerous tags and attributes from untrusted HTML",
    endpoint: "utils.html.sanitize",
    procedurePath: "utils.html.sanitize",
    method: "POST",
    inputs: [{ label: "Raw HTML", key: "dirty", type: "text" }],
  },
  {
    id: "cron",
    name: "Cron Expression Parser",
    category: "Developer",
    description: "Parse cron expressions and get human-readable descriptions with next run times",
    endpoint: "utils.cron.parse",
    procedurePath: "utils.cron.parse",
    inputs: [{ label: "Cron Expression", key: "expression", type: "text" }],
  },
  {
    id: "regex",
    name: "Regex Tester",
    category: "Developer",
    description: "Test regular expressions with live match results and explanations",
    endpoint: "utils.regex.test",
    procedurePath: "utils.regex.test",
    inputs: [
      { label: "Pattern", key: "pattern", type: "text" },
      { label: "Flags", key: "flags", type: "text" },
      { label: "Test String", key: "testString", type: "text" },
    ],
  },
  {
    id: "diff",
    name: "Diff Calculator",
    category: "Developer",
    description: "Calculate line, word, or JSON diffs between two texts",
    endpoint: "utils.diff.calculate",
    procedurePath: "utils.diff.calculate",
    method: "POST",
    inputs: [
      { label: "Text A", key: "textA", type: "text" },
      { label: "Text B", key: "textB", type: "text" },
      { label: "Type (lines|words|json)", key: "type", type: "text" },
    ],
  },
  {
    id: "ipvalidate",
    name: "IP Validator",
    category: "Validation",
    description: "Validate IPv4 and IPv6 addresses and classify their type",
    endpoint: "utils.ip.validate",
    procedurePath: "utils.ip.validate",
    inputs: [{ label: "IP Address", key: "ip", type: "text" }],
  },
  {
    id: "batch",
    name: "Batch API",
    category: "Developer",
    description: "Execute multiple API calls in a single request",
    endpoint: "utils.batch.execute",
    procedurePath: "utils.batch.execute",
    method: "POST",
    inputs: [{ label: "Requests (JSON array)", key: "requests", type: "text" }],
  },
];

async function callTRPCEndpoint(procedurePath: string, input: Record<string, unknown>, method: "GET" | "POST" = "GET") {
  const wrappedInput = { json: input };

  if (method === "GET") {
    const encodedInput = encodeURIComponent(JSON.stringify(wrappedInput));
    const url = `/api/trpc/${procedurePath}?input=${encodedInput}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (data.error) {
      const errorMsg = data.error.json?.message || data.error.message || "Unknown error";
      throw new Error(errorMsg);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return data.result?.data || data.result || data;
  }

  const url = `/api/trpc/${procedurePath}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wrappedInput),
  });
  const data = await response.json();
  if (data.error) {
    const errorMsg = data.error.json?.message || data.error.message || "Unknown error";
    throw new Error(errorMsg);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return data.result?.data || data.result || data;
}

export default function Home() {
  const [selectedAPI, setSelectedAPI] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string | number>>({});
  const [results, setResults] = useState<TestResult>({ loading: false, data: null, error: null });
  const [filter, setFilter] = useState<string>("");

  const filteredAPIs = API_ENDPOINTS.filter(
    (api) =>
      api.name.toLowerCase().includes(filter.toLowerCase()) ||
      api.category.toLowerCase().includes(filter.toLowerCase()) ||
      api.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleInputChange = (key: string, value: string | number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestAPI = async (api: APIEndpoint) => {
    setResults({ loading: true, data: null, error: null });

    try {
      // Build input object with proper types
      const input: Record<string, unknown> = {};
      api.inputs.forEach((field) => {
        if (inputs[field.key] !== undefined && inputs[field.key] !== "") {
          if (field.type === "number") {
            input[field.key] = Number(inputs[field.key]);
          } else if (["json", "payload", "requests"].includes(field.key)) {
            input[field.key] = JSON.parse(String(inputs[field.key]));
          } else if (field.key === "censor") {
            input[field.key] = String(inputs[field.key]) === "true";
          } else {
            input[field.key] = String(inputs[field.key]);
          }
        }
      });

      const result = await callTRPCEndpoint(api.procedurePath, input, api.method);
      setResults({ loading: false, data: result, error: null });
    } catch (err) {
      setResults({ loading: false, data: null, error: (err as Error).message });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <header className="border-b-8 border-red-600 px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-8xl font-black tracking-tighter mb-4">TRIVIAL API GATEWAY</h1>
          <p className="text-2xl font-light tracking-wide">30 Essential Developer Utilities. Zero Friction.</p>
        </div>
      </header>

      {/* RED DIVIDER */}
      <div className="h-1 bg-red-600 w-full"></div>

      {/* SEARCH */}
      <div className="px-8 py-12 border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          <Input
            placeholder="Search APIs by name, category, or description..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-950 border-2 border-gray-800 text-white text-lg p-4 placeholder-gray-600 focus:border-red-600 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* API GRID */}
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {filteredAPIs.map((api) => {
              const isSelected = selectedAPI === api.id;
              const borderClass = isSelected ? "border-red-600 bg-gray-950" : "border-gray-800 bg-black hover:border-gray-600";
              return (
                <div
                  key={api.id}
                  className={`border-4 p-8 cursor-pointer transition-all ${borderClass}`}
                  onClick={() => {
                    setSelectedAPI(api.id);
                    setInputs({});
                    setResults({ loading: false, data: null, error: null });
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-2">{api.name}</h3>
                      <span className="inline-block px-3 py-1 bg-red-600 text-black text-xs font-bold tracking-wider">
                        {api.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{api.description}</p>
                  <div className="text-xs text-gray-600 font-mono">{api.endpoint}</div>
                </div>
              );
            })}
          </div>

          {/* RED DIVIDER */}
          <div className="h-1 bg-red-600 w-full my-12"></div>

          {/* TEST PANEL */}
          {selectedAPI && (
            <div className="border-4 border-red-600 bg-gray-950 p-8">
              <h2 className="text-4xl font-black tracking-tighter mb-8">
                TEST: {API_ENDPOINTS.find((a) => a.id === selectedAPI)?.name}
              </h2>

              <div className="mb-8">
                {API_ENDPOINTS.find((a) => a.id === selectedAPI)?.inputs.map((input) => (
                  <div key={input.key} className="mb-6">
                    <label className="block text-sm font-bold tracking-wide mb-2">{input.label}</label>
                    {input.type === "text" || input.type === "email" ? (
                      <Input
                        type={input.type}
                        placeholder={`Enter ${input.label.toLowerCase()}`}
                        value={inputs[input.key] || ""}
                        onChange={(e) => handleInputChange(input.key, e.target.value)}
                        className="bg-black border-2 border-gray-800 text-white p-3 placeholder-gray-700 focus:border-red-600 focus:outline-none w-full"
                      />
                    ) : (
                      <Input
                        type="number"
                        placeholder={`Enter ${input.label.toLowerCase()}`}
                        value={inputs[input.key] || ""}
                        onChange={(e) => handleInputChange(input.key, e.target.value ? Number(e.target.value) : "")}
                        className="bg-black border-2 border-gray-800 text-white p-3 placeholder-gray-700 focus:border-red-600 focus:outline-none w-full"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  const api = API_ENDPOINTS.find((a) => a.id === selectedAPI);
                  if (api) handleTestAPI(api);
                }}
                disabled={results.loading}
                className="bg-red-600 text-black font-black text-lg px-8 py-4 tracking-wider hover:bg-red-700 disabled:opacity-50 w-full border-2 border-red-600"
              >
                {results.loading ? (
                  <>
                    <Spinner className="w-5 h-5 inline mr-2" />
                    EXECUTING...
                  </>
                ) : (
                  "EXECUTE"
                )}
              </Button>

              {results.data && (
                <div className="mt-8 bg-black border-2 border-green-600 p-6">
                  <h3 className="text-lg font-black tracking-tight mb-4 text-green-600">RESPONSE</h3>
                  <pre className="text-green-600 text-sm overflow-auto max-h-96 font-mono">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </div>
              )}

              {results.error && (
                <div className="mt-8 bg-black border-2 border-red-600 p-6">
                  <h3 className="text-lg font-black tracking-tight mb-4 text-red-600">ERROR</h3>
                  <p className="text-red-600 text-sm">{results.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t-8 border-red-600 px-8 py-12 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-sm tracking-wide">
            Built for developers. No authentication required. All endpoints are public.
          </p>
        </div>
      </div>
    </div>
  );
}
