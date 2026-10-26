const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.in').forEach((el,i)=>el.style.animationDelay=(i*50)+'ms');
const cv=document.querySelector('.cover-img');
if(cv&&!reduce)addEventListener('scroll',()=>{cv.style.transform=`translateY(${Math.min(scrollY,400)*.3}px)`},{passive:true});
document.querySelectorAll('a[href$=".html"]').forEach(a=>a.addEventListener('click',e=>{if(reduce||e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,180)}));
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));
