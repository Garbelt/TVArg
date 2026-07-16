const EvaluadorTVArg = (() => {

    const STORAGE_KEY = "TVArg_Evaluaciones";

    let evaluacionActual = null;
    let timerArranque = null;

    // Tiempo máximo para decidir "no inicia"
    const TIEMPO_MAX_ARRANQUE = 20;


    function iniciar(datos) {

        finalizarTimer();

        evaluacionActual = {

            id: Date.now(),

            canal: datos.nombre || "Desconocido",

            tipo: datos.tipo || "",

            url: datos.url || "",

            etapa: "Arranque",

            inicio: new Date().toISOString(),

            minutoInicio: obtenerTiempo(),

            arranco: false,

            tiempoArranqueSegundos: null,

            resultado: "PENDIENTE",

            finArranque: null,

            minutoFin: null
        };


        console.log(
            "Evaluación iniciada:",
            evaluacionActual
        );


        // Esperamos reproducción real
        timerArranque = setTimeout(() => {

            if (!evaluacionActual.arranco) {

                cerrarArranque(
                    false,
                    "NO INICIA"
                );

            }

        }, TIEMPO_MAX_ARRANQUE * 1000);

    }



    function confirmarArranque() {

        if (!evaluacionActual) return;

        if (evaluacionActual.arranco)
            return;


        const ahora = Date.now();

        const inicio =
            new Date(evaluacionActual.inicio)
            .getTime();


        const segundos =
            Math.floor(
                (ahora - inicio) / 1000
            );


        evaluacionActual.arranco = true;

        evaluacionActual.tiempoArranqueSegundos =
            segundos;


        cerrarArranque(
            true,
            "INICIA"
        );


    }



    function cerrarArranque(ok, resultado) {

        if (!evaluacionActual)
            return;


        finalizarTimer();


        evaluacionActual.resultado =
            resultado;


        evaluacionActual.finArranque =
            new Date().toISOString();


        evaluacionActual.minutoFin =
            obtenerTiempo();


        guardar();


        console.log(
            "Arranque finalizado:",
            evaluacionActual
        );


        evaluacionActual = null;

    }



    function guardar() {

        let datos =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];


        datos.push(evaluacionActual);


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(datos)
        );

    }



    function obtenerTiempo(){

        const fecha = new Date();

        return fecha.toLocaleTimeString(
            "es-AR",
            {
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit"
            }
        );

    }



    function finalizarTimer(){

        if(timerArranque){

            clearTimeout(timerArranque);

            timerArranque=null;
        }
    }



    return {

        iniciar,

        ok: confirmarArranque

    };


})();