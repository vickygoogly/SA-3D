import http from 'node:http';
import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync,statSync,createReadStream,unlinkSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const config=JSON.parse(readFileSync(path.join(root,'backend/config.json'),'utf8'));
const host=process.env.HOST||config.host||'127.0.0.1';
const port=Number(process.env.PORT??config.port??8080);
const statePath=process.env.SA_STATE_FILE||path.join(root,'backend/data/state.json');
const mediaDir=process.env.SA_MEDIA_DIR||path.join(root,'backend/media');
const videoIndexPath=path.join(mediaDir,'videos.json');
const cameraId=/^CAM-0(?:0[1-9]|[1-3][0-9]|4[0-8])$/;
const loadVideos=()=>existsSync(videoIndexPath)?JSON.parse(readFileSync(videoIndexPath,'utf8')):{};
let uploadedVideos=loadVideos();
function persistVideos(){mkdirSync(mediaDir,{recursive:true});writeFileSync(videoIndexPath+'.tmp',JSON.stringify(uploadedVideos,null,2));renameSync(videoIndexPath+'.tmp',videoIndexPath);}
const seed=()=>JSON.parse(readFileSync(path.join(root,'backend/data/seed.json'),'utf8'));
let state=existsSync(statePath)?JSON.parse(readFileSync(statePath,'utf8')):seed();
function persist(){mkdirSync(path.dirname(statePath),{recursive:true});writeFileSync(statePath+'.tmp',JSON.stringify(state,null,2));renameSync(statePath+'.tmp',statePath);}
function json(res,code,value){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function readBody(req,limit=60*1024*1024){return new Promise((resolve,reject)=>{let size=0;const parts=[];req.on('data',part=>{size+=part.length;if(size>limit){reject(Object.assign(new Error('Video is too large'),{status:413}));req.destroy();return;}parts.push(part);});req.on('end',()=>resolve(Buffer.concat(parts)));req.on('error',reject);});}
function readUploadedFile(body,boundary){
 const separator=Buffer.from(`--${boundary}`),headerBreak=Buffer.from('\r\n\r\n'),closing=Buffer.from(`\r\n--${boundary}`);
 let at=body.indexOf(separator);while(at!==-1){const start=at+separator.length+2,headerEnd=body.indexOf(headerBreak,start);if(headerEnd===-1)break;const headers=body.subarray(start,headerEnd).toString('utf8');const name=/name="([^"]+)"/.exec(headers)?.[1];const filename=/filename="([^"]*)"/.exec(headers)?.[1];const dataStart=headerEnd+headerBreak.length, dataEnd=body.indexOf(closing,dataStart);if(dataEnd===-1)break;if(name==='video'&&filename)return {filename,contentType:/content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]||'',data:body.subarray(dataStart,dataEnd)};at=body.indexOf(separator,dataEnd);}
 return null;
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
function staticFile(req,res,base,relative){
 const filename=path.resolve(base,relative||'index.html');
 if(!filename.startsWith(path.resolve(base)+path.sep)){return json(res,403,{error:'Forbidden'});}
 if(!existsSync(filename)||!statSync(filename).isFile())return json(res,404,{error:'File not found'});
 const size=statSync(filename).size;
 const headers={'Content-Type':types[path.extname(filename)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
 let start=0,end=size-1,status=200;
 if(req.headers.range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  if(!match||(!match[1]&&!match[2])||size===0){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
  if(!match[1]){const length=Number(match[2]);start=Math.max(0,size-length);}else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;}
  if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
  status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
 }
 headers['Content-Length']=Math.max(0,end-start+1);
 res.writeHead(status,headers);
 if(req.method==='HEAD'||size===0)return res.end();
 const stream=createReadStream(filename,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
}
const server=http.createServer(async (req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let route;
  try{route=decodeURIComponent(url.pathname);}catch{return json(res,400,{error:'Invalid URL'});}
  if(route.includes('\0')||route.includes('\\'))return json(res,400,{error:'Invalid path'});
  if(route.startsWith('/api/')){
   if(req.method==='GET'&&route==='/api/health')return json(res,200,{status:'ok',mode:'local-demo'});
   if(req.method==='GET'&&route==='/api/state')return json(res,200,state);
   if(req.method==='GET'&&route==='/api/config')return json(res,200,{modelUrl:config.modelUrl,cameraVideos:{...(config.cameraVideos||{}),...Object.fromEntries(Object.entries(uploadedVideos).map(([id,item])=>[id,item.url]))},droneVideos:config.droneVideos||{}});
   const vitalsMatch=/^\/api\/personnel\/(P-\d{3})\/vitals$/.exec(route);
   if(req.method==='GET'&&vitalsMatch){const id=vitalsMatch[1],number=Number(id.slice(2));if(number<1||number>248)return json(res,404,{error:'Unknown personnel ID'});const phase=number*1.731+Date.now()/8000;const wave=Math.sin(phase);return json(res,200,{id,heartRate:Math.round(70+(number%17)+wave*5),skinTemperature:Number((36.45+(number%7)*.05+Math.sin(phase*.8)*.08).toFixed(1)),spo2:Math.min(100,98+(number%3)),stress:Math.round(18+(number*7)%38+Math.max(0,wave)*12),battery:Math.max(32,96-((number*11)%57)),steps:Math.round(1860+(number*173)%8900),status:number===42||number===87?'Needs attention':'Normal',sampledAt:new Date().toISOString()});}
   if(req.method==='POST'){
    // Reject browser requests originating from a different site.
    const allowedOrigin=process.env.RENDER_EXTERNAL_URL || `http://${req.headers.host}`;
    if(req.headers.origin&&req.headers.origin!==allowedOrigin)return json(res,403,{error:'Origin not allowed'});
    const uploadMatch=/^\/api\/cameras\/(CAM-\d{3})\/video$/.exec(route);
    if(uploadMatch){const id=uploadMatch[1];if(!cameraId.test(id))return json(res,404,{error:'Unknown camera ID'});const contentType=req.headers['content-type']||'';const boundary=/boundary=([^;]+)/i.exec(contentType)?.[1]?.replace(/^"|"$/g,'');if(!boundary)return json(res,400,{error:'Use a multipart/form-data video upload'});const file=readUploadedFile(await readBody(req),boundary);if(!file)return json(res,400,{error:'Choose a video file'});const ext=path.extname(file.filename).toLowerCase();if(!['.mp4','.webm'].includes(ext)||!/^video\/(mp4|webm)/i.test(file.contentType))return json(res,415,{error:'Use an MP4 or WebM video file'});mkdirSync(mediaDir,{recursive:true});const filename=`${id.toLowerCase()}-${Date.now()}${ext}`,destination=path.join(mediaDir,filename);writeFileSync(destination,file.data);const old=uploadedVideos[id];if(old?.filename&&existsSync(path.join(mediaDir,old.filename)))unlinkSync(path.join(mediaDir,old.filename));uploadedVideos[id]={filename,url:`/media/${filename}`,originalName:path.basename(file.filename),size:file.data.length,uploadedAt:new Date().toISOString()};persistVideos();return json(res,201,{cameraId:id,...uploadedVideos[id]});}
    const match=/^\/api\/alerts\/([A-Za-z0-9-]+)\/acknowledge$/.exec(route);
    if(match){const item=state.alerts.find(a=>a.id===match[1]);if(!item)return json(res,404,{error:'Unknown alert'});item.ack=true;item.acknowledgedAt=new Date().toISOString();persist();return json(res,200,item);}
    if(route==='/api/demo/reset'){state=seed();persist();return json(res,200,{status:'reset'});}
   }
   return json(res,404,{error:'Unknown API route or method'});
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed'});
  if(route.startsWith('/models/'))return staticFile(req,res,path.join(root,'models'),route.slice(8));
  if(route.startsWith('/media/'))return staticFile(req,res,mediaDir,route.slice(7));
  return staticFile(req,res,path.join(root,'frontend'),route.slice(1));
 }catch(error){console.error(error.message);if(!res.headersSent)json(res,500,{error:'Server error. Check terminal.'});else res.destroy();}
});
server.on('error',error=>{console.error(`Cannot start: ${error.message}. Change port in backend/config.json if it is already in use.`);process.exitCode=1;});
server.listen(port,host,()=>console.log(`SA 3D Showcase running at http://${host}:${server.address().port}\nDemo data only. Press Ctrl+C to stop.`));
