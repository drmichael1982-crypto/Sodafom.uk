(function(){
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  function makeButton(id,href,label,bottom,bg){
    var a=document.createElement('a');
    a.id=id;a.href=href;a.setAttribute('aria-label',label);a.textContent=label;
    a.style.cssText='position:fixed;right:14px;bottom:'+bottom+'px;z-index:2147483000;background:'+bg+';color:white;border:3px solid #f4c542;border-radius:999px;padding:11px 15px;font:900 14px Arial,sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.35);transform:translateZ(0)';
    a.addEventListener('mouseenter',function(){a.style.transform='scale(1.05)'});a.addEventListener('mouseleave',function(){a.style.transform='scale(1)'});return a;
  }
  function mount(){
    if(document.getElementById('sodafom-village-entry'))return;
    document.body.appendChild(makeButton('sodafom-village-entry','/village-sweet-shop.html','🚶 Village + Sweet Shop',64,'linear-gradient(135deg,#123f8d,#7d4bd1)'));
    document.body.appendChild(makeButton('sodafom-fairground-entry','/fairground.html','🎡 Funfair World',14,'linear-gradient(135deg,#8b3f8f,#123f8d)'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();