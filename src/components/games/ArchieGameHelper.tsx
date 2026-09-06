/**
 * Legacy compatibility component.
 *
 * Older games placed their own Archie control inside question cards. Those
 * controls could overlap answer buttons. RootLayout now provides one large,
 * consistent Ask Archie control on every individual game route, so legacy
 * placements intentionally render nothing.
 */
export default function ArchieGameHelper(_props: { className?: string }) {
  return null;
}
