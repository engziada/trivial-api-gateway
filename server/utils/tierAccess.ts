import { getDb } from "../db";
import { apiTierAccess, userSubscriptions, subscriptionTiers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Tier configuration for Free and Pro users
 */
export const TIER_CONFIG = {
  free: {
    name: "free",
    displayName: "Free",
    dailyRateLimit: 100,
    monthlyRateLimit: 3000,
    description: "Free tier with 5 basic APIs",
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    dailyRateLimit: 10000,
    monthlyRateLimit: 300000,
    description: "Pro tier with all 20 APIs",
  },
};

/**
 * Free tier APIs - 5 basic utilities
 */
export const FREE_TIER_ENDPOINTS = [
  "utils.dev.generateUUID",
  "utils.dev.loremIpsum",
  "utils.text.base64Encode",
  "utils.text.caseConvert",
  "utils.dev.morseEncode",
];

/**
 * Get user's subscription tier
 * Defaults to Free tier if no subscription found
 */
export async function getUserTier(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "free";

  try {
    const subscription = await db
      .select({ tierId: userSubscriptions.tierId })
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (subscription.length === 0) return "free";

    const tier = await db
      .select({ name: subscriptionTiers.name })
      .from(subscriptionTiers)
      .where(eq(subscriptionTiers.id, subscription[0].tierId))
      .limit(1);

    return tier.length > 0 ? tier[0].name : "free";
  } catch (error) {
    console.error("[Tier Access] Error getting user tier:", error);
    return "free";
  }
}

/**
 * Check if endpoint is accessible for a given tier
 */
export async function canAccessEndpoint(
  tier: string,
  endpoint: string
): Promise<boolean> {
  // Pro tier has access to all endpoints
  if (tier === "pro") return true;

  // Free tier only has access to specific endpoints
  return FREE_TIER_ENDPOINTS.includes(endpoint);
}

/**
 * Get tier info from database
 */
export async function getTierInfo(tierName: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const tier = await db
      .select()
      .from(subscriptionTiers)
      .where(eq(subscriptionTiers.name, tierName))
      .limit(1);

    return tier.length > 0 ? tier[0] : null;
  } catch (error) {
    console.error("[Tier Access] Error getting tier info:", error);
    return null;
  }
}

/**
 * Get all accessible endpoints for a tier
 */
export async function getAccessibleEndpoints(tier: string): Promise<string[]> {
  if (tier === "pro") {
    // Return all endpoints
    return [
      "utils.totp.generate",
      "utils.email.checkDisposable",
      "utils.qrcode.generate",
      "utils.geo.getIPInfo",
      "utils.workingDays.calculate",
      "utils.password.strength",
      "utils.units.convert",
      "utils.currency.convert",
      "utils.text.caseConvert",
      "utils.text.base64Encode",
      "utils.text.filterProfanity",
      "utils.dev.generateUUID",
      "utils.dev.loremIpsum",
      "utils.dev.jsonToCSV",
      "utils.dev.colorPalette",
      "utils.dev.gravatarURL",
      "utils.dev.placeholderImage",
      "utils.dev.morseEncode",
      "utils.dev.calculateBMI",
      "utils.dev.parseUserAgent",
    ];
  }

  return FREE_TIER_ENDPOINTS;
}

/**
 * Format tier badge for UI
 */
export function getTierBadge(endpoint: string): "Free" | "Pro" {
  return FREE_TIER_ENDPOINTS.includes(endpoint) ? "Free" : "Pro";
}

/**
 * Check if endpoint is pro-only
 */
export function isProOnly(endpoint: string): boolean {
  return !FREE_TIER_ENDPOINTS.includes(endpoint);
}
