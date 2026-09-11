import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration, useLocation } from "react-router";
import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { CartProvider } from '@/contexts/cart-context';
import { AccessibilityProvider } from '@/lib/accessibility';
import { VoiceProvider } from '@/lib/voice-context';
import { ArchieProvider } from '@/contexts/ArchieContext';
import { ProgressionProvider } from '@/contexts/ProgressionContext';
import AccessibilityBar from '@/components/AccessibilityBar';
import ArchieHelper from '@/components/ArchieHelper';
import MobileTrialBar from '@/components/MobileTrialBar';
import { usePageView } from '@/hooks/usePageView';

interface RootLayoutProps {
  children: ReactElement;
}
export default function RootLayout({
  children
}: RootLayoutProps) {
  usePageView();
  const location = useLocation();
  // Child-facing app routes provide their own navigation and artwork.  Keeping
  // the old website header/footer on these screens obscures the page title on
  // phones and makes the refreshed app look like the legacy site.
  const immersiveRoutes = [
    '/',
    '/cartoon-mode',
    '/archie-menu',
    '/lessons',
    '/ai-teacher',
    '/tutor',
    '/teacher-mode',
    '/cartoons',
    '/homework-helper',
    '/birthday',
    '/birthday-party',
    '/pocket-money',
    '/pocket-money/setup',
    '/chores',
    '/parent-dashboard/chores',
    '/archie-outfit',
    '/design-archie-outfit',
    '/seasonal-themes',
    '/holiday-travel',
    '/ask-archie',
    '/chat',
    '/games',
    '/subjects',
    '/daily-challenge',
    '/rewards',
    '/badges',
    '/certificates',
    '/star-bank',
    '/hub',
    '/parent-dashboard',
    '/parent-area',
    '/reading',
    '/stories',
    '/game-islands',
    '/archie-theatre',
    '/sodafom-shop',
    '/sodafom-settings',
    '/archie-friends',
    '/lesson-library',
    '/homework-tools',
    '/teacher-hub',
  ];
  const immersiveApp = immersiveRoutes.some((route) =>
    route === '/'
      ? location.pathname === route
      : location.pathname === route || location.pathname.startsWith(`${route}/`)
  );
  const isIndividualGame = location.pathname.startsWith('/games/');
  return (
    <AccessibilityProvider>
      <VoiceProvider>
        <ProgressionProvider>
          <ArchieProvider>
            <CartProvider>
              <Website>
                <Helmet>
                  <title>Sodafom — Learn The Key To Success</title>
                  <meta name="description" content="Fun, curriculum-aligned learning for children aged 5–13. Maths, Spelling and Reading games and activities." />
                </Helmet>
                <ScrollRestoration />
                {!immersiveApp && <Header />}
                <div className={immersiveApp ? 'sodafom-immersive-route' : undefined}>
                  {children}
                </div>
                {!immersiveApp && <Footer />}
                {/* Floating UI — accessibility toolbar + unified Archie helper + mobile CTA */}
                {/* Immersive app screens provide their own controls and must not
                    have legacy floating elements covering child-facing buttons. */}
                {!immersiveApp && <AccessibilityBar gameMode={isIndividualGame} />}
                {!immersiveApp && <ArchieHelper gameMode={isIndividualGame} />}
                {!immersiveApp && <MobileTrialBar />}
              </Website>
            </CartProvider>
          </ArchieProvider>
        </ProgressionProvider>
      </VoiceProvider>
    </AccessibilityProvider>
  );
}
