(()=>{
const $=s=>document.querySelector(s);
const touch=matchMedia('(pointer:coarse)').matches,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const cv=$('#gl');let R;
try{R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:!touch,powerPreference:'high-performance'})}catch(e){}
if(!R||!window.gsap){location.replace('home-classic.html');return}
history.scrollRestoration='manual';
gsap.registerPlugin(ScrollTrigger);
let maxDpr=Math.min(devicePixelRatio,touch?1.5:2),dpr=maxDpr;
R.setPixelRatio(dpr);R.setSize(innerWidth,innerHeight);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x07040a,.05);
const cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,300);
const uni={uTime:{value:0},uReveal:{value:0}};
let mx=0,my=0,px=innerWidth/2,py=innerHeight/2,tp=0,sp=0,hov=null;
const mouse=new THREE.Vector2();

/* lights */
scene.add(new THREE.AmbientLight(0x2a0a12,.8));
const rim=new THREE.DirectionalLight(0xb9bcc4,.7);rim.position.set(3,5,4);scene.add(rim);
const key=new THREE.PointLight(0xd0102a,2,40);key.position.set(0,4,6);scene.add(key);

/* camera route (control points are evenly spaced in t) */
const camC=new THREE.CatmullRomCurve3([[0,.4,13],[0,1,4],[0,.5,-10],[-1,.2,-26],[1.5,.3,-40],[-1,.2,-54],[0,0,-72],[0,0,-84]].map(a=>new THREE.Vector3(...a)));
const lookC=new THREE.CatmullRomCurve3([[0,1.6,0],[0,1.5,-6],[-2,0,-24],[-4.5,0,-32],[4.5,.3,-46],[-3.5,0,-60],[0,1,-90],[0,2,-98]].map(a=>new THREE.Vector3(...a)));
const ZONE={about:3/7,skills:4/7,projects:5/7,contact:1},INTRO=.1,sc=k=>INTRO+(1-INTRO)*ZONE[k];

/* opening: umbrella-inspired wire structure (shader materialises bottom to top) */
const umbMat=wf=>new THREE.ShaderMaterial({uniforms:uni,wireframe:wf,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:'uniform float uTime,uReveal;varying vec3 vP;void main(){float f=uReveal*7.-2.;if(vP.y>f)discard;float e=smoothstep(.8,0.,f-vP.y);float w=.5+.5*sin(vP.y*4.-uTime*2.5);gl_FragColor=vec4(vec3(.82,.03,.1)*(.3+.9*w)+vec3(1.,.5,.5)*e,.9);}'});
const umb=new THREE.Group(),spin=new THREE.Group();
spin.add(new THREE.Mesh(new THREE.SphereGeometry(4,8,7,0,6.2832,0,1.3),umbMat(true)));
const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,6.5,6),umbMat(false));shaft.position.y=.8;spin.add(shaft);
const hook=new THREE.Mesh(new THREE.TorusGeometry(.4,.05,6,16,Math.PI),umbMat(false));hook.position.set(.4,-2.45,0);hook.rotation.z=Math.PI;spin.add(hook);
umb.add(spin);umb.rotation.x=-.5;umb.position.set(0,-1,0);scene.add(umb);
const ringM=new THREE.MeshBasicMaterial({color:0xd0102a,transparent:true,opacity:.45});
const rings=[-8,-20,-36,-50,-66,-76,-86].map(z=>{const r=new THREE.Mesh(new THREE.TorusGeometry(9,.05,8,72),ringM);r.position.z=z;scene.add(r);return r});
const grid=new THREE.GridHelper(220,90,0x5a0714,0x2a0710);grid.position.set(0,-4,-50);scene.add(grid);

