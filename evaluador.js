/*
==================================================
 TVArg - evaluador.js
 Evalúa HLS y guarda historial + resumen
==================================================
*/

const EvaluadorTVArg = {

    sesion:null,
    temporizador:null,


    iniciar(fuenteId, canal, tipo){

        this.cancelar();

        this.sesion={

            fuenteId,
            canal,
            tipo,

            fecha:new Date().toISOString(),

            inicio:performance.now(),

            tiempoInicio:null,

            tiempoEstable:null,

            completo:false
        };


        console.log(
            "[EVALUADOR] Inicio:",
            canal,
            fuenteId
        );

    },


    inicioCorrecto(){

        if(!this.sesion)
            return;


        if(this.sesion.tiempoInicio!==null)
            return;


        this.sesion.tiempoInicio =
            Math.round(
                performance.now() -
                this.sesion.inicio
            );


        console.log(
            "[EVALUADOR] Imagen:",
            this.sesion.tiempoInicio+" ms"
        );


        this.temporizador=setTimeout(()=>{

            if(!this.sesion)
                return;


            this.sesion.completo=true;

            this.sesion.tiempoEstable=60000;


            this.guardar();


        },60000);

    },


    cancelar(){

        if(!this.sesion)
            return;


        clearTimeout(this.temporizador);


        if(
            this.sesion.tiempoInicio!==null &&
            !this.sesion.completo
        ){

            this.sesion.tiempoEstable =
                Math.round(
                    performance.now() -
                    this.sesion.inicio -
                    this.sesion.tiempoInicio
                );


            this.guardar();

        }


        console.log(
            "[EVALUADOR] Cancelado:",
            this.sesion.canal
        );


        this.sesion=null;

    },



    guardar(){

        if(!this.sesion)
            return;


        const datos =
            JSON.parse(
                localStorage.getItem(
                    "tvarg_evaluaciones"
                ) || "[]"
            );


        datos.push({

            fuenteId:this.sesion.fuenteId,

            canal:this.sesion.canal,

            tipo:this.sesion.tipo,

            fecha:this.sesion.fecha,

            tiempoInicio:this.sesion.tiempoInicio,

            tiempoEstable:this.sesion.tiempoEstable,

            completo:this.sesion.completo

        });


        localStorage.setItem(
            "tvarg_evaluaciones",
            JSON.stringify(datos)
        );


        this.actualizarResumen(datos);


        console.log(
            "[EVALUADOR] Guardado"
        );

    },


    actualizarResumen(datos){

        const resumen={};


        datos.forEach(d=>{

            if(!resumen[d.fuenteId]){

                resumen[d.fuenteId]={

                    canal:d.canal,

                    tipo:d.tipo,

                    pruebas:0,

                    exitos:0,

                    sumaInicio:0

                };

            }


            let r=resumen[d.fuenteId];


            r.pruebas++;


            if(d.completo)
                r.exitos++;


            r.sumaInicio +=
                Number(d.tiempoInicio)||0;

        });



        Object.values(resumen).forEach(r=>{


            let rendimiento =
                r.exitos / r.pruebas;


            let estrellas =
                Math.round(
                    rendimiento * 5
                );


            r.estrellas=estrellas;


            r.inicioPromedio =
                Math.round(
                    r.sumaInicio /
                    r.pruebas
                );

        });



        localStorage.setItem(
            "tvarg_resumen_fuentes",
            JSON.stringify(resumen)
        );

    },



    obtener(){

        return JSON.parse(
            localStorage.getItem(
                "tvarg_evaluaciones"
            ) || "[]"
        );

    },


    obtenerResumen(){

        return JSON.parse(
            localStorage.getItem(
                "tvarg_resumen_fuentes"
            ) || "{}"
        );

    },


    borrar(){

        localStorage.removeItem(
            "tvarg_evaluaciones"
        );


        localStorage.removeItem(
            "tvarg_resumen_fuentes"
        );


        console.log(
            "[EVALUADOR] Historial eliminado"
        );

    }

};
