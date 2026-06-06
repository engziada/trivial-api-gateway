import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as api from "./utils/apiImplementations";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // API Utilities Router
  utils: router({
    // 1. TOTP Generator/Validator
    totp: router({
      generate: publicProcedure.input(z.object({ secret: z.string() })).query(({ input }) => ({
        token: api.generateTOTP(input.secret),
      })),
      validate: publicProcedure.input(z.object({ secret: z.string(), token: z.string() })).query(({ input }) => ({
        valid: api.validateTOTP(input.secret, input.token),
      })),
    }),

    // 2. Disposable Email Detector
    email: router({
      checkDisposable: publicProcedure.input(z.object({ email: z.string().email() })).query(({ input }) => ({
        isDisposable: api.isDisposableEmail(input.email),
        email: input.email,
      })),
    }),

    // 3. QR Code Generator
    qrcode: router({
      generate: publicProcedure
        .input(z.object({
          text: z.string(),
          size: z.number().default(200),
          color: z.string().default("000000"),
          bgColor: z.string().default("FFFFFF"),
        }))
        .query(async ({ input }) => ({
          url: await api.generateQRCode(input.text, input.size, input.color, input.bgColor),
        })),
    }),

    // 4. IP Geolocation
    geo: router({
      getIPInfo: publicProcedure.input(z.object({ ip: z.string() })).query(async ({ input }) => {
        const data = await api.getIPGeoData(input.ip);
        return data;
      }),
    }),

    // 5. Working Days Calculator
    workingDays: router({
      calculate: publicProcedure
        .input(z.object({
          startDate: z.string(),
          endDate: z.string(),
          holidays: z.array(z.string()).optional(),
        }))
        .query(({ input }) => ({
          days: api.calculateWorkingDays(input.startDate, input.endDate, input.holidays),
        })),
    }),

    // 6. Password Strength Meter
    password: router({
      strength: publicProcedure.input(z.object({ password: z.string() })).query(({ input }) => {
        const result = api.evaluatePasswordStrength(input.password);
        return result;
      }),
    }),

    // 7. Unit Converter
    units: router({
      convert: publicProcedure
        .input(z.object({
          value: z.number(),
          fromUnit: z.string(),
          toUnit: z.string(),
          category: z.string().default("length"),
        }))
        .query(({ input }) => api.convertUnits(input.value, input.fromUnit, input.toUnit, input.category)),
      convertTemperature: publicProcedure
        .input(z.object({
          value: z.number(),
          fromUnit: z.enum(["c", "f", "k"]),
          toUnit: z.enum(["c", "f", "k"]),
        }))
        .query(({ input }) => api.convertTemperature(input.value, input.fromUnit, input.toUnit)),
    }),

    // 8. Currency Converter
    currency: router({
      convert: publicProcedure
        .input(z.object({
          amount: z.number(),
          fromCurrency: z.string(),
          toCurrency: z.string(),
        }))
        .query(({ input }) => api.convertCurrency(input.amount, input.fromCurrency, input.toCurrency)),
    }),

    // 9. Text Utilities
    text: router({
      caseConvert: publicProcedure
        .input(z.object({
          text: z.string(),
          format: z.enum(["camelCase", "snake_case", "kebab-case", "PascalCase", "slug"]),
        }))
        .query(({ input }) => ({
          result: api.convertTextCase(input.text, input.format),
        })),
      base64Encode: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
        encoded: api.encodeBase64(input.text),
      })),
      base64Decode: publicProcedure.input(z.object({ encoded: z.string() })).query(({ input }) => ({
        decoded: api.decodeBase64(input.encoded),
      })),
      filterProfanity: publicProcedure
        .input(z.object({ text: z.string(), censor: z.boolean().default(true) }))
        .query(({ input }) => api.filterProfanity(input.text, input.censor)),
    }),

    // 10. Developer Tools
    dev: router({
      generateUUID: publicProcedure.query(() => ({
        uuid: api.generateUUID(),
      })),
      generateCUID: publicProcedure.query(() => ({
        cuid: api.generateCUID(),
      })),
      loremIpsum: publicProcedure.input(z.object({ wordCount: z.number().default(50) })).query(({ input }) => ({
        text: api.generateLoremIpsum(input.wordCount),
      })),
      jsonToCSV: publicProcedure.input(z.object({ json: z.array(z.record(z.string(), z.unknown())) })).query(({ input }) => ({
        csv: api.jsonToCSV(input.json),
      })),
      colorPalette: publicProcedure.input(z.object({ hex: z.string() })).query(({ input }) => {
        const palette = api.generateColorPalette(input.hex);
        return palette;
      }),
      gravatarURL: publicProcedure.input(z.object({ email: z.string(), size: z.number().default(200) })).query(({ input }) => ({
        url: api.getGravatarURL(input.email, input.size),
      })),
      placeholderImage: publicProcedure
        .input(z.object({
          width: z.number(),
          height: z.number(),
          bgColor: z.string().default("cccccc"),
          text: z.string().optional(),
        }))
        .query(({ input }) => ({
          url: api.getPlaceholderImageURL(input.width, input.height, input.bgColor, input.text),
        })),
      morseEncode: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
        morse: api.textToMorse(input.text),
      })),
      morseDecode: publicProcedure.input(z.object({ morse: z.string() })).query(({ input }) => ({
        text: api.morseToText(input.morse),
      })),
      calculateBMI: publicProcedure.input(z.object({ weight: z.number(), height: z.number() })).query(({ input }) => {
        const result = api.calculateBMI(input.weight, input.height);
        return result;
      }),
      parseUserAgent: publicProcedure.input(z.object({ userAgent: z.string() })).query(({ input }) => {
        const info = api.parseUserAgent(input.userAgent);
        return info;
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;