/* dust */
const dn=touch?500:1600,dp=new Float32Array(dn*3),ds=new Float32Array(dn);
for(let i=0;i<dn;i++){dp.set([(Math.random()-.5)*34,(Math.random()-.5)*16,15-Math.random()*125],i*3);ds[i]=Math.random()}
const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));dg.setAttribute('aS',new THREE.BufferAttribute(ds,1));
scene.add(new THREE.Points(dg,new THREE.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
vertexShader:'uniform float uTime;attribute float aS;varying float vA;void main(){vec3 p=position;p.x+=sin(uTime*.2+aS*20.)*.7;p.y+=sin(uTime*.15+aS*37.)*.5;vec4 m=modelViewMatrix*vec4(p,1.);gl_PointSize=(2.+aS*3.)*(42./-m.z);vA=aS;gl_Position=projectionMatrix*m;}',
fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(mix(vec3(.8,.05,.12),vec3(.72,.74,.8),step(.82,vA)),smoothstep(.5,0.,d)*.6);}'})));

/* archive objects */
const objs={},hits=[];
function cloud(n,rMin,rMax,size,color){const a=new Float32Array(n*3);for(let i=0;i<n;i++){const r=rMin+Math.random()*(rMax-rMin),th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);a.set([r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph),r*Math.sin(ph)*Math.sin(th)],i*3)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));const m=new THREE.PointsMaterial({color,size,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});return new THREE.Points(g,m)}
function reg(k,pos,label,build){const g=new THREE.Group();g.position.set(...pos);scene.add(g);
const hit=new THREE.Mesh(new THREE.SphereGeometry(2.4,12,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.userData.key=k;g.add(hit);hits.push(hit);
const l=new THREE.PointLight(0xd0102a,1,16);l.position.set(0,0,2.5);g.add(l);
objs[k]={g,l,h:0,y:pos[1],label,...build(g)}}
reg('about',[-4.5,0,-32],'OBJ_01 // ABOUT',g=>{
const m=new THREE.MeshStandardMaterial({color:0x5a0714,metalness:.3,roughness:.12,transparent:true,opacity:.6,emissive:0xd0102a,emissiveIntensity:.2,flatShading:true});
const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6,1),m);
const w=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(.9,0)),new THREE.LineBasicMaterial({color:0xff3347,transparent:true,opacity:.7}));
const p=cloud(300,2,2.4,.04,0xff5566);g.add(c,w,p);
return{up(h,t,dt){c.rotation.y+=dt*(.1+h*.6);w.rotation.y-=dt*(.3+h);w.rotation.x+=dt*.2;m.emissiveIntensity=.2+h*1.3;p.material.opacity=h*.9;p.rotation.y+=dt*(.2+h*1.5)}}});
reg('skills',[4.5,.3,-46],'OBJ_02 // SKILLS',g=>{
const k=new THREE.Mesh(new THREE.TorusKnotGeometry(1.1,.26,128,14),new THREE.MeshStandardMaterial({color:0xb9bcc4,metalness:.7,roughness:.3,transparent:true,opacity:.6}));
const p=cloud(touch?250:600,0,1.9,.035,0xff4455);g.add(k,p);
return{up(h,t,dt){k.rotation.x+=dt*.2;k.rotation.y+=dt*(.15+h*.5);p.rotation.y+=dt*(.1+h*1.2);p.scale.setScalar(1+h*.15+Math.sin(t*3)*.02*h);p.material.opacity=.4+h*.5;g.rotation.x+=(my*.5*h-g.rotation.x)*.1;g.rotation.y+=(mx*.5*h-g.rotation.y)*.1}}});
reg('projects',[-3.5,0,-60],'OBJ_03 // PROJECTS',g=>{
const fm=new THREE.BoxGeometry(3.4,2.1,.1);
const fr=new THREE.Mesh(fm,new THREE.MeshStandardMaterial({color:0x10060a,metalness:.6,roughness:.15,transparent:true,opacity:.55}));
fr.add(new THREE.LineSegments(new THREE.EdgesGeometry(fm),new THREE.LineBasicMaterial({color:0xd0102a})));
const st=[1,2,3].map(i=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.9),new THREE.MeshBasicMaterial({color:0x2a0710,transparent:true,opacity:.25,side:2,depthWrite:false}));m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0x8a0c1e})));m.position.z=-.25*i;return m});
const c=document.createElement('canvas');c.width=512;c.height=320;const x=c.getContext('2d');x.fillStyle='#12040a';x.fillRect(0,0,512,320);x.strokeStyle='#d0102a';x.strokeRect(10,10,492,300);x.fillStyle='#d0102a';x.font='14px monospace';x.fillText('PROJECT_01 // LEARNING PROJECT',30,50);x.fillStyle='#fff';x.font='34px monospace';x.fillText('MY PERSONAL',30,150);x.fillText('PORTFOLIO',30,195);x.fillStyle='#b9bcc4';x.font='14px monospace';x.fillText('HTML / CSS / JS / THREE.JS',30,260);
const pv=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:0}));pv.position.z=.08;
g.add(fr,pv,...st);
return{up(h,t,dt){pv.material.opacity=h;st.forEach((m,i)=>m.position.z=-.25*(i+1)-h*.35*(i+1));g.rotation.y+=((mx*.35*h)-g.rotation.y)*.08;g.rotation.x+=((-my*.2*h)-g.rotation.x)*.08}}});

