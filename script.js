const header=document.querySelector('.site-header');
const toggle=document.querySelector('#menuToggle');
const links=document.querySelector('#navLinks');
const year=document.querySelectorAll('.year');
year.forEach(el=>el.textContent=new Date().getFullYear());
window.addEventListener('scroll',()=>header?.classList.toggle('scrolled',window.scrollY>30),{passive:true});
toggle?.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
links?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const glow=document.querySelector('.cursor-glow');
window.addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';}},{passive:true});
// Optional cinematic video: add assets/video/ada-cinematic-loop.mp4. The reference image remains the fallback poster.
const video=document.querySelector('#cinematicVideo');
if(video){video.addEventListener('error',()=>video.removeAttribute('src'));video.play().catch(()=>{});}

/* page transitions: iris wipe, back-to-archive link, ESC shortcut */
(()=>{const o=document.createElement('div');o.className='pt in';document.body.appendChild(o);
requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.remove('in')));
addEventListener('pageshow',e=>{if(e.persisted)o.classList.remove('out')});
const go=u=>{o.classList.add('out');setTimeout(()=>location.href=u,520)};
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');
if(!a||a.target||e.metaKey||e.ctrlKey||e.shiftKey||e.button||!/^(https?|file):$/.test(a.protocol)||a.origin!==location.origin||(a.pathname===location.pathname&&a.hash))return;
e.preventDefault();go(a.href)});
const b=document.createElement('a');b.className='back-archive';b.href='index.html';b.textContent='◂ RETURN TO ARCHIVE [ESC]';document.body.appendChild(b);
addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.nav-links.open'))go('index.html')});
})();
