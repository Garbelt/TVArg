// ==========================================
// TVARG
// CRONOMETRO GENERAL
// ==========================================

let cronometroGeneralActivo = false;
let segundosGeneral = 0;
let intervaloGeneral = null;


// ==========================================
// ACTIVAR DESDE EVALUADOR
// ==========================================

window.iniciarCronometroTVArg = function(){
    cronometroGeneralActivo = true;
    if(intervaloGeneral){
        clearInterval(intervaloGeneral);
    }
    segundosGeneral = 0;
    intervaloGeneral =
    setInterval(()=>{
        segundosGeneral++;
        console.log(
            "Cronometro general:",
            segundosGeneral
        );
    },1000);
    console.log(
        "Cronometro general iniciado"
    );
};

// ==========================================
// DETENER
// ==========================================

window.detenerCronometroTVArg = function(){
    cronometroGeneralActivo = false;
    if(intervaloGeneral){
        clearInterval(
            intervaloGeneral
        );
        intervaloGeneral = null;
    }
    console.log(
        "Cronometro general detenido"
    );
};

// ==========================================

window.estaActivoCronometroGeneral = function(){
    return cronometroGeneralActivo;

};