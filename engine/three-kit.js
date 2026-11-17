/* 수업용 3D 도구(three.js 0.160.0) — 2026-11-17 교사 결정('three.js를 앞으로 수업 자료 만들 때 적극적으로 활용하도록 해')으로
   시험 장(저장소 밖 threejs_시험/common.js)에서 검증한 것을 엔진 쪽으로 옮기고 수업에 쓸 때 필요한 것을 더함.
   수업 파일에서 쓰는 법(장 하나 예):
     <script type="importmap">{"imports":{"three":"../engine/vendor/three@0.160.0/build/three.module.min.js",
                                          "three/addons/":"../engine/vendor/three@0.160.0/examples/jsm/"}}</script>
     <script type="module">
       import {THREE,makeView,line,dot,label,fade,clear} from '../engine/three-kit.js';
       let V=null;
       Deck.scene('s05',{steps:3, enter(c){ if(!V){V=makeView({w:1100,h:584,key:'s05',pos:[3,2,3]}); …장면 만들기…} V.mount(c.$('#s05-v')); c.loop(()=>V.render()); }, go(c,k){…}});
       Deck.start();
     </script>
   - three.js는 저장소 안(engine/vendor)에서 불러옴 → 인터넷이 없어도 3D가 나옴
   - 3D 엔진(WebGL)은 장마다 하나만 만들어 장에 들어올 때마다 새 상자에 붙임(장을 오가도 그래픽 자원이 쌓이지 않음)
   - preserveDrawingBuffer: 엔진 돋보기(Z)가 3D 그림을 복사해 확대, 학생용 PDF 인쇄에도 그림이 들어감
   - 3D 안에서 끌기·휠·두 손가락은 돌리기·확대만(장 넘기기로 가지 않음). 끌지 않고 그냥 누르면 다음 단계(화면 가득 3D에서도 누르기로 넘김)
   - key를 주면 발표자 창에서 돌린 카메라 각도를 프로젝터 창도 따라감(Deck.link)
   - 느린 PC: 그리는 데 오래 걸리면(1초 넘게 평균 30 ms 넘음) 화질을 단계적으로 낮추고, 여유가 생기면(5초 넘게 14 ms 아래) 되돌림
   - 굵은 선은 Line2(화면 픽셀 기준 굵기), 글자는 CSS2D(보통 글자 — 선명, 돋보기 복사에도 들어감) */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
export {THREE,OrbitControls,CSS2DObject};

/* 학생용 인쇄(?print=1)·정지 화면(?still=1)인지: 어두운 3D 장면(밤하늘 등)은 PRINT일 때 밝은 바탕·진한 선으로 바꿔 그릴 것
   (그대로 두면 PDF에 넓은 검은 면이 됨 — 3D는 PDF에 그림 한 장으로 들어가고, 단계 k의 카메라 각도로 찍힘) */
export const PRINT=document.documentElement.classList.contains('print');
export const STILL=document.documentElement.classList.contains('still');
export const D2R=Math.PI/180;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
const stageK=()=>{const st=document.getElementById('stage');return st?st.getBoundingClientRect().width/1920:1;};

