/**
 * Legacy automatic push opt-in is intentionally silent. Parents manage reminders
 * explicitly at /notifications; never prompt children to preserve a streak or opt in.
 * Keep the export so existing callers do not need unrelated page edits.
 */
export default function PushNotificationBanner() { return null; }
