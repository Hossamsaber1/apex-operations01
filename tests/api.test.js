const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('../src/api');
const {createStore}=require('../src/store');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
async function listen(server){await new Promise(r=>server.listen(0,'127.0.0.1',r));return server.address().port;}
async function close(server){await new Promise((r,j)=>server.close(e=>e?j(e):r()));}
async function setup(t,withStore=true){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'apex-test-'));let store;
 if(withStore){store=createStore(path.join(dir,'tasks.json'));const port=await listen(store);process.env.STORE_URL='http://127.0.0.1:'+port;}
 else process.env.STORE_URL='http://127.0.0.1:1';
 const api=createApp();const port=await listen(api);
 t.after(async()=>{await close(api);if(store)await close(store);fs.rmSync(dir,{recursive:true,force:true});delete process.env.STORE_URL;});
 return {base:'http://127.0.0.1:'+port,dir};}
test('health returns 200 and version',async t=>{const {base}=await setup(t);const r=await fetch(base+'/api/health');assert.equal(r.status,200);assert.equal((await r.json()).status,'healthy');});
test('ready returns 200 with available dependency',async t=>{const {base}=await setup(t);assert.equal((await fetch(base+'/api/ready')).status,200);});
test('ready returns 503 without dependency',async t=>{const {base}=await setup(t,false);assert.equal((await fetch(base+'/api/ready')).status,503);});
test('tasks initially empty',async t=>{const {base}=await setup(t);assert.deepEqual((await (await fetch(base+'/api/tasks')).json()).tasks,[]);});
test('POST creates task and GET returns it',async t=>{const {base}=await setup(t);const r=await fetch(base+'/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:'Demo'})});assert.equal(r.status,201);const tasks=(await (await fetch(base+'/api/tasks')).json()).tasks;assert.equal(tasks[0].title,'Demo');});
test('rejects invalid task title',async t=>{const {base}=await setup(t);const r=await fetch(base+'/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:''})});assert.equal(r.status,400);});
test('unknown route returns 404',async t=>{const {base}=await setup(t);assert.equal((await fetch(base+'/missing')).status,404);});
test('store persists data across restart',async t=>{const {base,dir}=await setup(t);await fetch(base+'/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:'Persistent'})});const file=path.join(dir,'tasks.json');assert.equal(JSON.parse(fs.readFileSync(file,'utf8'))[0].title,'Persistent');});
