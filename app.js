const GEMINI_API_URL="https://script.google.com/macros/s/AKfycbxDUQ6pgNvjlJCU3B-Tpe4jVyI1q7-E5crac_cS2VSbc2r5rG35Y-xl4K8MGA4iMrcl/exec";

const $=s=>document.querySelector(s),KEY="mapa81-v1",colors=["#3678cf","#df5146","#e9b51b","#299b61","#28b7bf","#f0781c","#9875bf","#d4a0b5"];

let project=null,active=0,showDesc=true,mode="",suggestions=[];

const blankSlot=()=>({title:"",description:"",done:false}),blankPlan=()=>({title:"",description:"",slots:Array.from({length:8},blankSlot)});

const blankProject=()=>({projectTitle:"",mapTitle:"",centralTerm:"",centralDescription:"",plans:Array.from({length:8},blankPlan)});

const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2300)}

function save(msg=false){if(!project)return;localStorage.setItem(KEY,JSON.stringify(project));$("#saveStatus").textContent="Guardado · "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});progress();renderButtons();renderMap();if(msg)toast("Proyecto guardado en este navegador.")}

function progress(){let n=project.plans.reduce((a,p)=>a+p.slots.filter(s=>s.done).length,0);$("#progressText").textContent=`${n} de 64 casillas completadas`,$("#progressPercent").textContent=Math.round(n/64*100)+"%";$("#progressBar").style.width=n/64*100+"%"}

function header(){ $("#headingTitle").textContent=project.projectTitle;$("#headingDescription").textContent=project.centralDescription;$("#mapEyebrow").textContent=project.mapTitle||"TU MAPA"}

function startWorkspace(){ $("#setup").hidden=true;$("#workspace").hidden=false;header();renderButtons();renderEditor();renderMap();progress()}

function renderButtons(){ $("#planButtons").innerHTML=project.plans.map((p,i)=>`<button class="plan-button ${i===active?"active":""}" data-p="${i}"><span class="num">${i+1}</span><span class="name">${esc(p.title||"Subplan "+(i+1))}</span><span class="count">${p.slots.filter(s=>s.done).length}/8</span></button>`).join("");$("#planButtons").querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{active=+b.dataset.p;renderButtons();renderEditor()})}

function renderEditor(){const p=project.plans[active];$(".empty").hidden=true;$("#planEditor").hidden=false;$("#planNumber").textContent=`SUBPLAN ${active+1} DE 8`;$("#planHeading").textContent=p.title||"Subplan "+(active+1);$("#planTitle").value=p.title;$("#planDescription").value=p.description;$("#planStatus").textContent=p.slots.filter(s=>s.done).length+"/8 listas";

                        $("#slots").innerHTML=p.slots.map((s,i)=>`<article class="slot ${s.done?"done":""}" data-s="${i}"><div class="slot-top"><span>CASILLA ${i+1}</span><label><input type="checkbox" data-f="done" ${s.done?"checked":""}> Lista</label></div><label>Título<input data-f="title" value="${esc(s.title)}" placeholder="¿Qué hay que hacer?"></label><label>Descripción<textarea data-f="description" rows="3" placeholder="¿En qué consiste este paso?">${esc(s.description)}</textarea></label></article>`).join("");

                        $("#slots").querySelectorAll(".slot").forEach(card=>card.querySelectorAll("[data-f]").forEach(el=>el.addEventListener(el.type==="checkbox"?"change":"input",()=>{let k=el.dataset.f,s=p.slots[+card.dataset.s];s[k]=k==="done"?el.checked:el.value;card.classList.toggle("done",s.done);$("#planStatus").textContent=p.slots.filter(x=>x.done).length+"/8 listas";save()})))}

