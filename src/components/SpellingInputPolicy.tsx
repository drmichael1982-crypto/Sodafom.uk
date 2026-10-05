import { useEffect } from 'react';
import { useLocation } from 'react-router';
import catalog from '@/lib/archie/game-catalog.json';
const SPELLING_ROUTES = new Set(catalog.filter(game=>game.subject === 'spelling').map(game=>game.route));
/** Covers delayed game inputs as well as the spelling whiteboard. Mobile keyboards
 * may still show their own suggestions: these are the controls browsers expose. */
export default function SpellingInputPolicy() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/lesson' && !SPELLING_ROUTES.has(pathname)) return;
    const protect = () => document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#app input, #app textarea').forEach(input => {
      if (input.closest('.archie-dialog') || (input instanceof HTMLInputElement && ['password','email','number','checkbox','radio','file','range','button','submit','hidden'].includes(input.type))) return;
      input.setAttribute('autocomplete','off');input.setAttribute('autocorrect','off');input.setAttribute('autocapitalize','off');input.spellcheck=false;
    });
    protect();
    const root=document.getElementById('app');
    if (!root) return;
    const observer=new MutationObserver(protect);observer.observe(root,{childList:true,subtree:true});
    return ()=>observer.disconnect();
  },[pathname]);
  return null;
}
