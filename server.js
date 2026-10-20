import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app=express(),dir=path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"100kb"}));app.use(express.static(dir));
app.post("/api/suggest",async(req,res)=>{try{
 if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:"Configura GEMINI_API_KEY en .env."});
 const {mode,project,plan,allPlans=[]}=req.body||{};
 if(!project?.centralTerm||!project?.centralDescription)return res.status(400).json({error:"Falta la información del objetivo central."});
 const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
 const prompt=`Responde en español y en JSON válido: {"suggestions":[{"title":"...","description":"..."}]}. Devuelve exactamente 8 propuestas concretas, distintas, editables y útiles. No repitas ideas existentes. Proyecto: ${project.title||""}. Término central: ${project.centralTerm}. Descripción central: ${project.centralDescription}. ${mode==="plans"?"Propón ocho subplanes principales diferentes. Subplanes ya escritos: "+JSON.stringify(allPlans):"Propón ocho acciones o resultados concretos para este subplan: "+JSON.stringify(plan)}. Devuelve solo JSON, sin Markdown.`;
 const out=await ai.models.generateContent({model:"gemini-2.5-flash",contents:prompt,config:{responseMimeType:"application/json"}});
 const data=JSON.parse(out.text);if(!Array.isArray(data.suggestions))throw Error("JSON inesperado");
 res.json({suggestions:data.suggestions.slice(0,8).map(s=>({title:String(s.title||"").slice(0,180),description:String(s.description||"").slice(0,1200)}))});
 }catch(e){console.error(e.message);res.status(502).json({error:"No se pudieron generar sugerencias. Revisa la clave, la conexión y el modelo."})}});
app.listen(process.env.PORT||3000,()=>console.log("Mapa 81: http://localhost:"+(process.env.PORT||3000)));
