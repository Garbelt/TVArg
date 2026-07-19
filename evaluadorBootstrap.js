function iniciarEvaluacionCanal(item, fuente) {
    if (typeof window.iniciarEvaluacionCanalReal === "function") {
        return window.iniciarEvaluacionCanalReal(item, fuente);
    }

    console.warn("Evaluador aún no disponible");
}