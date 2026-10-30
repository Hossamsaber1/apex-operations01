const http=require('node:http');
const {json,log,requestJson,readBody,randomUUID}=require('./lib');
const port=Number(process.env.PORT||3000);
const version=process.env.APP_VERSION||'dev';
function createApp(){const storeUrl=process.env.STORE_URL||'http://localhost:4000';return http.createServer(async(req,res)=>{
 const id=randomUUID();const started=Date.now();
 res.on('finish',()=>log('info','http_request',{request_id:id,method:req.method,path:req.url,status:res.statusCode,duration_ms:Date.now()-started}));
 try{
  if(req.method==='GET'&&req.url==='/api/health')return json(res,200,{status:'healthy',version});
  if(req.method==='GET'&&req.url==='/api/ready'){
   try{const r=await requestJson(storeUrl+'/health');return json(res,r.status===200?200:503,{status:r.status===200?'ready':'not_ready',dependency:'store'});}catch(e){log('error','dependency_unavailable',{error:e.message});return json(res,503,{status:'not_ready',dependency:'store'});}
  }
  if(req.method==='GET'&&req.url==='/api/tasks'){
   try{const r=await requestJson(storeUrl+'/tasks');return json(res,r.status,r.body);}catch{return json(res,503,{error:'dependency unavailable'});}
  }
  if(req.method==='POST'&&req.url==='/api/tasks'){
   let body;try{body=await readBody(req);}catch{return json(res,400,{error:'invalid request body'});}
   if(typeof body.title!=='string'||!body.title.trim()||body.title.length>120)return json(res,400,{error:'title must be 1-120 characters'});
   try{const r=await requestJson(storeUrl+'/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:body.title.trim()})});return json(res,r.status,r.body);}catch{return json(res,503,{error:'dependency unavailable'});}
  }
  return json(res,404,{error:'not found'});
 }catch(e){log('error','unhandled_request',{error:e.message});return json(res,500,{error:'internal error'});}
 });}
if(require.main===module){createApp().listen(port,'0.0.0.0',()=>log('info','api_started',{port,version}));}
module.exports={createApp};
