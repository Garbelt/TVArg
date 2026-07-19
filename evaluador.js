// ==========================================
// EVALUADOR TVARG
// ETAPA 1: CRONOMETRO DE CANAL
// ==========================================

let canalEvaluadoActual = null;
let fuenteEvaluadaActual = null;

let intervaloCronometroCanal = null;
let segundosCanal = 0;

let timerEvaluacion = null;
let despuesDeEvaluar = false;

let timerEvaluacionAutomatica = null;
let evaluacionAutomaticaActiva = false;


// ==========================================
// INICIAR EVALUACION DE UN ITEM
// ==========================================

function iniciarEvaluacionCanal(item, fuente){

    // ==========================
    // EXCEPCIÓN RADIO
    // ==========================
    if(item.tipo === "radio"){
        return;
    }


    // ==========================
    // EXCEPCIÓN CRONOMETRO GENERAL
    // ==========================
    if(
        typeof window.estaActivoCronometroGeneral === "function" &&
        window.estaActivoCronometroGeneral()
    ){
        console.log(
            "Evaluación cancelada: cronometro general activo"
        );
        return;
    }


    // ==========================
    // SOLO HLS / YOUTUBE / WEB
    // ==========================
    if(
        fuente.tipo !== "hls" &&
        fuente.tipo !== "youtube" &&
        fuente.tipo !== "web"
    ){
        return;
    }


    // ==========================
    // BLOQUEO 48 HORAS
    // ==========================
canalEvaluadoActual = item.nombre;
fuenteEvaluadaActual = fuente;

const clave = obtenerClaveEvaluacion();

if(!puedeEvaluarse(clave)){
    console.log(
        "Fuente bloqueada:",
        clave
    );
    return;
}


    iniciarCronometroCanal(item.nombre);
}



// ==========================================
// INICIAR CRONOMETRO CANAL
// ==========================================

function iniciarCronometroCanal(nombreCanal){
    detenerCronometroCanal();
    canalEvaluadoActual = nombreCanal;
    segundosCanal = 0;
    intervaloCronometroCanal =
        setInterval(()=>{
            segundosCanal++;
            console.log(
                "Canal:",
                canalEvaluadoActual,
                "Tiempo:",
                segundosCanal
            );
        },1000);
    programarEvaluacionAutomatica();
}

// ==========================================
// DETENER CRONOMETRO CANAL
// ==========================================

function detenerCronometroCanal(){
    if(intervaloCronometroCanal){
        clearInterval(
            intervaloCronometroCanal
        );
        intervaloCronometroCanal = null;
    }

    // =================================
    // CANCELAR EVALUACION AUTOMATICA
    // =================================
    if(timerEvaluacionAutomatica){
        clearTimeout(
            timerEvaluacionAutomatica
        );
        timerEvaluacionAutomatica = null;
    }
    evaluacionAutomaticaActiva = false;
}

// ==========================================
// OBTENER TIEMPO CANAL
// ==========================================

function obtenerTiempoCanal(){
    return segundosCanal;

}

// ==========================================
// CREAR CLAVE UNICA
// ==========================================

function obtenerClaveEvaluacion(){
    if(
        !canalEvaluadoActual ||
        !fuenteEvaluadaActual
    ){
        return null;
    }
    return (
        canalEvaluadoActual +
        "_" +
        fuenteEvaluadaActual.tipo +
        "_" +
        btoa(fuenteEvaluadaActual.url) +
        "_" +
        (fuenteEvaluadaActual.reproductor || "exo")
    );
}

// ==========================================
// BACK / SALIDA DEL CANAL
// ==========================================

function manejarSalidaCanal(){

const clave = obtenerClaveEvaluacion();

if(
    clave &&
    !puedeEvaluarse(clave)
){
    console.log(
        "Fuente ya evaluada recientemente"
    );

    detenerCronometroCanal();
    cerrarTodo();
    return false;
}

    let segundos = obtenerTiempoCanal();


    console.log(
        "Salida canal:",
        canalEvaluadoActual,
        segundos
    );



    // Ventana salida temprana
    if(
        segundos >= 20 &&
        segundos <= 80
    ){

        detenerCronometroCanal();


        pausarCanal();


        mostrarEvaluacion();


        return true;

    }



    // salida normal

    detenerCronometroCanal();

    cerrarTodo();


    return false;

}



