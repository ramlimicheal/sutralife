/**
 * NSFW Content Gating - 3-Layer System
 *
 * Layer 1: Age Gate (client-side)
 *   - User must confirm they are 18+ before accessing the platform
 *   - Stored in localStorage as "sanctuary_age_verified"
 *   - Enforced by the Age Gate page (/) which redirects to /discover on verification
 *
 * Layer 2: User Setting (client-side + server-side)
 *   - User must explicitly enable NSFW content in Settings > Content
 *   - Stored in user profile (nsfw_enabled field)
 *   - Even with age verification, NSFW content is hidden unless this is toggled on
 *
 * Layer 3: Server Gate (server-side)
 *   - API routes check both user tier and nsfw_enabled before serving NSFW content
 *   - Only Premium and Collector tier users can enable NSFW
 *   - Character responses are filtered based on this flag
 */

import type { User, Character, UserTier } from "@/types";

const NSFW_ALLOWED_TIERS: UserTier[] = ["premium", "collector"];

/**
 * Check if a user's tier allows NSFW content
 */
export function canAccessNSFW(tier: UserTier): boolean {
  return NSFW_ALLOWED_TIERS.includes(tier);
}

/**
 * Check if NSFW content should be shown for a given user
 * All 3 layers must pass:
 * 1. User must be age verified
 * 2. User must have NSFW enabled in settings
 * 3. User must be on a qualifying tier
 */
export function shouldShowNSFW(user: User): boolean {
  return user.age_verified && user.nsfw_enabled && canAccessNSFW(user.tier);
}

/**
 * Filter characters based on NSFW settings
 * If NSFW is not enabled, filter out NSFW characters
 */
export function filterCharacters(
  characters: Character[],
  nsfwEnabled: boolean
): Character[] {
  if (nsfwEnabled) return characters;
  return characters.filter((c) => !c.is_nsfw);
}

/**
 * Check if a specific character can be accessed by the user
 */
export function canAccessCharacter(
  character: Character,
  user: User
): { allowed: boolean; reason?: string } {
  // NSFW character requires NSFW access
  if (character.is_nsfw && !shouldShowNSFW(user)) {
    if (!user.age_verified) {
      return { allowed: false, reason: "Age verification required" };
    }
    if (!user.nsfw_enabled) {
      return { allowed: false, reason: "Enable NSFW content in settings" };
    }
    if (!canAccessNSFW(user.tier)) {
      return { allowed: false, reason: "Premium or Collector subscription required for NSFW content" };
    }
  }

  // Premium character requires premium tier
  if (character.is_premium && user.tier === "free") {
    return { allowed: false, reason: "This character requires a subscription" };
  }

  return { allowed: true };
}