/* umbrella particle insignia (final scene) */
const N=touch?3500:7000,ip=new Float32Array(N*3),tg=new Float32Array(N*3),vl=new Float32Array(N*3),cl=new Float32Array(N*3);
for(let i=0;i<N;i++){let x,y,c,q=Math.random();
if(q<.18){const a=Math.random()*6.283,r=4+Math.random()*.25;x=Math.cos(a)*r;y=Math.sin(a)*r;c=[.75,.78,.85]}
else if(q<.3){const a=Math.floor(Math.random()*8)*Math.PI/4,r=Math.random()*4;x=Math.cos(a)*r;y=Math.sin(a)*r;c=[.9,.9,.95]}
else{const w=Math.floor(Math.random()*8),a=w*Math.PI/4+.06+Math.random()*(Math.PI/4-.12),r=1.1+Math.sqrt(Math.random())*2.7;x=Math.cos(a)*r;y=Math.sin(a)*r;c=w%2?[.85,.86,.9]:[1,.1,.18]}
tg.set([x,y,(Math.random()-.5)*.3],i*3);ip.set([(Math.random()-.5)*40,(Math.random()-.5)*30,(Math.random()-.5)*20],i*3);cl.set(c,i*3)}
const ig=new THREE.BufferGeometry();ig.setAttribute('position',new THREE.BufferAttribute(ip,3));ig.setAttribute('color',new THREE.BufferAttribute(cl,3));
const ins=new THREE.Points(ig,new THREE.PointsMaterial({size:.07,vertexColors:true,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));
ins.position.set(0,2,-98);ins.visible=false;scene.add(ins);
const plane=new THREE.Plane(new THREE.Vector3(0,0,1),98),hp=new THREE.Vector3(),ray=new THREE.Raycaster();
function updIns(dt){const a=ig.attributes.position.array;
if(!ray.ray.intersectPlane(plane,hp))hp.set(999,999,0);ins.worldToLocal(hp);
for(let i=0;i<N;i++){const j=i*3;
vl[j]+=(tg[j]-a[j])*8*dt;vl[j+1]+=(tg[j+1]-a[j+1])*8*dt;vl[j+2]+=(tg[j+2]-a[j+2])*8*dt;
const dx=hp.x-a[j],dy=hp.y-a[j+1],d2=dx*dx+dy*dy;
if(d2<2.2){const f=(2.2-d2)/Math.sqrt(d2+.01)*dt*22;vl[j]-=dx*f;vl[j+1]-=dy*f}
const dm=1-2.2*dt;vl[j]*=dm;vl[j+1]*=dm;vl[j+2]*=dm;
a[j]+=vl[j]*dt;a[j+1]+=vl[j+1]*dt;a[j+2]+=vl[j+2]*dt}
ig.attributes.position.needsUpdate=true;ins.rotation.z+=dt*.08}
function scatter(){for(let i=0;i<N*3;i++)vl[i]+=(Math.random()-.5)*14;blip(120,.3)}

/* text scramble */
function scramble(el,txt,d=1.2){const ch='01#%/\\<>=',o={v:0};if(reduce){el.textContent=txt;return}
gsap.to(o,{v:1,duration:d,ease:'none',onUpdate(){const n=Math.floor(o.v*txt.length);el.textContent=txt.slice(0,n)+[...txt.slice(n)].map(c=>c===' '?c:ch[Math.random()*ch.length|0]).join('')},onComplete(){el.textContent=txt}})}

/* audio (off by default) */
let ac,master,on=false;
function initAudio(){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=0;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=260;f.connect(master);master.connect(ac.destination);
[[55,'sawtooth',.03],[82.4,'sine',.05],[110.2,'sine',.03]].forEach(([fr,ty,v])=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=fr;g.gain.value=v;o.connect(g);g.connect(f);o.start()})}
function blip(fr,v=.15){if(!on)return;const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=fr;g.gain.setValueAtTime(v*.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.25);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.3)}
$('#snd').onclick=e=>{if(!ac)initAudio();on=!on;ac.resume();gsap.to(master.gain,{value:on?.5:0,duration:1});e.target.setAttribute('aria-pressed',on);e.target.textContent='Sound: '+(on?'on':'off');blip(300)};

