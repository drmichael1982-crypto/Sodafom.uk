/** Standalone learning server. Parent accounts require explicit secure backend setup. */
import express from 'express';
import { resolve } from 'node:path';
import chat from '../src/server/api/chat/POST';
import { brainStatus } from '../src/server/lib/archie-brain';
import { createParentAccountRouter, getPreviewParentSession } from '../src/server/lib/archie-parent-auth';
import { createParentAIRouter } from '../src/server/lib/archie-parent-ai';
const app=express();
app.disable('x-powered-by');
app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');next();});
app.use(createParentAccountRouter());
app.use('/api/parents/ai', express.json({limit:'8kb'}), createParentAIRouter(getPreviewParentSession));
app.use(express.json({limit:'32kb'}));
app.get('/api/health',(_req,res)=>res.json({ok:true,mode:'archie-test'}));
app.get('/api/archie/status',(_req,res)=>{res.setHeader('Cache-Control','no-store');res.json(brainStatus());});
app.post('/api/chat',chat);
app.post('/api/track/pageview',(_req,res)=>res.status(204).end());
app.use((error:{type?:string},_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  const status=error.type==='entity.too.large'?413:error.type==='entity.parse.failed'?400:503;
  res.status(status).json({error:'Request could not be completed. Learning on this device is still available.'});
});
app.use('/api',(_req,res)=>res.status(503).json({error:'Accounts and cloud progress are not connected in this test version.'}));
const root=resolve('dist/client');
app.use(express.static(root,{setHeaders:(res,path)=>{if(path.endsWith('index.html'))res.setHeader('Cache-Control','no-store');}}));
app.use((req,res)=>{if(req.method!=='GET')return res.status(405).end();if(req.path.includes('.'))return res.status(404).end();res.sendFile(resolve(root,'index.html'));});
app.listen(Number(process.env.PORT||4173),process.env.HOST||'0.0.0.0',()=>console.log(`Archie test app is listening on port ${process.env.PORT||4173}`));
