
const cfg = window.GIFT_CONFIG;
const $ = (selector) => document.querySelector(selector);

// ========================================
// INFORMACIÓN PRINCIPAL
// ========================================

$("#nameOne").textContent = cfg.names.first;
$("#nameTwo").textContent = cfg.names.second;
$("#letterText").textContent = cfg.letter;

$("#startDateLabel").textContent =
    "Desde " +
    new Date(cfg.startDate).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });


// ========================================
// CONTADOR DE TIEMPO
// ========================================

function updateCounter() {
    const start = new Date(cfg.startDate);
    const now = new Date();

    if (Number.isNaN(start.getTime())) {
        $("#timeTogether").textContent =
            "Edita la fecha en config.js";
        return;
    }

    let ms = Math.max(0, now - start);

    const days = Math.floor(ms / 86400000);
    ms -= days * 86400000;

    const hours = Math.floor(ms / 3600000);
    ms -= hours * 3600000;

    const minutes = Math.floor(ms / 60000);
    ms -= minutes * 60000;

    const seconds = Math.floor(ms / 1000);

    const years = Math.floor(days / 365.2425);

    const months = Math.floor(
        (days - years * 365.2425) / 30.436875
    );

    const remainingDays = Math.floor(
        days -
        years * 365.2425 -
        months * 30.436875
    );

    $("#timeTogether").textContent =
        `${years ? years + " años, " : ""}` +
        `${months} meses y ${remainingDays} días`;

    $("#startDateLabel").textContent =
        `${hours}h ${minutes}m ${seconds}s juntos hoy`;
}

updateCounter();
setInterval(updateCounter, 1000);


// ========================================
// CARTA Y VENTANAS MODALES
// ========================================

$("#openLetter").addEventListener("click", () => {
    $("#envelope").classList.add("open");

    setTimeout(() => {
        openModal("letterModal");
    }, 350);
});

function openModal(id) {
    const element = document.getElementById(id);

    element.classList.add("show");
    element.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
    const element = document.getElementById(id);

    element.classList.remove("show");
    element.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
        closeModal(button.dataset.close);
    });
});

document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});


// ========================================
// CUPONES CANJEABLES
// ========================================

const coupons = $("#couponList");

cfg.coupons.forEach((coupon) => {
    const card = document.createElement("div");
    card.className = "coupon";

    card.innerHTML = `
        <div>
            <h3>♥ ${escapeHTML(coupon.title)}</h3>
            <p>${escapeHTML(coupon.description)}</p>
        </div>

        <button class="outline-btn">
            Canjear
        </button>
    `;

    const button = card.querySelector("button");

    button.addEventListener("click", () => {
        if (card.classList.contains("redeemed")) {
            return;
        }

        card.classList.add("redeemed");
        button.textContent = "Canjeado ✓";

        $("#messageTitle").textContent = "¡Momento canjeado!";

        $("#messageBody").textContent =
            `Has canjeado: ${coupon.title}. ` +
            "¡Ahora toca hacerlo realidad!";

        openModal("messageModal");
    });

    coupons.appendChild(card);
});


// ========================================
// PROTECCIÓN DE TEXTO HTML
// ========================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[character];
    });
}


// ========================================
// LISTA DE LUGARES ESPECIALES
// ========================================

let giftMap = null;
let placeMarkers = [];
let placeInfoWindow = null;
let activePlaceIndex = -1;

function selectPlace(index) {
    const place = cfg.places[index];
    const marker = placeMarkers[index];
    if (!place || !giftMap || !marker) return;

    activePlaceIndex = index;
    document.querySelectorAll(".place-item").forEach((item, itemIndex) => {
        item.classList.toggle("is-active", itemIndex === index);
        item.setAttribute("aria-pressed", itemIndex === index ? "true" : "false");
    });

    const position = {
        lat: Number(place.lat),
        lng: Number(place.lng),
    };

    // Animación suave hacia el recuerdo seleccionado y acercamiento automático.
    giftMap.panTo(position);
    giftMap.setZoom(16);

    placeInfoWindow.setContent(`
        <div style="color:#222;max-width:240px;padding:4px">
            <strong>${escapeHTML(place.title)}</strong>
            <p style="margin:8px 0 0;line-height:1.5">${escapeHTML(place.description)}</p>
        </div>
    `);
    placeInfoWindow.open({ map: giftMap, anchor: marker });
}