/* flight into an object -> its page */
const PAGES={about:'about.html',skills:'skills.html',projects:'projects.html',contact:'contact.html'};
const st={f:0,key:null},fl=$('#flash');let busy=false;
function leave(k,url){sessionStorage.setItem('zone',k);fl.classList.add('on');blip(90,.4);setTimeout(()=>{location.href=url||PAGES[k]},reduce?0:650)}
function open(k){if(st.key||busy)return;busy=true;st.key=k;blip(220);document.documentElement.style.overflow='hidden';
gsap.to(st,{f:1,duration:reduce?.01:1.5,ease:'power3.in',onComplete:()=>leave(k)})}
function go(k){if(st.key)return;const max=document.documentElement.scrollHeight-innerHeight,o={y:scrollY};
gsap.to(o,{y:sc(k)*max,duration:reduce?.01:2.4,ease:'power2.inOut',onUpdate:()=>scrollTo(0,o.y),onComplete:()=>k==='contact'?leave('contact'):open(k)})}
const plain=e=>e.metaKey||e.ctrlKey||e.shiftKey||e.button;
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=e=>{if(plain(e))return;e.preventDefault();go(b.dataset.go)});
document.querySelectorAll('a[data-leave]').forEach(a=>a.onclick=e=>{if(plain(e))return;e.preventDefault();leave('contact',a.href)});
$('#brand').onclick=e=>{e.preventDefault();if(!st.key)scrollTo({top:0,behavior:'smooth'})};
addEventListener('pageshow',e=>{if(e.persisted){st.key=null;st.f=0;busy=false;fl.classList.remove('on');document.documentElement.style.overflow=''}});

/* pointer + cursor */
const cs=$('#cs');cs.innerHTML='<circle r="19" fill="none" stroke="#d0102a" stroke-width="1.6"/><circle r="12" fill="none" stroke="#b9bcc4" stroke-width=".6"/>'+[...Array(8)].map((_,i)=>`<line x1="0" y1="-12" x2="0" y2="-19" stroke="#d0102a" stroke-width="1.2" transform="rotate(${i*45})"/>`).join('');
let cx=px,cy=py,overBtn=false;
addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;mouse.set(px/innerWidth*2-1,-(py/innerHeight)*2+1);mx=mouse.x;my=mouse.y;overBtn=!!e.target.closest('button,a')});
addEventListener('click',e=>{if(e.target.closest('button,a,#panel'))return;mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(mouse,cam);const h=ray.intersectObjects(hits)[0];
if(h&&!st.key)open(h.object.userData.key);else if(sp>.85)scatter()});

/* scroll */
ScrollTrigger.create({trigger:'#scroll',start:'top top',end:'bottom bottom',onUpdate:s=>tp=s.progress});
const zones=[[0,'ZONE 01 — THE RED ZONE'],[.2,'ZONE 02 — THE CLASSIFIED ARCHIVE'],[.8,'ZONE 03 — THE UMBRELLA NETWORK']];let zi=0;
const _v=new THREE.Vector3(),cp=new THREE.Vector3(),lp=new THREE.Vector3(),tmp=new THREE.Vector3();
const clock=new THREE.Clock();let fc=0,ft=0;
const tag=$('#tag'),cur=$('#cur'),grade=$('#grade'),vid=$('#vid');
function frame(){requestAnimationFrame(frame);
const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;uni.uTime.value=t;
sp+=(tp-sp)*(reduce?1:.06);const s=Math.min(Math.max(sp,0),1),p=Math.min(1,Math.max(0,(s-INTRO)/(1-INTRO)));
camC.getPoint(p,cp);lookC.getPoint(p,lp);
if(st.key){const o=objs[st.key].g.position;cp.lerp(_v.set(o.x,o.y+.2,o.z+5.2),st.f);lp.lerp(o,st.f)}
cam.position.copy(cp);cam.position.x+=mx*.35*(1-st.f);cam.position.y+=my*.2*(1-st.f);cam.lookAt(lp);const fv=55-st.f*14;if(cam.fov!==fv){cam.fov=fv;cam.updateProjectionMatrix()}
/* hover */
hov=null;if(!st.key&&p>.3&&p<.78){ray.setFromCamera(mouse,cam);const h=ray.intersectObjects(hits)[0];if(h)hov=h.object.userData.key}
for(const k in objs){const o=objs[k];o.h+=((hov===k||st.key===k?1:0)-o.h)*.08;o.g.position.y=o.y+Math.sin(t*.8+o.g.position.x)*.15;o.up(o.h,t,dt);o.l.intensity=1+o.h*3}
spin.rotation.y+=dt*.15;rings.forEach((r,i)=>r.rotation.z+=dt*.05*(i%2?1:-1));
ringM.opacity=.3+.15*Math.sin(t*1.5);key.intensity=1.5+Math.sin(t*2)*.4;
ins.visible=p>.78;if(ins.visible)updIns(dt);
/* env */
scene.fog.density=.05-.032*Math.min(1,uni.uReveal.value)+Math.max(0,p-.8)*.04;
grade.style.opacity=.55+.3*Math.min(1,p*4)+(p>.8?.1:0);
const hv=Math.min(1,Math.max(0,(s-.04)/.05))*Math.max(0,1-p/.1);$('#hero').style.opacity=hv;$('#hint').style.opacity=hv*Math.max(0,1-p/.03);
if(!heroDone&&s>.045){heroDone=true;scramble($('#h1'),'MATT LEUREM N CELIS',1.4)}
$('#intro').style.opacity=introOn?Math.max(0,1-s/.07):0;
$('#contact').style.opacity=Math.max(0,(p-.9)/.08);$('#contact').style.pointerEvents=p>.93?'auto':'none';
$('#bar').style.transform=`scaleX(${s})`;
let z=0;zones.forEach((a,i)=>{if(p>=a[0])z=i});if(z!==zi){zi=z;scramble($('#cap'),zones[z][1],.8);blip(180+z*60,.1)}
/* tag + cursor */
if(hov){tmp.copy(objs[hov].g.position);tmp.y+=2.2;tmp.project(cam);tag.textContent=objs[hov].label+' // ENTER ▸ '+PAGES[hov];tag.style.opacity=1;tag.style.transform=`translate(${(tmp.x*.5+.5)*innerWidth-70}px,${(-tmp.y*.5+.5)*innerHeight}px)`}else tag.style.opacity=0;
let tx=px,ty=py;if(hov){tmp.copy(objs[hov].g.position).project(cam);tx+=((tmp.x*.5+.5)*innerWidth-px)*.25;ty+=((-tmp.y*.5+.5)*innerHeight-py)*.25}
cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform=`translate(${cx}px,${cy}px)`;cur.classList.toggle('hot',!!hov||overBtn);
R.render(scene,cam);
/* adaptive resolution */
ft+=dt;if(++fc===90){const a=ft/90;if(a>.024&&dpr>1){dpr=Math.max(1,dpr-.25);R.setPixelRatio(dpr)}else if(a<.015&&dpr<maxDpr){dpr=Math.min(maxDpr,dpr+.25);R.setPixelRatio(dpr)}fc=0;ft=0}}
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
addEventListener('pagehide',()=>{scene.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose&&o.material.dispose()});R.dispose()});
document.addEventListener('visibilitychange',()=>document.hidden?vid.pause():vid.play().catch(()=>{}));