function renderMap(){
 const planAtBlock=[[0,1,2],[7,null,3],[6,5,4]];
 const mirrorAtCell=[[0,1,2],[7,null,3],[6,5,4]];
 const around=[[0,0],[0,1],[0,2],[1,2],[2,2],[2,1],[2,0],[1,0]];
 let html="";
 for(let r=0;r<9;r++){
  for(let c=0;c<9;c++){
   const coord=String.fromCharCode(65+c)+(r+1);
   const br=Math.floor(r/3),bc=Math.floor(c/3),lr=r%3,lc=c%3;
   const isMiddle=br===1&&bc===1;
   if(isMiddle){
    if(lr===1&&lc===1){
     const done=project.plans.reduce((n,p)=>n+p.slots.filter(s=>s.done).length,0);
     html+=`<button class="map-cell center central-cell" data-center aria-label="Editar objetivo central">
      <span class="coord">${coord}</span><span class="kind">OBJETIVO</span>
      <span class="title">${esc(project.centralTerm||"Objetivo central")}</span>
      <span class="desc">${esc(project.centralDescription||"Define el resultado que quieres conseguir.")}</span>
      <span class="count">${done}/64 tareas</span></button>`;
    } else {
     const v=mirrorAtCell[lr][lc],p=project.plans[v],n=p.slots.filter(s=>s.done).length;
     html+=`<button class="map-cell mirror-cell" data-map="${v}" style="--color:${colors[v]}" aria-label="Editar subplan ${v+1}">
      <span class="coord">${coord}</span><span class="kind">SUBPLAN ${v+1}</span>
      <span class="title">${esc(p.title||"Subplan "+(v+1))}</span>
      <span class="count">${n}/8 tareas</span></button>`;
    }
   } else if(lr===1&&lc===1){
    const v=planAtBlock[br][bc],p=project.plans[v],n=p.slots.filter(s=>s.done).length;
    html+=`<button class="map-cell subplan-cell" data-map="${v}" style="--color:${colors[v]}" aria-label="Editar subplan ${v+1}">
     <span class="coord">${coord}</span><span class="kind">SUBPLAN ${v+1}</span>
     <span class="title">${esc(p.title||"Subplan "+(v+1))}</span>
     <span class="desc">${esc(p.description||"Añade una descripción.")}</span>
     <span class="count">${n}/8 tareas</span></button>`;
   } else {
    const v=planAtBlock[br][bc],p=project.plans[v],slotIndex=around.findIndex(([ar,ac])=>ar===lr&&ac===lc),s=p.slots[slotIndex];
    html+=`<button class="map-cell task-cell ${s.done?"task-done":""}" data-map="${v}" data-slot="${slotIndex}" style="--color:${colors[v]}" aria-label="${coord}: ${esc(s.title||"Tarea sin definir")}${s.done?", completada":""}">
     <span class="coord">${coord}</span><span class="task-mark">${s.done?"✓":"○"}</span>
     <span class="title">${esc(s.title||"Tarea "+(slotIndex+1))}</span>
     <span class="desc">${esc(s.description||"Pendiente de definir")}</span></button>`;
   }
  }
 }
 $("#map").innerHTML=html;
 $("#map").classList.toggle("hide-desc",!showDesc);
 $("#map").querySelectorAll("[data-map]").forEach(b=>b.onclick=()=>{
  active=+b.dataset.map;renderButtons();renderEditor();
  $("#editor").scrollIntoView({behavior:"smooth",block:"start"});
  if(b.hasAttribute("data-slot")){
   const target=document.querySelector(`.slot[data-s="${b.dataset.slot}"]`);
   if(target){target.scrollIntoView({behavior:"smooth",block:"center"});target.classList.add("focus-slot");setTimeout(()=>target.classList.remove("focus-slot"),1200)}
  }
 });
 const center=$("#map").querySelector("[data-center]");
 if(center)center.onclick=editCentral;
}
function editCentral(){for(const [id,key] of [["editProjectTitle","projectTitle"],["editCentralTerm","centralTerm"],["editMapTitle","mapTitle"],["editCentralDescription","centralDescription"]])$("#"+id).value=project[key];$("#centralDialog").showModal()}
$("#projectForm").onsubmit=e=>{e.preventDefault();project=blankProject();for(const [id,key] of [["projectTitle","projectTitle"],["centralTerm","centralTerm"],["mapTitle","mapTitle"],["centralDescription","centralDescription"]])project[key]=$("#"+id).value.trim();project.mapTitle ||= "Mi mapa";active=0;save();startWorkspace()};
$("#editCentral").onclick=editCentral;$("#closeCentral").onclick=()=>$("#centralDialog").close();
$("#centralForm").onsubmit=e=>{e.preventDefault();for(const [id,key] of [["editProjectTitle","projectTitle"],["editCentralTerm","centralTerm"],["editMapTitle","mapTitle"],["editCentralDescription","centralDescription"]])project[key]=$("#"+id).value.trim();$("#centralDialog").close();header();save()};
$("#planTitle").oninput=e=>{project.plans[active].title=e.target.value;$("#planHeading").textContent=e.target.value||"Subplan "+(active+1);renderButtons();renderMap();save()};
$("#planDescription").oninput=e=>{project.plans[active].description=e.target.value;renderMap();save()};
$("#saveProject").onclick=()=>save(true);$("#newProject").onclick=()=>{if(project&&!confirm("¿Crear otro proyecto? El actual seguirá guardado en este navegador."))return;project=null;$("#workspace").hidden=true;$("#setup").hidden=false;$("#projectForm").reset()};
$("#start").onclick=()=>$("#planTitle").focus();$("#toggleDescriptions").onclick=()=>{showDesc=!showDesc;$("#toggleDescriptions").textContent=showDesc?"Ocultar descripciones":"Mostrar descripciones";renderMap()};
$("#suggestPlans").onclick=()=>askAI("plans");$("#suggestSlots").onclick=()=>askAI("slots");


