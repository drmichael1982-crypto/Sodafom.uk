(function(){
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  function mount(){
    if (document.getElementById('sodafom-fairground-entry')) return;
    var a=document.createElement('a');
    a.id='sodafom-fairground-entry';
    a.href='/fairground.html';
    a.setAttribute('aria-label','Open Sodafom Learning Fairground');
    a.textContent='🎡 Funfair World';
    a.style.cssText='position:fixed;right:14px;bottom:14px;z-index:2147483000;background:linear-gradient(135deg,#123f8d,#7d4bd1);color:white;border:3px solid #f4c542;border-radius:999px;padding:11px 15px;font:900 14px Arial,sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.35);transform:translateZ(0)';
    a.addEventListener('mouseenter',function(){a.style.transform='scale(1.05)'});
    a.addEventListener('mouseleave',function(){a.style.transform='scale(1)'});
    document.body.appendChild(a);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();