/* 3D 보기 하나: w×h(무대 px), key = 프로젝터 창과 카메라를 맞출 이름(장 id 등) */
export function makeView({w,h,fov=35,pos=[3,2,3],target=[0,0,0],minD=2,maxD=9,key=null,pan=false}){
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  R.setClearColor(0x000000,0);
  const L=new CSS2DRenderer();L.setSize(w,h);L.domElement.className='v3-lab';
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(fov,w/h,.05,200);camera.position.set(...pos);
  const ctl=new OrbitControls(camera,L.domElement);
  ctl.target.set(...target);ctl.enableDamping=true;ctl.dampingFactor=.09;ctl.enablePan=pan;ctl.minDistance=minD;ctl.maxDistance=maxD;ctl.rotateSpeed=.8;
  ctl.update();
  const mats=new Set();
  const V={R,L,scene,camera,ctl,w,h,mats,key,q:1,home:{pos:[...pos],target:[...target]}};
  V.fitRes=()=>{R.setPixelRatio(clamp(stageK()*(devicePixelRatio||1)*V.q,.5,3));R.setSize(w,h,false);mats.forEach(m=>m.resolution.set(w,h));};
  /* 그리기 + 느린 PC 대비(그리는 시간의 이동 평균으로 화질 배율 q를 1 → .75 → .55로) */
  let slowT=0,fastT=0,lastNow=0,avg=16;
  V.render=()=>{
    if(V._in)return;V._in=true;
    try{ctl.update();const t0=performance.now();R.render(scene,camera);L.render(scene,camera);
      const now=performance.now(),dt=lastNow?now-lastNow:16;lastNow=now;avg=avg*.9+Math.min(dt,200)*.1;
      if(avg>30){slowT+=dt;fastT=0;if(slowT>1000&&V.q>.56){V.q=V.q>.8?.75:.55;slowT=0;V.fitRes();}}
      else if(avg<14){fastT+=dt;slowT=0;if(fastT>5000&&V.q<1){V.q=V.q<.6?.75:1;fastT=0;V.fitRes();}}
      else{slowT=fastT=0;}
      V.drawMs=now-t0;}
    finally{V._in=false;}
  };
  V.soon=()=>{if(!V._raf)V._raf=requestAnimationFrame(()=>{V._raf=0;V.render();});};   // 일시정지(P) 중 끌어 돌릴 때: 다음 프레임에 한 번
  /* 장에 들어올 때마다 새 상자에 붙임 */
  V.mount=box=>{
    R.domElement.className='v3-gl';box.append(R.domElement,L.domElement);V.fitRes();V.render();
    let down=null,moved=false;
    box.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];moved=false;e.stopPropagation();});
    box.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)moved=true;});
    box.addEventListener('click',e=>{if(moved||e.target.closest('button,input,label,select,a,.v3-ui'))e.stopPropagation();moved=false;down=null;});   // 끌었으면 장 넘기지 않음, 그냥 누른 것은 엔진으로(다음 단계)
    ['dblclick','wheel','pointerup','touchstart','touchmove','touchend','gesturestart','gesturechange'].forEach(t=>box.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
    box.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();});
  };
  ctl.addEventListener('change',()=>{if(!V._in)V.soon();});
  addEventListener('resize',()=>V.fitRes());
  /* 프로젝터 창과 카메라 맞추기: 사람이 돌리는 동안(과 놓은 뒤 미끄러지는 1.5초)만 보냄 */
  if(key&&window.Deck&&Deck.link){
    let active=false,until=0,sent=0;
    ctl.addEventListener('start',()=>{active=true;});
    ctl.addEventListener('end',()=>{active=false;until=performance.now()+1500;});
    ctl.addEventListener('change',()=>{const now=performance.now();if(!(active||now<until)||Deck.link.remote||now-sent<30)return;sent=now;
      const p=camera.position,t=ctl.target,r=v=>Math.round(v*1e4)/1e4;Deck.link.send('cam:'+key,{p:[r(p.x),r(p.y),r(p.z)],t:[r(t.x),r(t.y),r(t.z)]});});
    Deck.link.on('cam:'+key,d=>{camera.position.set(...d.p);ctl.target.set(...d.t);V.soon();});
  }
  /* 카메라를 부드럽게 옮기기(c.tween과 함께): const f=V.camTo(위치,보는 곳); await c.tween(900,f,{ease:'inOut'}) */
  V.camTo=(p,tg)=>{const p0=camera.position.clone(),t0=ctl.target.clone(),p1=new THREE.Vector3(...p),t1=new THREE.Vector3(...tg);
    return e=>{camera.position.lerpVectors(p0,p1,e);ctl.target.lerpVectors(t0,t1,e);};};
  return V;
}

