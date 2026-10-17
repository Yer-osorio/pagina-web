const cfg = window.GIFT_CONFIG;
const $ = (s) => document.querySelector(s);
$("#nameOne").textContent = cfg.names.first;
$("#nameTwo").textContent = cfg.names.second;
$("#letterText").textContent = cfg.letter;
$("#startDateLabel").textContent = "Desde " + new Date(cfg.startDate).toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"});

function updateCounter(){
  const start = new Date(cfg.startDate), now = new Date();
  if(Number.isNaN(start.getTime())) { $("#timeTogether").textContent="Edita la fecha en config.js"; return; }
  let ms = Math.max(0, now - start);
  const days = Math.floor(ms/86400000); ms -= days*86400000;
  const hours = Math.floor(ms/3600000); ms -= hours*3600000;
  const minutes = Math.floor(ms/60000); ms -= minutes*60000;
  const seconds = Math.floor(ms/1000);
  const years = Math.floor(days/365.2425), months = Math.floor((days-years*365.2425)/30.436875);
  $("#timeTogether").textContent = `${years ? years+" años, " : ""}${months} meses y ${Math.floor(days-(years*365.2425)-(months*30.436875))} días`;
  $("#startDateLabel").textContent = `${hours}h ${minutes}m ${seconds}s juntos hoy`;
}
updateCounter(); setInterval(updateCounter,1000);

$("#openLetter").addEventListener("click",()=>{ $("#envelope").classList.add("open"); setTimeout(()=>openModal("letterModal"),350); });
function openModal(id){ const el=document.getElementById(id); el.classList.add("show"); el.setAttribute("aria-hidden","false"); }
function closeModal(id){ const el=document.getElementById(id); el.classList.remove("show"); el.setAttribute("aria-hidden","true"); }
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));