function requestGeminiJSONP(payload) {
  return new Promise((resolve, reject) => {
    const callback = "mapa81Callback_" +
      Date.now() + "_" + Math.floor(Math.random() * 1000000);

    const script = document.createElement("script");
    let finished = false;

    function cleanup() {
      if (finished) return;
      finished = true;
      delete window[callback];
      script.remove();
      clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Tiempo de espera agotado. Inténtalo de nuevo."));
    }, 30000);

    window[callback] = data => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo conectar con Apps Script."));
    };

    script.src = GEMINI_API_URL +
      "?callback=" + encodeURIComponent(callback) +
      "&payload=" + encodeURIComponent(JSON.stringify(payload));

    document.head.appendChild(script);
  });
}

async function askAI(m) {
  mode = m;
  const p = project.plans[active];

  $("#dialogTitle").textContent =
    m === "plans"
      ? "Ideas para los ocho subplanes"
      : "Ideas para las ocho casillas";

  $("#dialogIntro").textContent =
    m === "plans"
      ? "Propuestas de áreas distintas para alcanzar tu objetivo."
      : "Propuestas concretas para desarrollar este subplan.";

  $("#suggestionList").innerHTML = "<p>Consultando Gemini…</p>";
  $("#suggestions").showModal();
  $("#applySuggestions").disabled = true;

  try {
    const data = await requestGeminiJSONP({
      mode,
      project: {
        title: project.projectTitle,
        centralTerm: project.centralTerm,
        centralDescription: project.centralDescription
      },
      plan: m === "slots" ? p : null,
      allPlans: project.plans.map(x => ({
        title: x.title,
        description: x.description
      }))
    });

    if (data.error) throw new Error(data.error);

    suggestions = (data.suggestions || []).slice(0, 8);

    if (!suggestions.length) {
      throw new Error("Gemini no devolvió sugerencias.");
    }

    $("#suggestionList").innerHTML = suggestions.map((s, i) =>
      `<label class="suggestion">
        <input type="checkbox" data-i="${i}" checked>
        <span><strong>${esc(s.title)}</strong>
        <p>${esc(s.description)}</p></span>
      </label>`
    ).join("");

    $("#applySuggestions").disabled = false;

  } catch (err) {
    suggestions = [];
    $("#suggestionList").innerHTML =
      `<p class="muted">No se pudieron generar las sugerencias: ${
        esc(err.message)
      }. Puedes seguir editando el mapa sin IA.</p>`;
  }
}


$("#closeSuggestions").onclick=$("#cancelSuggestions").onclick=()=>$("#suggestions").close();
$("#applySuggestions").onclick=()=>{let chosen=[...$("#suggestionList").querySelectorAll("[data-i]:checked")].map(el=>suggestions[+el.dataset.i]);if(mode==="plans"){let empty=project.plans.map((p,i)=>!p.title.trim()?i:-1).filter(i=>i>=0);chosen.forEach((s,j)=>{if(empty[j]!==undefined){project.plans[empty[j]].title=s.title;project.plans[empty[j]].description=s.description}});renderButtons();renderEditor()}else{let p=project.plans[active],empty=p.slots.map((s,i)=>!s.title.trim()?i:-1).filter(i=>i>=0);chosen.forEach((s,j)=>{if(empty[j]!==undefined){p.slots[empty[j]].title=s.title;p.slots[empty[j]].description=s.description}});renderEditor()}save(true);$("#suggestions").close();toast("Sugerencias añadidas; puedes editarlas.")};