/* 굵은 선: pts = [[x,y,z],…], o = {col, w(px), dash:[길이,틈], op} */
export function line(V,pts,o={}){
  const g=new LineGeometry();g.setPositions(pts.flat());
  const m=new LineMaterial({color:o.col??0x1d1d1f,linewidth:o.w??3,transparent:true,opacity:o.op??1,dashed:!!o.dash,
    dashSize:o.dash?o.dash[0]:1,gapSize:o.dash?o.dash[1]:1,depthTest:o.depth??true,worldUnits:false});
  m.resolution.set(V.w,V.h);V.mats.add(m);m.userData.V=V;
  const l=new Line2(g,m);if(o.dash)l.computeLineDistances();l.renderOrder=o.order??1;l.userData.base=o.op??1;return l;
}
/* 선분 여러 개(등고선 등): list = [[a,b],…] */
export function segs(V,list,o={}){
  const g=new LineSegmentsGeometry();g.setPositions(list.flat(2));
  const m=new LineMaterial({color:o.col??0x1d1d1f,linewidth:o.w??3,transparent:true,opacity:o.op??1,worldUnits:false,depthTest:o.depth??true});
  m.resolution.set(V.w,V.h);V.mats.add(m);m.userData.V=V;
  const l=new LineSegments2(g,m);l.renderOrder=o.order??1;l.userData.base=o.op??1;return l;
}
/* 점(작은 공) */
export function dot(pos,o={}){
  const m=new THREE.Mesh(new THREE.SphereGeometry(o.r??.03,24,16),new THREE.MeshBasicMaterial({color:o.col??0x1d1d1f,transparent:true,opacity:o.op??1}));
  m.position.set(...pos);m.renderOrder=o.order??3;m.userData.base=o.op??1;return m;
}
/* 이름표(보통 글자, 무대 기준 24px 이상으로 CSS를 줄 것). cls로 색, dx·dy(px)로 자리 옮김 */
export function label(text,pos,o={}){
  const d=document.createElement('div');d.className='v3-t '+(o.cls||'');d.innerHTML=text;
  if(o.dx||o.dy)d.style.translate=(o.dx||0)+'px '+(o.dy||0)+'px';
  const ob=new CSS2DObject(d);ob.position.set(...pos);ob.userData.base=1;ob.center.set(o.cx??.5,o.cy??.5);return ob;
}
/* 묶음의 투명도(선·면·점·글자 모두) */
export function fade(group,o){
  group.visible=o>.003;
  group.traverse(n=>{
    if(n.isCSS2DObject){n.element.style.opacity=(o*(n.userData.base??1)).toFixed(3);n.element.style.visibility=o>.003?'':'hidden';}
    else if(n.material){const b=n.userData.base??1;(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>{m.transparent=true;m.opacity=o*(m.userData.base??b);});}
  });
}
/* 묶음을 비우고 자원 정리(다시 그릴 때) */
export function clear(group){
  group.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material){(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>{if(m.userData.V)m.userData.V.mats.delete(m);m.dispose();});}
    if(n.isCSS2DObject&&n.element.parentNode)n.element.parentNode.removeChild(n.element);});
  while(group.children.length)group.remove(group.children[0]);
}
/* 화살표(두꺼운 3D 화살표): from→to */
export function arrow(from,to,o={}){
  const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),dir=b.clone().sub(a),len=dir.length();dir.normalize();
  const hl=Math.min(len*.4,o.head??.16),hr=o.hr??.065,sr=o.sr??.025,g=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color:o.col??0xd70015,transparent:true});
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(sr,sr,len-hl,16),mat);sh.position.copy(a).addScaledVector(dir,(len-hl)/2);
  const hd=new THREE.Mesh(new THREE.ConeGeometry(hr,hl,24),mat);hd.position.copy(a).addScaledVector(dir,len-hl/2);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);sh.quaternion.copy(q);hd.quaternion.copy(q);
  g.add(sh,hd);g.renderOrder=4;return g;
}
