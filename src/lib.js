const http = require('node:http');
const { randomUUID } = require('node:crypto');
function json(res, status, body) { res.writeHead(status, {'content-type':'application/json; charset=utf-8'}); res.end(JSON.stringify(body)); }
function log(level, event, details={}) { console.log(JSON.stringify({timestamp:new Date().toISOString(),level,event,...details})); }
function requestJson(url, options={}) { return new Promise((resolve,reject)=>{ const req=http.request(url,{timeout:1500,...options},res=>{let data='';res.on('data',c=>{data+=c;if(data.length>100000){req.destroy(new Error('response too large'));}});res.on('end',()=>{try{resolve({status:res.statusCode,body:JSON.parse(data)});}catch(e){reject(e);}});});req.on('timeout',()=>req.destroy(new Error('timeout')));req.on('error',reject);req.end(options.body||undefined);}); }
function readBody(req,max=10000){return new Promise((resolve,reject)=>{let body='';req.on('data',c=>{body+=c;if(body.length>max){reject(new Error('payload too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(body));}catch{reject(new Error('invalid JSON'));}});req.on('error',reject);});}
module.exports={json,log,requestJson,readBody,randomUUID};
