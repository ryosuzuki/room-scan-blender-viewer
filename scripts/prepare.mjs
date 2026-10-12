import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup, meshopt, textureCompress} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
const ROOT=path.resolve(import.meta.dirname,'..'),S=process.env.ROOM_STORAGE||'/Users/ryosuzuki/Storage',R=S+'/outputs/room-five-hour-refinement/2026-10-11',M=S+'/memory/3d-scans/ziru/2026-10-11';
const I=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const receipt=[];const cache=new Map();
async function asset(src,tag){const original=await fs.readFile(src),sha=crypto.createHash('sha256').update(original).digest('hex');if(cache.has(sha))return cache.get(sha);
 const out='assets/'+tag+'-'+sha.slice(0,12)+'.glb';const dest=path.join(ROOT,out);if(!(await fs.stat(dest).catch(()=>null))){const doc=await io.read(src);for(const p of doc.getRoot().listScenes().concat(doc.getRoot().listNodes(),doc.getRoot().listMeshes(),doc.getRoot().listMaterials()))p.setExtras({});await doc.transform(dedup(),textureCompress({encoder:sharp,resize:[2048,2048],quality:82}),meshopt({encoder:MeshoptEncoder,level:'medium'}));await io.write(dest,doc);}
 const b=await fs.readFile(dest);const row={url:out,sourceFilename:path.basename(src),sourceSha256:sha,publishedSha256:crypto.createHash('sha256').update(b).digest('hex'),sourceBytes:original.length,bytes:b.length,preparation:'Meshopt vertex quantization (14-bit positions), no mesh simplification; textures max 2048px quality82; extras removed; original unchanged'};receipt.push(row);cache.set(sha,row);console.log(tag,(b.length/1e6).toFixed(1)+'MB');return row;
}
async function src(file,label,matrix=I){return {...await asset(file,'scan'),label,matrix,kind:'recorded scan / incomplete observation'};}
async function model(file,label){return {...await asset(file,'model'),label,kind:/experiment|candidate|relief|macro|observed/.test(file)?'Alternative / partial or inferred candidate':'Editable reconstruction candidate',matrix:I};}
const scenes=[];
const defaults={'main':'ryo-main-cumulative-hood-cabinet.glb','lower':'ryo-lower-cumulative-measured-ceiling.glb','upper':'ryo-upper-cumulative-source-folds.glb'};
for(const [floor,title]of [['main','自宅 · 主階'],['lower','自宅 · 下階'],['upper','自宅 · 上階']]){
 let scans=floor==='main'?[await src(S+'/projects/scan-single-object-proof/assets/scan/raw.gltf','Polycam original · main floor')]:[await src(S+'/outputs/room-scan-preparation/2026-10-11/VXU2QtCBoF27-native-mesh.glb','Scaniverse original · upper + lower combined')];
 const names=(await fs.readdir(R+'/ryo')).filter(n=>n.endsWith('.glb')&&(n.startsWith('ryo-'+floor+'-')||(floor==='main'&&/main-refined|shelf-props/.test(n))||(floor==='lower'&&/lower-refined|lower-sofa-merge|lower-sofa-clean-merge/.test(n))));
 const variants=[];for(const n of [defaults[floor],...names.filter(n=>n!==defaults[floor])])variants.push(await model(R+'/ryo/'+n,n.replace('.glb','')));
 scenes.push({id:'ryo-'+floor,title,scans,variants,note:floor==='main'?'Original Polycam and reconstruction share the retained source coordinate frame.':'Same multi-elevation scan, independent floor reconstruction. Floors are NOT globally registered to the main floor.'});
}
const audit=JSON.parse(await fs.readFile(R+'/ziru-home/original-laundry-scan-coverage-audit.json','utf8'));
const zscans=[];for(const tag of ['polycam','record3d']){const a=audit.find(x=>x.tag===tag);zscans.push(await src(M+'/ziru-home/home/scan/archive/'+tag+'.glb',tag+' original · retained registration',I));}
for(const n of ['reco_go-to-bed','record-study_desk','record3d','recording_studydesk-floorincl','reco_hallway','reco_reading','reco_brush']){const b=M+'/ziru-home/home/scenarios/'+n;const j=JSON.parse(await fs.readFile(b+'/session.json'));zscans.push(await src(b+'/room.glb',n+' · recorded RGBD',j.toSpace));}
const zv=[];const zd='ziru-home-final-six-area-cumulative-editable.glb';for(const n of [zd,...(await fs.readdir(R+'/ziru-home')).filter(n=>n.endsWith('.glb')&&n!==zd)])zv.push(await model(R+'/ziru-home/'+n,n.replace('.glb','')));
scenes.push({id:'ziru-home',title:'Ziruの家',scans:zscans,variants:zv,note:'Native original scans only, with retained registration. Repaired Scaniverse hybrid excluded as original evidence. Open-cabinet / louver variants are different capture states, not a ranking.'});
const lscans=[await src(M+'/ziru-lab/scan/atlas-reassembled.glb','Whole LAB · retained recorded-scan assembly')];for(const n of [5,4,3,1]){const b=M+'/ziru-lab/scenarios/atlas_rec_'+n;const j=JSON.parse(await fs.readFile(b+'/session.json'));lscans.push(await src(b+'/room.glb','LAB capture '+n+' · original fused RGBD',j.toSpace));}
const lv=[];const ld='lab-sofa-source-pillows-editable.glb';for(const n of [ld,...(await fs.readdir(R+'/lab')).filter(n=>n.endsWith('.glb')&&n!==ld&&!n.includes('corridor'))])lv.push(await model(R+'/lab/'+n,n.replace('.glb','')));
scenes.push({id:'lab',title:'ラボ',scans:lscans,variants:lv,note:'Each capture has different coverage and some moving objects. Retained session registrations are candidates, not independently calibrated absolute accuracy.'});
const cb=M+'/ziru-lab/scenarios/atlas_rec_2',cj=JSON.parse(await fs.readFile(cb+'/session.json'));
scenes.push({id:'lab-corridor',title:'ラボ · 廊下（別候補）',scans:[await src(cb+'/room.glb','LAB capture 2 · corridor',cj.toSpace)],variants:[await model(R+'/lab/lab-corridor-source-local-candidate.glb','Separate corridor reconstruction')],note:'Corridor is separate and NOT integrated into the main LAB. Retained low-fitness registration has floor-height mismatch; do not interpret synchronized views as an accuracy guarantee.'});
await fs.writeFile(ROOT+'/catalog.json',JSON.stringify({version:1,scenes,limitations:'Reconstruction candidates contain inferred geometry, missing objects and registration error. Camera synchronization is exact; scan-to-model calibration is not absolute-accuracy accepted. Upper/lower scan covers both elevations.',archive:'https://github.com/ryosuzuki/scan-digital-twin-archive/tree/main/docs/2026-10-11-room-showcase',video:'https://youtu.be/h4kDsGPTDqY'},null,2));
await fs.writeFile(ROOT+'/asset-provenance.json',JSON.stringify(receipt,null,2));
await fs.cp(ROOT+'/node_modules/three/build/three.module.js',ROOT+'/vendor/three.module.js');await fs.cp(ROOT+'/node_modules/three/build/three.core.js',ROOT+'/vendor/three.core.js');await fs.cp(ROOT+'/node_modules/three/examples/jsm',ROOT+'/vendor/addons',{recursive:true});
console.log('DONE',scenes.length,'scenes',receipt.length,'assets',receipt.reduce((s,x)=>s+x.bytes,0)/1e6,'MB');
