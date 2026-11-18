/* three.js 시험 장 공용(2026-11-17, 교사 요청 'Three.js로 입체적으로'): 수업 엔진(deck.js) 위에서 3D 장면을 그리는 도구.
   - 3D 그리기 엔진(WebGL)은 하나만 만들어 두고, 장에 들어올 때마다(엔진이 장을 원본으로 다시 그림) 새 상자에 붙여 씀 → 장을 오가도 그래픽 자원이 쌓이지 않음
   - preserveDrawingBuffer: 엔진의 돋보기가 3D 그림을 복사해 확대할 수 있게
   - 화면에 보이는 크기(무대 배율 × 기기 픽셀 비율)로 그려 어떤 화면에서도 선명
   - 3D 상자 안에서 끌기·휠·터치는 장 넘기기로 가지 않음(엔진까지 올라가지 않게 막음)
   - 굵은 선은 Line2(화면 픽셀 기준 굵기), 글자는 CSS2D(보통 글자 — 선명하고 돋보기 복사에도 들어감) */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
export {THREE};

export const D2R=Math.PI/180;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;

/* 3D 보기 하나: w×h(무대 px) */
export function makeView({w,h,fov=35,pos=[3,2,3],target=[0,0,0],minD=2,maxD=9}){
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  R.setClearColor(0x000000,0);
  const L=new CSS2DRenderer();L.setSize(w,h);L.domElement.className='v3-lab';
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(fov,w/h,.05,100);camera.position.set(...pos);
  const ctl=new OrbitControls(camera,L.domElement);
  ctl.target.set(...target);ctl.enableDamping=true;ctl.dampingFactor=.09;ctl.enablePan=false;ctl.minDistance=minD;ctl.maxDistance=maxD;ctl.rotateSpeed=.8;
  ctl.update();
  const mats=new Set();   // 굵은 선 재료(해상도를 맞춰야 굵기가 맞음)
  const V={R,L,scene,camera,ctl,w,h,mats,home:{pos:[...pos],target:[...target]}};
  V.fitRes=()=>{const st=document.getElementById('stage'),k=st?st.getBoundingClientRect().width/1920:1;
    R.setPixelRatio(clamp(k*(devicePixelRatio||1),.5,3));R.setSize(w,h,false);mats.forEach(m=>m.resolution.set(w,h));};
  V.render=()=>{if(V._in)return;V._in=true;try{ctl.update();R.render(scene,camera);L.render(scene,camera);}finally{V._in=false;}};
  V.soon=()=>{if(!V._raf)V._raf=requestAnimationFrame(()=>{V._raf=0;V.render();});};   // 일시정지(P) 중 끌어 돌릴 때 등: 다음 프레임에 한 번
  V.mount=box=>{
    R.domElement.className='v3-gl';box.append(R.domElement,L.domElement);V.fitRes();V.render();
    ['click','dblclick','wheel','pointerdown','pointerup','touchstart','touchmove','touchend','gesturestart','gesturechange','contextmenu'].forEach(t=>
      box.addEventListener(t,e=>{e.stopPropagation();if(t==='contextmenu')e.preventDefault();},{passive:t!=='contextmenu'}));
  };
  ctl.addEventListener('change',()=>{if(!V._in)V.soon();});
  addEventListener('resize',()=>V.fitRes());
  /* 카메라를 부드럽게 옮기기(c.tween과 함께) */
  V.camTo=(pos,target)=>{const p0=camera.position.clone(),t0=ctl.target.clone(),p1=new THREE.Vector3(...pos),t1=new THREE.Vector3(...target);
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
/* 선분 여러 개(등고선 등): segs = [[a,b],…] */
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
/* 이름표(보통 글자). cls로 색, dx·dy(px)로 자리 옮김 */
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
/* 화살표(평면 위 두꺼운 화살표): from→to, 색, 굵기(월드 단위) */
export function arrow(from,to,o={}){
  const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),dir=b.clone().sub(a),len=dir.length();dir.normalize();
  const hl=Math.min(len*.4,o.head??.16),hr=o.hr??.065,sr=o.sr??.025,g=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color:o.col??0xd70015,transparent:true});
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(sr,sr,len-hl,16),mat);sh.position.copy(a).addScaledVector(dir,(len-hl)/2);
  const hd=new THREE.Mesh(new THREE.ConeGeometry(hr,hl,24),mat);hd.position.copy(a).addScaledVector(dir,len-hl/2);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);sh.quaternion.copy(q);hd.quaternion.copy(q);
  g.add(sh,hd);g.renderOrder=4;return g;
}
