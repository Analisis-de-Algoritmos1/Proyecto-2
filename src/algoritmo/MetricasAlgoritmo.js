
/**
 * Clase: MetricasAlgoritmo
 * Función: registrar estadísticas y decisiones de la partida.
 * Entrada: disparos y resultados del algoritmo.
 * Salida: estadísticas e historiales.
 */
export class MetricasAlgoritmo {

  /**
   * Función: constructor
   * Entrada: cantidad total de barcos.
   * Salida: métricas inicializadas.
   */
  constructor(totalBarcos = 5) {
    if (!Number.isInteger(totalBarcos) || totalBarcos <= 0) {
      throw new Error("La cantidad de barcos debe ser positiva.");
    }

    this.totalBarcos = totalBarcos;
    this.reiniciar();
  }

  /**
   * Función: crearEstadisticasJugador
   * Entrada: ninguna.
   * Salida: contadores inicializados en cero.
   */
  crearEstadisticasJugador() {
    return {
      disparos: 0,
      impactos: 0,
      fallidos: 0,
      barcosHundidos: 0,
      barcosRestantes: this.totalBarcos
    };
  }

  /**
   * Función: registrarDisparo
   * Entrada: participante y resultado del disparo.
   * Salida: estadísticas actualizadas.
   */
  registrarDisparo(participante, resultado) {
    if (!["jugador", "agente"].includes(participante)) {
      throw new Error("Participante no válido.");
    }

    if (!["agua", "impacto", "hundido"].includes(resultado)) {
      throw new Error("Resultado no válido.");
    }

    const estadisticas = this.estadisticas[participante];

    if (
      resultado === "hundido" &&
      estadisticas.barcosRestantes === 0
    ) {
      throw new Error("No quedan barcos por hundir.");
    }

    estadisticas.disparos++;

    if (resultado === "agua") {
      estadisticas.fallidos++;
    } else {
      estadisticas.impactos++;
    }

    if (resultado === "hundido") {
      estadisticas.barcosHundidos++;
      estadisticas.barcosRestantes--;
    }

    return { ...estadisticas };
  }

  /**
   * Función: registrarAnalisis
   * Entrada: resultado del motor probabilístico.
   * Salida: registro del análisis realizado.
   */
  registrarAnalisis(analisis) {
    if (
      !analisis ||
      !Number.isFinite(analisis.tiempoMs) ||
      analisis.tiempoMs < 0
    ) {
      throw new Error("Análisis probabilístico no válido.");
    }

    const registro = {
      numeroAnalisis: this.analisis.length + 1,
      simulacionesSolicitadas:
        analisis.simulacionesSolicitadas,
      simulacionesRealizadas:
        analisis.simulacionesRealizadas,
      configuracionesValidas:
        analisis.configuracionesValidas,
      configuracionesDescartadas:
        analisis.configuracionesDescartadas,
      tiempoMs: analisis.tiempoMs,
      probabilidadRecomendada:
        analisis.recomendacion?.probabilidad ?? null,
      coordenadaRecomendada:
        analisis.recomendacion?.coordenada ?? null,
      hayEstimacion: analisis.hayEstimacion
    };

    this.analisis.push(registro);

    return { ...registro };
  }

  /**
   * Función: registrarDecision
   * Entrada: participante y datos de su decisión.
   * Salida: decisión registrada.
   */
  registrarDecision(participante, decision) {
    if (!["jugador", "agente"].includes(participante)) {
      throw new Error("Participante no válido.");
    }

    if (!decision || typeof decision !== "object") {
      throw new Error("Decisión no válida.");
    }

    const registro = {
      numero: this.decisiones.length + 1,
      participante,
      coordenada: decision.coordenada ?? null,
      resultado: decision.resultado ?? null,
      siguioRecomendacion:
        decision.siguioRecomendacion ?? null,
      probabilidad: decision.probabilidad ?? null
    };

    this.decisiones.push(registro);

    return { ...registro };
  }

  /**
   * Función: obtenerResumenAnalisis
   * Entrada: ninguna.
   * Salida: cantidad de análisis y tiempos registrados.
   */
  obtenerResumenAnalisis() {
    const cantidad = this.analisis.length;

    const tiempoTotalMs = this.analisis.reduce(
      (suma, actual) => suma + actual.tiempoMs,
      0
    );

    const tiempoPromedioMs =
      cantidad > 0 ? tiempoTotalMs / cantidad : 0;

    return {
      cantidadAnalisis: cantidad,
      tiempoTotalMs,
      tiempoPromedioMs,
      ultimoAnalisis:
        cantidad > 0
          ? { ...this.analisis[cantidad - 1] }
          : null
    };
  }

  /**
   * Función: obtenerEstadisticas
   * Entrada: ninguna.
   * Salida: estadísticas del jugador, agente y algoritmo.
   */
  obtenerEstadisticas() {
    return {
      jugador: { ...this.estadisticas.jugador },
      agente: { ...this.estadisticas.agente },
      algoritmo: this.obtenerResumenAnalisis()
    };
  }

  /**
   * Función: obtenerHistorialDecisiones
   * Entrada: ninguna.
   * Salida: lista de decisiones registradas.
   */
  obtenerHistorialDecisiones() {
    return this.decisiones.map(decision => ({
      ...decision
    }));
  }

  /**
   * Función: obtenerHistorialAnalisis
   * Entrada: ninguna.
   * Salida: lista de análisis realizados.
   */
  obtenerHistorialAnalisis() {
    return this.analisis.map(registro => ({
      ...registro
    }));
  }

  /**
   * Función: reiniciar
   * Entrada: ninguna.
   * Salida: true cuando se reinician las métricas.
   */
  reiniciar() {
    this.estadisticas = {
      jugador: this.crearEstadisticasJugador(),
      agente: this.crearEstadisticasJugador()
    };

    this.analisis = [];
    this.decisiones = [];

    return true;
  }
}
