/** Standalone test server: no production database, account writes or payments. */
import express from 'express';
import { resolve } from 'node:path';
import chat from '../src/server/api/chat/POST';
import { brainStatus } from '../src/server/lib/archie-brain';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');next();});
app.get('/api/health',(_req,res)=>res.json({ok:true,mode:'archie-test'}));
app.get('/api/archie/status',(_req,res)=>{res.setHeader('Cache-Control','no-store');res.json(brainStatus());});
app.post('/api/chat',chat);
app.get('/api/auth/get-session',(_req,res)=>res.json(null));
app.post('/api/track/pageview',(_req,res)=>res.status(204).end());
app.use('/api',(_req,res)=>res.status(503).json({error:'Accounts and cloud progress are not connected in this test version.'}));
const root=resolve('dist/client');
app.use(express.static(root,{setHeaders:(res,path)=>{if(path.endsWith('index.html'))res.setHeader('Cache-Control','no-store');}}));
app.use((req,res)=>{if(req.method!=='GET')return res.status(405).end();if(req.path.includes('.'))return res.status(404).end();res.sendFile(resolve(root,'index.html'));});
app.listen(Number(process.env.PORT||4173),process.env.HOST||'0.0.0.0',()=>console.log(`Archie test app is listening on port ${process.env.PORT||4173}`));