const coupons=$("#couponList");
cfg.coupons.forEach((c,i)=>{
 const card=document.createElement("div"); card.className="coupon";
 card.innerHTML=`<div><h3>♥ ${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p></div><button class="outline-btn">Canjear</button>`;
 const btn=card.querySelector("button");
 btn.addEventListener("click",()=>{if(card.classList.contains("redeemed"))return;card.classList.add("redeemed");btn.textContent="Canjeado ✓";$("#messageTitle").textContent="¡Vale canjeado!";$("#messageBody").textContent=`Has canjeado: ${c.title}. ¡Ahora toca hacerlo realidad!`;openModal("messageModal");});
 coupons.appendChild(card);
});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function renderPlaces(){
 const list=$("#placeList"); list.innerHTML="";
 cfg.places.forEach((p,i)=>{const el=document.createElement("div");el.className="place-item";el.innerHTML=`<div><h3>${i+1}. ${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p></div>`;list.appendChild(el);});
}
renderPlaces();
window.initGiftMap = function(){
 const map = new google.maps.Map(document.getElementById("map"),{center:{lat:cfg.places[0]?.lat||6.2442,lng:cfg.places[0]?.lng||-75.5812},zoom:12,styles:[{elementType:"geometry",stylers:[{color:"#24211b"}]},{elementType:"labels.text.fill",stylers:[{color:"#d9cba8"}]},{featureType:"road",elementType:"geometry",stylers:[{color:"#4c4434"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#141c20"}]}]});
 const info = new google.maps.InfoWindow();
 cfg.places.forEach(p=>{const marker=new google.maps.Marker({position:{lat:Number(p.lat),lng:Number(p.lng)},map,title:p.title});marker.addListener("click",()=>{info.setContent(`<div style="color:#222"><strong>${escapeHTML(p.title)}</strong><br>${escapeHTML(p.description)}</div>`);info.open(map,marker);});});
};
if(cfg.googleMapsApiKey && cfg.googleMapsApiKey!=="PEGA_AQUI_TU_API_KEY"){
 const script=document.createElement("script");script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(cfg.googleMapsApiKey)}&callback=initGiftMap&loading=async`;script.async=true;script.defer=true;script.onerror=()=>{$("#map").innerHTML="No se pudo cargar Google Maps. Revisa la clave y la facturación en Google Cloud.";};document.head.appendChild(script);
}else{$("#map").innerHTML='<div style="padding:35px;color:#d6c7a4;text-align:center">Configura tu API key en <code>js/config.js</code> para mostrar Google Maps.<br><br>Los lugares que agregues en la configuración aparecerán aquí cuando actives la API.</div>';}

// YouTube: los navegadores suelen bloquear autoplay con sonido. Se intenta en silencio.
function youtubeId(url){try{const u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1);if(u.searchParams.get("v"))return u.searchParams.get("v");const m=u.pathname.match(/\/(embed|shorts)\/([^/]+)/);return m?m[2]:"";}catch{return "";}}
const videoId=youtubeId(cfg.youtubeUrl);
if(videoId){const frame=document.createElement("iframe");frame.title="Nuestra canción";frame.width="1";frame.height="1";frame.style.cssText="position:fixed;bottom:0;left:0;opacity:.01;pointer-events:none";frame.allow="autoplay; encrypted-media; picture-in-picture";frame.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&loop=1&playlist=${encodeURIComponent(videoId)}&playsinline=1`;frame.referrerPolicy="strict-origin-when-cross-origin";document.body.appendChild(frame);}

const canvas=$("#wheel"),ctx=canvas.getContext("2d");let angle=0,spinning=false;
function drawWheel(){
 const items=cfg.prizes, n=items.length, cx=300,cy=300,r=285;ctx.clearRect(0,0,600,600);
 items.forEach((item,i)=>{const a=angle+i*2*Math.PI/n;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a,a+2*Math.PI/n);ctx.closePath();ctx.fillStyle=i%2?"#3c372b":"#62502e";ctx.fill();ctx.strokeStyle="#b18a3d";ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(cx,cy);ctx.rotate(a+Math.PI/n);ctx.textAlign="right";ctx.fillStyle="#f6e8c3";ctx.font="20px Georgia";let label=item.length>19?item.slice(0,17)+"…":item;ctx.fillText(label,r-22,7);ctx.restore();});
 ctx.beginPath();ctx.arc(cx,cy,34,0,Math.PI*2);ctx.fillStyle="#d5a83d";ctx.fill();ctx.fillStyle="#231a09";ctx.font="30px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("♥",cx,cy+1);
}
drawWheel();
$("#spinWheel").addEventListener("click",()=>{if(spinning)return;spinning=true;$("#spinWheel").disabled=true;const start=angle,extra=(Math.PI*2)*(5+Math.random()*4)+Math.random()*Math.PI*2;const duration=4200,begin=performance.now();function animate(t){const p=Math.min(1,(t-begin)/duration),ease=1-Math.pow(1-p,4);angle=start+extra*ease;drawWheel();if(p<1)requestAnimationFrame(animate);else{spinning=false;$("#spinWheel").disabled=false;const n=cfg.prizes.length;const normalized=((Math.PI*1.5-angle)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);const index=Math.floor(normalized/(Math.PI*2/n))%n;$("#wheelResult").textContent="Te ganaste: "+cfg.prizes[index]+" ♡";}}requestAnimationFrame(animate);});

const noBtn=$("#noBtn"), yesBtn=$("#yesBtn");let noMoves=0;
function dodgeNo(){noMoves++;noBtn.style.position="fixed";noBtn.style.zIndex="15";noBtn.style.left=(8+Math.random()*75)+"vw";noBtn.style.top=(8+Math.random()*78)+"vh";noBtn.style.transform=`rotate(${Math.random()*30-15}deg)`;if(noMoves>=7){noBtn.style.opacity="0";noBtn.style.pointerEvents="none";setTimeout(()=>noBtn.remove(),350);}}
noBtn.addEventListener("mouseenter",dodgeNo);noBtn.addEventListener("click",dodgeNo);noBtn.addEventListener("touchstart",e=>{e.preventDefault();dodgeNo();},{passive:false});
yesBtn.addEventListener("click",()=>{$("#messageTitle").textContent="¡Me hiciste muy feliz! 💛";$("#messageBody").textContent="Prometo cuidar este cariño, seguir creando recuerdos y hacer que esta historia tenga muchos capítulos bonitos.";openModal("messageModal");$("#proposalMessage").textContent="¡Dijiste que sí! Este es el comienzo de algo muy bonito ♡";noBtn.remove();});
