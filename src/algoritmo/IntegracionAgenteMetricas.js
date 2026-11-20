
import { AgenteAutomatico } from "./AgenteAutomatico.js";
import { MetricasAlgoritmo } from "./MetricasAlgoritmo.js";

/**
 * Clase: IntegracionAgenteMetricas
 * Función: conectar el agente con las estadísticas.
 * Entrada: tamaño del tablero y simulaciones.
 * Salida: turnos, análisis y métricas actualizadas.
 */
export class IntegracionAgenteMetricas {

  /**
   * Función: constructor
   * Entrada: tamaño y cantidad de simulaciones.
   * Salida: agente y métricas inicializados.
   */
  constructor(tamanoTablero = 10, simulaciones = 1000) {
    this.agente = new AgenteAutomatico(
      tamanoTablero,
      simulaciones
    );

    this.metricas = new MetricasAlgoritmo(5);
  }

  /**
   * Función: ejecutarTurnoAgente
   * Entrada: función externa que resuelve el disparo.
   * Salida: registro del turno y estadísticas.
   */
  ejecutarTurnoAgente(resolverDisparo) {
    if (typeof resolverDisparo !== "function") {
      throw new Error("Debe proporcionar resolverDisparo.");
    }

    // El agente selecciona un objetivo.
    const objetivo = this.agente.seleccionarDisparo();

    if (objetivo === null) {
      return null;
    }

    // Conservamos las métricas del análisis realizado.
    const analisis = this.agente.ultimoAnalisis;

    // El juego determina el resultado real.
    const resultado = resolverDisparo(
      objetivo.fila,
      objetivo.columna
    );

    // El agente incorpora el resultado recibido.
    const disparo = this.agente.registrarResultado(
      resultado
    );

    // Registramos los datos del motor.
    if (analisis !== null) {
      this.metricas.registrarAnalisis(analisis);
    }

    // Actualizamos los contadores.
    this.metricas.registrarDisparo(
      "agente",
      disparo.tipo
    );

    // Guardamos la decisión realizada.
    this.metricas.registrarDecision("agente", {
      coordenada: disparo.coordenada,
      resultado: disparo.tipo,
      siguioRecomendacion: true,
      probabilidad: disparo.probabilidad
    });

    return {
      disparo,
      estadisticas: this.metricas.obtenerEstadisticas()
    };
  }

  /**
   * Función: registrarTurnoJugador
   * Entrada: coordenada, resultado y recomendación.
   * Salida: estadísticas del jugador actualizadas.
   */
  registrarTurnoJugador(
    coordenada,
    resultado,
    recomendacion = null
  ) {
    if (!["agua", "impacto", "hundido"].includes(resultado)) {
      throw new Error("Resultado no válido.");
    }

    // Registramos el disparo humano.
    this.metricas.registrarDisparo(
      "jugador",
      resultado
    );

    this.metricas.registrarDecision("jugador", {
      coordenada,
      resultado,
      siguioRecomendacion:
        recomendacion === null
          ? null
          : coordenada === recomendacion.coordenada,
      probabilidad:
        recomendacion?.probabilidad ?? null
    });

    return this.metricas.obtenerEstadisticas();
  }

  /**
   * Función: obtenerEstado
   * Entrada: ninguna.
   * Salida: conocimiento, historial y estadísticas.
   */
  obtenerEstado() {
    return {
      conocimiento: this.agente.obtenerConocimiento(),
      historialAgente: this.agente.obtenerHistorial(),
      decisiones:
        this.metricas.obtenerHistorialDecisiones(),
      analisis:
        this.metricas.obtenerHistorialAnalisis(),
      estadisticas:
        this.metricas.obtenerEstadisticas()
    };
  }

  /**
   * Función: cambiarSimulaciones
   * Entrada: nueva cantidad de simulaciones.
   * Salida: cantidad configurada.
   */
  cambiarSimulaciones(cantidad) {
    return this.agente.cambiarSimulaciones(cantidad);
  }

  /**
   * Función: reiniciar
   * Entrada: ninguna.
   * Salida: true al reiniciar el sistema.
   */
  reiniciar() {
    this.agente.reiniciar();
    this.metricas.reiniciar();

    return true;
  }
}