// ==========================================
// PAUSAR CANAL + NUBLAR IMAGEN
// ==========================================

function pausarCanal(){


    // HLS VIDEO
    const video =
        document.getElementById("video");


    if(video){

        video.pause();

        video.style.filter =
            "blur(4px) brightness(0.45)";

    }



    // Youtube
    const yt =
        document.getElementById("ytOverlay");


    if(yt){

        yt.style.filter =
            "blur(4px) brightness(0.45)";

    }



    // Web
    const web =
        document.getElementById("webOverlay");


    if(web){

        web.style.filter =
            "blur(4px) brightness(0.45)";

    }

}



// ==========================================
// RESTAURAR CANAL
// ==========================================

function restaurarCanal(){

    const video =
        document.getElementById("video");


    if(video){

        video.style.filter="";
    }


    const yt =
        document.getElementById("ytOverlay");


    if(yt){

        yt.style.filter="";
    }


    const web =
        document.getElementById("webOverlay");


    if(web){

        web.style.filter="";
    }

}



// ==========================================
// MOSTRAR EVALUACION
// ==========================================

function mostrarEvaluacion(){
    let modal = document.getElementById("modalEvaluacion");
    // Si no existe, crearlo
    if(!modal){
        modal = document.createElement("div");
        modal.id = "modalEvaluacion";
        modal.innerHTML = `
        <div class="evaluacionCaja">
            <div>
            ¿Qué te pareció este canal?
            </div>
            <div class="evaluacionBotones">
               <button onclick="responderEvaluacion(100)">
                   👍
               </button>

               <button onclick="responderEvaluacion(60)">
                   😐
               </button>

               <button onclick="responderEvaluacion(30)">
                   👎
               </button>

               <button onclick="responderEvaluacion(0)">
                   🚫
               </button>
               
               <button onclick="cancelarEvaluacion()">
                   🚪
               </button>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }


    // =================================
    // POSICION SEGUN TIPO DE EVALUACION
    // =================================

    if(evaluacionAutomaticaActiva){

        modal.classList.add(
            "evaluacionAutomatica"
        );

    }
    else{

        modal.classList.remove(
            "evaluacionAutomatica"
        );

    }



    // mostrar

    modal.style.display = "flex";



    // cancelar por tiempo máximo

    clearTimeout(timerEvaluacion);


    timerEvaluacion = setTimeout(()=>{

        cancelarEvaluacion();

    },40000);


}




function programarEvaluacionAutomatica(){
    if(timerEvaluacionAutomatica){
        clearTimeout(timerEvaluacionAutomatica);
    }
    // entre 30 y 60 minutos
    let segundosAleatorios =
        Math.floor(
            Math.random() *
            (
                60*60 -
                30*60
            )
        )
        +
        (30*60);
    console.log(
        "Evaluación automática programada en:",
        segundosAleatorios,
        "segundos"
    );
    timerEvaluacionAutomatica = setTimeout(()=>{
        if(
            segundosCanal >= 1800 &&
            segundosCanal <= 3600
        ){
            evaluacionAutomaticaActiva = true;
            pausarCanal();
            mostrarEvaluacionAutomatica();
        }
    }, segundosAleatorios * 1000);
}


function mostrarEvaluacionAutomatica(){
    let modal =
        document.getElementById(
            "modalEvaluacion"
        );
    if(!modal){
        mostrarEvaluacion();
        modal =
        document.getElementById(
            "modalEvaluacion"
        );
    }
    modal.classList.add(
        "evaluacionAutomatica"
    );
    modal.style.display="flex";
    timerEvaluacion =
    setTimeout(()=>{

        cancelarEvaluacion();
    },40000);
}

// ==========================================
// RESPUESTA USUARIO
// ==========================================

function responderEvaluacion(puntaje){
console.log("ANTES DE GUARDAR");
console.log(canalEvaluadoActual);
console.log(fuenteEvaluadaActual);

    clearTimeout(timerEvaluacion);
    guardarEvaluacion(
        obtenerClaveEvaluacion(),
        puntaje
    );
    cerrarEvaluacion();
    restaurarCanal();
    cerrarTodo();
    iniciarCronometroGeneral();
}

// ==========================================
// CANCELAR EVALUACION
// ==========================================

function cancelarEvaluacion(){


    clearTimeout(timerEvaluacion);


    cerrarEvaluacion();


    restaurarCanal();


    // evita nueva pregunta inmediata
    segundosCanal = 100;


    cerrarTodo();

}



// ==========================================
// CERRAR MODAL
// ==========================================
function cerrarEvaluacion(){
    const modal =
    document.getElementById("modalEvaluacion");
    if(modal){
        modal.style.display="none";
    }
}

// ==========================================
// GUARDAR RESULTADO
// ==========================================

function guardarEvaluacion(idFuente, puntaje){

console.log("canalEvaluadoActual =", canalEvaluadoActual);
console.log("fuenteEvaluadaActual =", fuenteEvaluadaActual);

    let ahora = new Date();

    let fecha =
        ahora.toLocaleString();

    let bloqueo =
        ahora.getTime() +
        (6 * 60 * 60 * 1000);


    let datos =
        JSON.parse(
            localStorage.getItem(
                "evaluacionesTVArg"
            )
        ) || {};


    // Primera evaluación de esta fuente
    if(!datos[idFuente]){

        datos[idFuente]={

            canal:
                canalEvaluadoActual,

            tipo:
                fuenteEvaluadaActual.tipo,

            reproductor:
                fuenteEvaluadaActual.reproductor || "exo",

            fuente:
                fuenteEvaluadaActual.url,

            evaluaciones:0,

            promedio:0,

            ultimaEvaluacion:null,

            bloqueoHasta:0
        };

    }


    let cantidad =
        datos[idFuente].evaluaciones;


    let promedioAnterior =
        datos[idFuente].promedio;


    let nuevoPromedio =
        Math.round(
            (
                (promedioAnterior * cantidad)
                +
                puntaje
            )
            /
            (cantidad + 1)
        );


    datos[idFuente].evaluaciones =
        cantidad + 1;


    datos[idFuente].promedio =
        nuevoPromedio;


    datos[idFuente].ultimaEvaluacion =
        fecha;


    datos[idFuente].bloqueoHasta =
        bloqueo;


    localStorage.setItem(
        "evaluacionesTVArg",
        JSON.stringify(datos)
    );


    console.log(
        "Evaluación guardada:",
        idFuente,
        datos[idFuente]
    );

}

// ==========================================
// CONTROL 48 HORAS
// ==========================================
function puedeEvaluarse(idFuente){
    let datos =
        JSON.parse(
            localStorage.getItem(
                "evaluacionesTVArg"
            )
        ) || {};

    if(!datos[idFuente]){
        return true;
    }
    let ahora = Date.now();
    if(
        datos[idFuente].bloqueoHasta &&
        ahora < datos[idFuente].bloqueoHasta
    ){
        console.log(
            "Evaluación bloqueada hasta:",
            new Date(
                datos[idFuente].bloqueoHasta
            )
        );
        return false;
    }
    return true;
}
// ==========================================
// DISPARO CRONOMETRO GENERAL
// ==========================================

function iniciarCronometroGeneral(){
    console.log(
        "Activando cronometro general"
    );
    // Si existe un sistema externo de cronómetro
    if(
        typeof window.iniciarCronometroTVArg === "function"
    ){
        window.iniciarCronometroTVArg();
        return;
    }
    // Mientras no exista, solo deja registro
    console.log(
        "Cronometro general no encontrado"
    );
}