function renderPlaces() {
    const list = $("#placeList");
    list.innerHTML = "";

    cfg.places.forEach((place, index) => {
        const element = document.createElement("button");
        element.type = "button";
        element.className = "place-item";
        element.setAttribute("aria-pressed", "false");
        element.setAttribute("aria-label", `Ver en el mapa: ${place.title}`);

        element.innerHTML = `
            <div>
                <h3>${index + 1}. ${escapeHTML(place.title)}</h3>
                <p>${escapeHTML(place.description)}</p>
            </div>
            <span class="place-item__arrow" aria-hidden="true">↗</span>
        `;

        element.addEventListener("click", () => selectPlace(index));
        list.appendChild(element);
    });
}
renderPlaces();


// ========================================
// GOOGLE MAPS CON ESTILO CLARO
// ========================================


window.initGiftMap = function () {
    // Obtener el primer lugar para centrar el mapa.
    const firstPlace = cfg.places[0];

    const center = firstPlace
        ? {
            lat: Number(firstPlace.lat),
            lng: Number(firstPlace.lng),
        }
        : {
            lat: 6.2442,
            lng: -75.5812,
        };

    // Crear el mapa con estilo claro y minimalista.
    const map = new google.maps.Map(
        document.getElementById("map"),
        {
            center: center,
            zoom: 12,
            mapTypeId: "roadmap",

            // Estilo minimalista en tonos pastel.
            styles: [
                {
                    elementType: "geometry",
                    stylers: [
                        { color: "#f8f9fa" },
                    ],
                },
                {
                    elementType: "labels.text.fill",
                    stylers: [
                        { color: "#64748b" },
                    ],
                },
                {
                    elementType: "labels.text.stroke",
                    stylers: [
                        { color: "#ffffff" },
                    ],
                },
                {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [
                        { color: "#ffffff" },
                    ],
                },
                {
                    featureType: "road",
                    elementType: "geometry.stroke",
                    stylers: [
                        { color: "#e2e8f0" },
                    ],
                },
                {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [
                        { color: "#c9e7f5" },
                    ],
                },
                {
                    featureType: "poi.park",
                    elementType: "geometry",
                    stylers: [
                        { color: "#dcefdc" },
                    ],
                },
                {
                    featureType: "landscape",
                    elementType: "geometry",
                    stylers: [
                        { color: "#f8f9fa" },
                    ],
                },
                {
                    featureType: "transit",
                    elementType: "geometry",
                    stylers: [
                        { color: "#edf0f2" },
                    ],
                },
            ],
        }
    );

    giftMap = map;
    placeInfoWindow = new google.maps.InfoWindow();

    // Crear marcadores y vincularlos con las tarjetas de recuerdos.
    cfg.places.forEach((place, index) => {
        const marker = new google.maps.Marker({
            position: {
                lat: Number(place.lat),
                lng: Number(place.lng),
            },
            map: map,
            title: place.title,
        });

        placeMarkers[index] = marker;

        // Pulsar un marcador también resalta su tarjeta correspondiente.
        marker.addListener("click", () => selectPlace(index));
    });
};



// ========================================
// CARGAR GOOGLE MAPS
// ========================================

