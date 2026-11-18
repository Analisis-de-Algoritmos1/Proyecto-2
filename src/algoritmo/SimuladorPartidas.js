
import { GeneradorSimulaciones } from "./GeneradorSimulaciones.js";
import { IntegracionAgenteMetricas } from "./IntegracionAgenteMetricas.js";

/**
 * Clase: SimuladorPartidas
 * Función: simular partidas completas de Batalla Naval.
 * Entrada: cantidad de simulaciones y límite de disparos.
 * Salida: resultados y estadísticas de cada partida.
 */
export class SimuladorPartidas {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: simulador inicializado.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
    this.generador = new GeneradorSimulaciones(tamanoTablero);
    this.historialPartidas = [];
  }

  /**
   * Función: ejecutarPartida
   * Entrada: simulaciones y máximo de disparos.
   * Salida: estadísticas y estado final de la partida.
   */
  ejecutarPartida(simulaciones = 100, maxDisparos = 100) {

    if (!Number.isInteger(maxDisparos) || maxDisparos <= 0 ||
        maxDisparos > this.tamanoTablero ** 2) {
      throw new Error("Límite de disparos inválido.");
    }

    // Generamos la flota que el agente debe encontrar.
    const flota = this.generador.generarFlota();

    if (flota === null) {
      throw new Error("No se pudo generar la flota.");
    }

    const sistema = new IntegracionAgenteMetricas(
      this.tamanoTablero,
      simulaciones
    );

    // Mapa privado para comprobar cada disparo.
    const posiciones = new Map();
    const impactos = new Set();
    const disparadas = new Set();

    let barcosHundidos = 0;
    let estado = "limite_disparos";

    for (const barco of flota) {
      for (const celda of barco.celdas) {
        posiciones.set(
          `${celda.fila},${celda.columna}`,
          barco
        );
      }
    }

    /**
     * Función: resolverDisparo
     * Entrada: fila y columna seleccionadas.
     * Salida: agua, impacto o barco hundido.
     */
    const resolverDisparo = (fila, columna) => {

      const clave = `${fila},${columna}`;

      if (disparadas.has(clave)) {
        throw new Error("Disparo repetido.");
      }

      disparadas.add(clave);

      const barco = posiciones.get(clave);

      if (!barco) {
        return { tipo: "agua" };
      }

      impactos.add(clave);

      // Comprobamos si todas las partes fueron atacadas.
      const hundido = barco.celdas.every(celda =>
        impactos.has(`${celda.fila},${celda.columna}`)
      );

      if (hundido) {
        barcosHundidos++;

        return {
          tipo: "hundido",
          nombre: barco.nombre,
          celdas: barco.celdas.map(c => ({ ...c }))
        };
      }

      return { tipo: "impacto" };
    };

    const inicio = performance.now();

    // Ejecutamos los turnos hasta finalizar.
    for (let turno = 0; turno < maxDisparos; turno++) {

      const resultado = sistema.ejecutarTurnoAgente(
        resolverDisparo
      );

      if (resultado === null) {
        estado = "sin_recomendacion";
        break;
      }

      if (barcosHundidos === flota.length) {
        estado = "victoria";
        break;
      }
    }

    const tiempoTotalMs = performance.now() - inicio;

    const datos = sistema.obtenerEstado();
    const estadisticas = datos.estadisticas.agente;
    const analisis = datos.estadisticas.algoritmo;

    const resumen = {
      numeroPartida: this.historialPartidas.length + 1,
      simulaciones,
      estado,
      victoria: estado === "victoria",
      disparos: estadisticas.disparos,
      impactos: estadisticas.impactos,
      fallidos: estadisticas.fallidos,
      barcosHundidos,
      barcosRestantes: flota.length - barcosHundidos,
      tiempoTotalMs: Number(tiempoTotalMs.toFixed(2)),
      tiempoAnalisisMs: Number(
        analisis.tiempoTotalMs.toFixed(2)
      ),
      cantidadAnalisis: analisis.cantidadAnalisis
    };

    this.historialPartidas.push(resumen);

    return { ...resumen };
  }

  /**
   * Función: ejecutarExperimentos
   * Entrada: cantidades y repeticiones por cantidad.
   * Salida: resultados de las partidas simuladas.
   */
  ejecutarExperimentos(
    cantidades = [100, 1000, 5000, 10000],
    repeticiones = 1
  ) {

    if (!Number.isInteger(repeticiones) || repeticiones <= 0) {
      throw new Error("Repeticiones inválidas.");
    }

    const resultados = [];

    for (const cantidad of cantidades) {
      for (let i = 0; i < repeticiones; i++) {
        resultados.push(
          this.ejecutarPartida(cantidad)
        );
      }
    }

    return resultados;
  }

  /**
   * Función: obtenerResumen
   * Entrada: lista de resultados de partidas.
   * Salida: promedio de disparos y porcentaje de victorias.
   */
  obtenerResumen(resultados = this.historialPartidas) {

    if (resultados.length === 0) {
      return {
        partidas: 0,
        victorias: 0,
        porcentajeVictorias: 0,
        promedioDisparos: 0,
        promedioTiempoMs: 0
      };
    }

    const victorias = resultados.filter(
      partida => partida.victoria
    );

    const promedio = (lista, campo) =>
      lista.reduce(
        (suma, partida) => suma + partida[campo],
        0
      ) / lista.length;

    return {
      partidas: resultados.length,
      victorias: victorias.length,
      porcentajeVictorias:
        (victorias.length / resultados.length) * 100,
      promedioDisparos: victorias.length > 0
        ? promedio(victorias, "disparos")
        : null,
      promedioTiempoMs: promedio(
        resultados,
        "tiempoTotalMs"
      )
    };
  }

  /**
   * Función: obtenerHistorial
   * Entrada: ninguna.
   * Salida: lista de partidas ejecutadas.
   */
  obtenerHistorial() {
    return this.historialPartidas.map(p => ({ ...p }));
  }

  /**
   * Función: reiniciar
   * Entrada: ninguna.
   * Salida: historial vacío.
   */
  reiniciar() {
    this.historialPartidas = [];
    return true;
  }
}