function slug(s){return(s||"mapa").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"mapa"}

function svgEscape(s){return esc(s).replace(/&#39;/g,"&apos;")}

function svgText(s,x,y,size,color,max=32){let words=String(s||"").split(/\s+/),lines=[],line="";for(let w of words){if((line+" "+w).trim().length>max){lines.push(line);line=w}else line=(line+" "+w).trim()}if(line)lines.push(line);return lines.slice(0,5).map((l,i)=>`<text x="${x}" y="${y+i*(size+8)}" font-size="${size}" fill="${color}">${svgEscape(l)}</text>`).join("")}

function makeSvg(){
 const W=1800,pad=28,gap=5,cw=(W-pad*2-gap*8)/9,ch=cw,planAtBlock=[[0,1,2],[7,null,3],[6,5,4]],around=[[0,0],[0,1],[0,2],[1,2],[2,2],[2,1],[2,0],[1,0]];
 let body="";
 for(let r=0;r<9;r++)for(let c=0;c<9;c++){
  const x=pad+c*(cw+gap),y=pad+r*(ch+gap),coord=String.fromCharCode(65+c)+(r+1),br=Math.floor(r/3),bc=Math.floor(c/3),lr=r%3,lc=c%3;
  let fill="#f8faff",stroke="#d6dfeb",title="",sub="",textColor="#1e293b";
  if(br===1&&bc===1&&lr===1&&lc===1){
   fill="#173b68";stroke=fill;textColor="#fff";title=project.centralTerm||"Objetivo central";sub="OBJETIVO";
  }else if(br===1&&bc===1){
   const mirror=[[0,1,2],[7,null,3],[6,5,4]],v=mirror[lr][lc],p=project.plans[v];
   fill="#f0f5fc";stroke=colors[v];title=p.title||"Subplan "+(v+1);sub="SUBPLAN "+(v+1);
  }else if(lr===1&&lc===1){
   const v=planAtBlock[br][bc],p=project.plans[v];fill="#f0f5fc";stroke=colors[v];title=p.title||"Subplan "+(v+1);sub="SUBPLAN "+(v+1);
  }else{
   const v=planAtBlock[br][bc],p=project.plans[v],si=around.findIndex(([ar,ac])=>ar===lr&&ac===lc),s=p.slots[si];
   fill=s.done?"#e8f7ee":"#fff";stroke=colors[v];title=s.title||"Tarea "+(si+1);sub=s.done?"✓ LISTA":"PENDIENTE";
  }
  body+=`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  body+=`<text x="${x+7}" y="${y+13}" font-size="10" fill="${textColor}" opacity=".75">${coord}</text>`;
  body+=svgText(title,x+7,y+35,13,textColor,15);
  if(sub)body+=`<text x="${x+7}" y="${y+ch-8}" font-size="9" fill="${textColor}" opacity=".85">${svgEscape(sub)}</text>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W+70}"><rect width="100%" height="100%" fill="#fff"/><text x="${pad}" y="${W+35}" font-size="22" fill="#173b68">${svgEscape(project.projectTitle)} · ${svgEscape(project.centralTerm)}</text>${body}</svg>`;
}
$("#exportPng").onclick=()=>{if(!project)return toast("Crea primero un mapa.");let url=URL.createObjectURL(new Blob([makeSvg()],{type:"image/svg+xml"})),img=new Image();img.onload=()=>{let c=document.createElement("canvas");c.width=img.naturalWidth||1800;c.height=img.naturalHeight||1870;c.getContext("2d").drawImage(img,0,0);URL.revokeObjectURL(url);c.toBlob(b=>{let u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=slug(project.projectTitle)+"-mapa.png";a.click();URL.revokeObjectURL(u)},"image/png")};img.src=url};
$("#exportPdf").onclick=()=>{
 if(!project)return toast("Crea primero un mapa.");
 let w=window.open("","_blank");if(!w)return toast("Permite ventanas emergentes para exportar PDF.");
 const planAtBlock=[[0,1,2],[7,null,3],[6,5,4]],around=[[0,0],[0,1],[0,2],[1,2],[2,2],[2,1],[2,0],[1,0]],mirror=[[0,1,2],[7,null,3],[6,5,4]];
 let cells="";
 for(let r=0;r<9;r++)for(let c=0;c<9;c++){
  const coord=String.fromCharCode(65+c)+(r+1),br=Math.floor(r/3),bc=Math.floor(c/3),lr=r%3,lc=c%3;
  if(br===1&&bc===1&&lr===1&&lc===1){
   cells+=`<article class="cell center"><small>${coord} · OBJETIVO</small><h3>${esc(project.centralTerm||"Objetivo central")}</h3><p>${esc(project.centralDescription)}</p></article>`;
  }else if(br===1&&bc===1){
   const v=mirror[lr][lc],p=project.plans[v];cells+=`<article class="cell mirror" style="border-color:${colors[v]}"><small>${coord} · SUBPLAN ${v+1}</small><h3>${esc(p.title||"Subplan "+(v+1))}</h3></article>`;
  }else if(lr===1&&lc===1){
   const v=planAtBlock[br][bc],p=project.plans[v];cells+=`<article class="cell subplan" style="border-color:${colors[v]}"><small>${coord} · SUBPLAN ${v+1}</small><h3>${esc(p.title||"Subplan "+(v+1))}</h3><p>${esc(p.description)}</p><b>${p.slots.filter(s=>s.done).length}/8 tareas listas</b></article>`;
  }else{
   const v=planAtBlock[br][bc],p=project.plans[v],si=around.findIndex(([ar,ac])=>ar===lr&&ac===lc),s=p.slots[si];cells+=`<article class="cell task ${s.done?"done":""}" style="border-color:${colors[v]}"><small>${coord} · ${s.done?"✓ LISTA":"TAREA "+(si+1)}</small><h3>${esc(s.title||"Sin título")}</h3><p>${esc(s.description||"Sin descripción")}</p></article>`;
  }
 }
 w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(project.projectTitle)}</title><style>
 *{box-sizing:border-box}body{font:12px Arial;color:#1e293b;margin:0}h1{color:#173b68;font-size:22px;margin:0 0 5px}header{margin-bottom:12px}header p{margin:0 0 12px;color:#475569}.grid{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:3px}.cell{border:1.5px solid #ccd7e5;border-radius:4px;padding:5px;min-height:90px;overflow-wrap:anywhere;break-inside:avoid}.cell small{font-size:7px;font-weight:bold;color:#64748b}.cell h3{font-size:9px;line-height:1.2;margin:6px 0 3px}.cell p{font-size:7px;line-height:1.25;margin:3px 0}.center{background:#173b68;color:#fff}.center small,.center p{color:#d5e3f5}.mirror{background:#f0f5fc}.subplan{background:#f8faff}.task.done{background:#e8f7ee}.details{page-break-before:always}.plan{break-inside:avoid;margin:15px 0}.task-detail{border-bottom:1px solid #ddd;padding:7px;font-size:10px}.task-detail p{margin:3px 0;color:#475569}@page{size:A3 landscape;margin:10mm}
 </style></head><body><header><h1>${esc(project.projectTitle)}</h1><p><b>${esc(project.centralTerm)}</b> — ${esc(project.centralDescription)}</p></header><div class="grid">${cells}</div><section class="details"><h1>Detalle de las 64 tareas</h1>${project.plans.map((p,i)=>`<div class="plan"><h2>${i+1}. ${esc(p.title||"Subplan "+(i+1))}</h2><p>${esc(p.description)}</p>${p.slots.map((s,j)=>`<div class="task-detail"><b>${j+1}. ${esc(s.title||"Sin título")}</b> ${s.done?"✓ Completada":"— Pendiente"}<p>${esc(s.description||"Sin descripción")}</p></div>`).join("")}</div>`).join("")}</section><script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);
 w.document.close();
};
try{let saved=JSON.parse(localStorage.getItem(KEY));if(saved?.plans?.length===8){project=saved;startWorkspace()}}catch(e){}
if("serviceWorker"in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("./sw.js").catch(()=>{});
