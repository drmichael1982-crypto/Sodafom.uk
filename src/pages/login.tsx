import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router";
import { Helmet } from '@dr.pogodin/react-helmet';

/**
 * /login — thin redirect shim.
 * Forwards to /hub/login, passing any ?redirect= query param as router state
 * so the hub login page can send the user to the right place after sign-in.
 */
export default function LoginRedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  React.useEffect(() => {
    const redirect = searchParams.get('redirect');
    const promo = searchParams.get('promo');
    const hubLoginParams = new URLSearchParams();
    if (promo) hubLoginParams.set('promo', promo);
    const hubLoginPath = `/hub/login${hubLoginParams.toString() ? `?${hubLoginParams}` : ''}`;
    navigate(hubLoginPath, {
      replace: true,
      state: redirect ? {
        from: {
          pathname: redirect
        }
      } : undefined
    });
  }, []);
  return <>
      <Helmet>
        <title>Sign In — Sodafom</title>
        <meta name="description" content="Sign in to your Sodafom account to access fun learning games for children aged 5–13." />
        <link rel="canonical" href="https://sodafom.uk/hub/login" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="sr-only">Sign In to Sodafom</h1>
    </>;
}