if (
    cfg.googleMapsApiKey &&
    cfg.googleMapsApiKey !== "PEGA_AQUI_TU_API_KEY"
) {
    const script = document.createElement("script");

    const params = new URLSearchParams({
        key: cfg.googleMapsApiKey,
        callback: "initGiftMap",
        loading: "async",
    });

    script.src =
        `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

    script.async = true;
    script.defer = true;

    script.onerror = () => {
        $("#map").textContent =
            "No se pudo cargar Google Maps. " +
            "Revisa la clave y la configuración de Google Cloud.";
    };

    document.head.appendChild(script);
} else {
    $("#map").innerHTML = `
        <div style="
            padding: 35px;
            color: #555;
            text-align: center;
        ">
            Configura tu API key en
            <code>js/config.js</code> para mostrar Google Maps.

            <br><br>

            Los lugares que agregues en la configuración
            aparecerán aquí cuando actives la API.
        </div>
    `;
}


// ========================================
// CANCIÓN DE YOUTUBE
// ========================================

function youtubeId(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            return parsedUrl.pathname.slice(1);
        }

        const videoId = parsedUrl.searchParams.get("v");

        if (videoId) {
            return videoId;
        }

        const match = parsedUrl.pathname.match(
            /\/(embed|shorts)\/([^/]+)/
        );

        return match ? match[2] : "";
    } catch {
        return "";
    }
}

const videoId = youtubeId(cfg.youtubeUrl);

if (videoId) {
    const frame = document.createElement("iframe");

    frame.title = "Nuestra canción";
    frame.width = "1";
    frame.height = "1";

    frame.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        opacity: 0.01;
        pointer-events: none;
    `;

    frame.allow = "autoplay; encrypted-media; picture-in-picture";

    const params = new URLSearchParams({
        autoplay: "1",
        mute: "1",
        loop: "1",
        playlist: videoId,
        playsinline: "1",
    });

    frame.src =
        `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;

    frame.referrerPolicy = "strict-origin-when-cross-origin";

    document.body.appendChild(frame);
}


// ========================================
// RULETA DE PREMIOS
// ========================================

const canvas = $("#wheel");
const ctx = canvas.getContext("2d");

let angle = 0;
let spinning = false;

function drawWheel() {
    const items = cfg.prizes;
    const numberOfItems = items.length;

    const centerX = 300;
    const centerY = 300;
    const radius = 285;

    ctx.clearRect(0, 0, 600, 600);

    if (numberOfItems === 0) {
        return;
    }

    items.forEach((item, index) => {
        const startAngle =
            angle + index * 2 * Math.PI / numberOfItems;

        const endAngle =
            startAngle + 2 * Math.PI / numberOfItems;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        ctx.closePath();

        ctx.fillStyle = index % 2 ? "#3c372b" : "#62502e";
        ctx.fill();

        ctx.strokeStyle = "#b18a3d";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + Math.PI / numberOfItems);

        ctx.textAlign = "right";
        ctx.fillStyle = "#f6e8c3";
        ctx.font = "20px Georgia";

        const label =
            item.length > 19
                ? item.slice(0, 17) + "…"
                : item;

        ctx.fillText(label, radius - 22, 7);

        ctx.restore();
    });

    // Centro de la ruleta.
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, Math.PI * 2);

    ctx.fillStyle = "#d5a83d";
    ctx.fill();

    ctx.fillStyle = "#231a09";
    ctx.font = "30px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("♥", centerX, centerY + 1);
}

drawWheel();

$("#spinWheel").addEventListener("click", () => {
    if (spinning || cfg.prizes.length === 0) {
        return;
    }

    spinning = true;
    $("#spinWheel").disabled = true;

    const startAngle = angle;

    const extraRotation =
        2 * Math.PI * (5 + Math.random() * 4) +
        Math.random() * Math.PI * 2;

    const duration = 4200;
    const begin = performance.now();

    function animate(time) {
        const progress = Math.min(
            1,
            (time - begin) / duration
        );

        const ease = 1 - Math.pow(1 - progress, 4);

        angle = startAngle + extraRotation * ease;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            $("#spinWheel").disabled = false;

            const numberOfItems = cfg.prizes.length;

            const normalizedAngle =
                (
                    (Math.PI * 1.5 - angle) % (Math.PI * 2) +
                    Math.PI * 2
                ) % (Math.PI * 2);

            const index = Math.floor(
                normalizedAngle /
                (Math.PI * 2 / numberOfItems)
            ) % numberOfItems;

            $("#wheelResult").textContent =
                "Te ganaste: " + cfg.prizes[index] + " ♡";
        }
    }

    requestAnimationFrame(animate);
});


// ========================================
// PREGUNTA: ¿QUIERES SER MI NOVIO/A?
// ========================================

const noBtn = $("#noBtn");
const yesBtn = $("#yesBtn");

let noMoves = 0;

function dodgeNo() {
    noMoves++;

    noBtn.style.position = "fixed";
    noBtn.style.zIndex = "15";

    noBtn.style.left =
        (8 + Math.random() * 75) + "vw";

    noBtn.style.top =
        (8 + Math.random() * 78) + "vh";

    noBtn.style.transform =
        `rotate(${Math.random() * 30 - 15}deg)`;

    if (noMoves >= 7) {
        noBtn.style.opacity = "0";
        noBtn.style.pointerEvents = "none";

        setTimeout(() => {
            noBtn.remove();
        }, 350);
    }
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("click", dodgeNo);

noBtn.addEventListener("touchstart", (event) => {
    event.preventDefault();
    dodgeNo();
}, {
    passive: false,
});

yesBtn.addEventListener("click", () => {
    $("#messageTitle").textContent =
        "¡Me haces muy feliz! 🤍";

    $("#messageBody").textContent =
        "Prometo cuidar este amor, seguir creando recuerdos " +
        "y hacer que esta historia tenga muchos capítulos bonitos.";

    openModal("messageModal");

    $("#proposalMessage").textContent =
        "¡Dijiste que sí! Este es el comienzo de algo muy bonito ♡";

    noBtn.remove();
});
