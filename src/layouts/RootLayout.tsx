import { PagePictureFrame } from '@/components/PagePictureJigsaw';
import { isArchiePage } from '@/pages/archie/ArchiePages';
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
import SpellingInputPolicy from '@/components/SpellingInputPolicy';
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
  // Hide the top header on the homepage — it has its own full-screen nav experience
  const immersiveHome = isArchiePage(location.pathname) || location.pathname.startsWith('/games/') || location.pathname === '/cartoon-mode';
  const ownerPage = location.pathname === '/admin' || location.pathname === '/admin/payments';
  const hideHeader = immersiveHome || ownerPage;
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
                <SpellingInputPolicy />
                {!hideHeader && <Header />}
                {immersiveHome ? <PagePictureFrame>{children}</PagePictureFrame> : children}
                {!immersiveHome && !ownerPage && <Footer />}
                {/* Floating UI — accessibility toolbar + unified Archie helper + mobile CTA */}
                {/* Immersive home/cartoon mode already has its own Settings control. */}
                {!immersiveHome && !ownerPage && <AccessibilityBar gameMode={isIndividualGame} />}
                {!ownerPage && <ArchieHelper gameMode={isIndividualGame} hideLauncher={isArchiePage(location.pathname) || isIndividualGame} />}
                {!immersiveHome && !ownerPage && <MobileTrialBar />}
              </Website>
            </CartProvider>
          </ArchieProvider>
        </ProgressionProvider>
      </VoiceProvider>
    </AccessibilityProvider>
  );
}