/* about-me intro: portrait + typewriter, shown before the 3D journey */
let heroDone=false,introOn=false;
const IH="HELLO, WORLD.\nI'M MATT.",IB="BSIT student at the University of San Agustin \u2013 Iloilo, and an aspiring web developer.\n\nI like turning ideas into things that work: building websites, exploring games, and debugging until it clicks.\n\nThis is my portfolio.";
function typeIt(el,txt,cps,done){let i=0;el.classList.add('typing');const t=setInterval(()=>{el.textContent=txt.slice(0,++i);if(i>=txt.length){clearInterval(t);el.classList.remove('typing');done&&done()}},1000/cps)}
function startIntro(instant){introOn=true;const I=$('#intro');I.classList.add('show');const fin=()=>$('#icue').style.opacity=1;
if(instant||reduce){$('#ihead').textContent=IH;$('#ibody').textContent=IB;fin();return}
setTimeout(()=>typeIt($('#ihead'),IH,20,()=>setTimeout(()=>typeIt($('#ibody'),IB,55,fin),250)),900)}
/* opening: full cinematic intro on first visit; quick resume when returning from a page */
const back=sessionStorage.getItem('zone');sessionStorage.removeItem('zone');
vid.play().catch(()=>{});frame();
if(back&&ZONE[back]!=null){
uni.uReveal.value=1;$('#h1').textContent='MATT LEUREM N CELIS';heroDone=true;startIntro(true);
scrollTo(0,sc(back)*(document.documentElement.scrollHeight-innerHeight));tp=sp=sc(back);
gsap.to('#loader',{opacity:0,duration:.6,onComplete:()=>$('#loader').remove()});
}else{
$('#h1').textContent='';$('#role').style.opacity=0;document.documentElement.style.overflow='hidden';
Promise.race([new Promise(r=>vid.addEventListener('canplay',r,{once:true})),new Promise(r=>setTimeout(r,3000))]).then(()=>{
const tl=gsap.timeline();
tl.to('#loader',{opacity:0,duration:1,delay:.5,onComplete:()=>$('#loader').remove()})
.to(uni.uReveal,{value:1,duration:reduce?.01:4.5,ease:'power2.inOut'},.6)
.add(()=>startIntro(),reduce?0:2.6)
.to('#role',{opacity:1,duration:1},reduce?0:3.4)
.add(()=>{document.documentElement.style.overflow='';ScrollTrigger.refresh()},reduce?0:4.2)})}
})();
