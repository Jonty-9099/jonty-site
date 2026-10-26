const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.in').forEach((el,i)=>el.style.animationDelay=(i*60)+'ms');
const cv=document.querySelector('.cover div');
if(cv&&!reduce)addEventListener('scroll',()=>{cv.style.transform=`translateY(${scrollY*.35}px)`},{passive:true});
document.querySelectorAll('a[href$=".html"]').forEach(a=>a.addEventListener('click',e=>{if(reduce||e.metaKey||e.ctrlKey)return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,220)}));
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));
