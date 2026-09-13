/**
 * Automatic push prompts are intentionally disabled.
 *
 * A child-facing streak prompt must not request browser permission or lead a
 * child toward notification enrolment. The retained component keeps existing
 * layout callers compatible while parent-controlled delivery remains offline.
 */
export default function PushNotificationBanner() {
  return null;
}
