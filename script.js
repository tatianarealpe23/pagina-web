const PASSWORD = "11.2026";

// Cargar publicaciones al iniciar
document.addEventListener("DOMContentLoaded", cargarPublicaciones);

function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}

function volverInicio() {
    document.getElementById("menu").classList.remove("active");
}

function cambiarModo() {
    document.body.classList.toggle("dark");
}

function mostrarFormulario() {
    document.getElementById("formPublicar").style.display = "block";
}

// ============================
// PUBLICAR CON CONTRASEÑA
// ============================
function publicarContenido() {

    let clave = prompt("Ingrese la contraseña para publicar:");
    if (clave !== PASSWORD) {
        alert("Contraseña incorrecta");
        return;
    }

    let archivo = document.getElementById("mediaFile").files[0];
    let descripcion = document.getElementById("descripcionInput").value.trim();

    if (!archivo) return;

    let reader = new FileReader();

    reader.onload = function(e) {

        let tipo = archivo.type.startsWith("video") ? "video" : "imagen";

        let nueva = {
            id: Date.now(),
            tipo: tipo,
            contenido: e.target.result,
            descripcion: descripcion,
            likes: 0,
            vistas: 0,
            comentarios: []
        };

        let publicaciones = obtenerPublicaciones();
        publicaciones.unshift(nueva);
        localStorage.setItem("publicaciones", JSON.stringify(publicaciones));

        renderPublicacion(nueva);

        document.getElementById("mediaFile").value = "";
        document.getElementById("descripcionInput").value = "";
        document.getElementById("formPublicar").style.display = "none";
    };

    reader.readAsDataURL(archivo);
}

// ============================
// OBTENER PUBLICACIONES
// ============================
function obtenerPublicaciones() {
    return JSON.parse(localStorage.getItem("publicaciones")) || [];
}

// ============================
// CARGAR PUBLICACIONES
// ============================
function cargarPublicaciones() {
    let publicaciones = obtenerPublicaciones();
    publicaciones.forEach(pub => renderPublicacion(pub));
}

// ============================
// RENDER PUBLICACION
// ============================
function renderPublicacion(pub) {

    let feed = document.getElementById("feed");
    let post = document.createElement("div");
    post.classList.add("post");
    post.dataset.id = pub.id;

    let media = pub.tipo === "video"
        ? `<video src="${pub.contenido}" class="post-img" controls></video>`
        : `<img src="${pub.contenido}" class="post-img">`;

    post.innerHTML = `
        <div class="post-header">
            <div class="user-info">
                <img src="logo.png" class="user-img">
                <span>iemmm 2026</span>
            </div>
            <span class="eliminar-btn" onclick="eliminarPublicacion(${pub.id})">🗑</span>
        </div>

        ${media}

        ${pub.descripcion ? `<div class="descripcion-post">${pub.descripcion}</div>` : ""}

        <div class="post-actions">
            <span onclick="darLike(${pub.id})">❤️ <span id="likes-${pub.id}">${pub.likes}</span></span>
            <span>👁 <span id="vistas-${pub.id}">${pub.vistas}</span></span>
        </div>

        <div class="comentarios">
            <input type="text" placeholder="Escribe un comentario 😀"
                onkeypress="agregarComentario(event, ${pub.id}, this)">
            <div class="lista-comentarios" id="comentarios-${pub.id}"></div>
        </div>
    `;

    feed.appendChild(post);

    // Cargar comentarios guardados
    pub.comentarios.forEach(c => {
        agregarComentarioVisual(pub.id, c);
    });

    // Vista automática SOLO en imágenes cada 5 minutos
    if (pub.tipo === "imagen") {
        setInterval(() => aumentarVista(pub.id), 300000);
    }

    // Vista manual en videos
    if (pub.tipo === "video") {
        post.querySelector("video").addEventListener("play", () => aumentarVista(pub.id));
    }
}

// ============================
// AUMENTAR VISTA
// ============================
function aumentarVista(id) {

    let publicaciones = obtenerPublicaciones();
    let pub = publicaciones.find(p => p.id === id);
    if (!pub) return;

    pub.vistas++;
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));

    let vistaElemento = document.getElementById("vistas-" + id);
    if (vistaElemento) {
        vistaElemento.innerText = pub.vistas;
    }
}

// ============================
// LIKE
// ============================
function darLike(id) {

    let publicaciones = obtenerPublicaciones();
    let pub = publicaciones.find(p => p.id === id);

    pub.likes++;
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));

    document.getElementById("likes-" + id).innerText = pub.likes;
}

// ============================
// COMENTARIOS
// ============================
function agregarComentario(event, id, input) {

    if (event.key === "Enter") {

        let texto = input.value.trim();
        if (texto === "") return;

        let publicaciones = obtenerPublicaciones();
        let pub = publicaciones.find(p => p.id === id);

        pub.comentarios.push(texto);
        localStorage.setItem("publicaciones", JSON.stringify(publicaciones));

        agregarComentarioVisual(id, texto);

        input.value = "";
    }
}

function agregarComentarioVisual(id, texto) {

    let lista = document.getElementById("comentarios-" + id);
    if (!lista) return;

    let comentario = document.createElement("div");
    comentario.innerText = "😀 " + texto;
    lista.appendChild(comentario);
}

// ============================
// ELIMINAR CON CONTRASEÑA
// ============================
function eliminarPublicacion(id) {

    let clave = prompt("Ingrese la contraseña para eliminar:");
    if (clave !== PASSWORD) {
        alert("Contraseña incorrecta");
        return;
    }

    let publicaciones = obtenerPublicaciones();
    publicaciones = publicaciones.filter(p => p.id !== id);

    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));

    let elemento = document.querySelector(`[data-id='${id}']`);
    if (elemento) {
        elemento.remove();
    }
}