const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {json,log,readBody,randomUUID}=require('./lib');
const port=Number(process.env.STORE_PORT||4000);
const file=process.env.DATA_FILE||'/data/tasks.json';
function createStore(dataFile=file){
 function load(){try{return JSON.parse(fs.readFileSync(dataFile,'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}}
 function save(tasks){fs.mkdirSync(path.dirname(dataFile),{recursive:true});const tmp=dataFile+'.tmp';fs.writeFileSync(tmp,JSON.stringify(tasks));fs.renameSync(tmp,dataFile);}
 return http.createServer(async(req,res)=>{
  try{
   if(req.method==='GET'&&req.url==='/health'){load();return json(res,200,{status:'healthy'});}
   if(req.method==='GET'&&req.url==='/tasks')return json(res,200,{tasks:load()});
   if(req.method==='POST'&&req.url==='/tasks'){
    let body;try{body=await readBody(req);}catch{return json(res,400,{error:'invalid JSON'});}
    if(typeof body.title!=='string'||!body.title.trim()||body.title.length>120)return json(res,400,{error:'invalid title'});
    const tasks=load();const task={id:randomUUID(),title:body.title.trim(),done:false};tasks.push(task);save(tasks);return json(res,201,task);
   }
   return json(res,404,{error:'not found'});
  }catch(e){log('error','store_error',{error:e.message});return json(res,503,{error:'store unavailable'});}
 });
}
if(require.main===module)createStore().listen(port,'0.0.0.0',()=>log('info','store_started',{port}));
module.exports={createStore};
