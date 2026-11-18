
import { MotorProbabilistico } from "./MotorProbabilistico.js";

/**
 * Clase: PruebasAlgoritmo
 * Función: comparar el rendimiento del motor probabilístico.
 * Entrada: resultados conocidos y cantidades de simulaciones.
 * Salida: tabla con tiempos, muestras y recomendaciones.
 */
export class PruebasAlgoritmo {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: motor y opciones de prueba inicializadas.
   */
  constructor(tamanoTablero = 10) {
    this.motor = new MotorProbabilistico(tamanoTablero);
    this.cantidades = [100, 1000, 5000, 10000];
    this.resultados = [];
  }

  /**
   * Función: ejecutarPrueba
   * Entrada: cantidad de simulaciones y disparos conocidos.
   * Salida: métricas reales de una ejecución.
   */
  ejecutarPrueba(cantidad, disparos = {}) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error("Cantidad de simulaciones inválida.");
    }

    // Ejecutamos el motor y registramos sus métricas.
    const analisis = this.motor.analizar(disparos, cantidad);

    const registro = {
      simulaciones: cantidad,
      generadas: analisis.simulacionesGeneradas,
      validas: analisis.configuracionesValidas,
      descartadas: analisis.configuracionesDescartadas,
      tiempoMs: analisis.tiempoMs,
      muestrasCompletas: analisis.objetivoMuestrasCumplido,
      objetivo: analisis.recomendacion?.coordenada ?? "N/A",
      probabilidad: analisis.recomendacion?.porcentaje ?? null
    };

    this.resultados.push(registro);

    return { ...registro };
  }

  /**
   * Función: ejecutarComparacion
   * Entrada: disparos conocidos y cantidades de simulaciones.
   * Salida: arreglo con los resultados de cada prueba.
   */
  ejecutarComparacion(
    disparos = {},
    cantidades = this.cantidades
  ) {
    const comparacion = [];

    for (const cantidad of cantidades) {
      const resultado = this.ejecutarPrueba(
        cantidad,
        disparos
      );

      comparacion.push(resultado);
    }

    return comparacion;
  }

  /**
   * Función: ejecutarRepeticiones
   * Entrada: cantidad, disparos y número de repeticiones.
   * Salida: tiempo promedio y métricas de las ejecuciones.
   */
  ejecutarRepeticiones(
    cantidad,
    disparos = {},
    repeticiones = 3
  ) {
    if (!Number.isInteger(repeticiones) || repeticiones <= 0) {
      throw new Error("Número de repeticiones inválido.");
    }

    const ejecuciones = [];

    for (let i = 0; i < repeticiones; i++) {
      ejecuciones.push(
        this.ejecutarPrueba(cantidad, disparos)
      );
    }

    const promedio = (campo) =>
      ejecuciones.reduce(
        (suma, prueba) => suma + prueba[campo],
        0
      ) / repeticiones;

    return {
      simulaciones: cantidad,
      repeticiones,
      tiempoPromedioMs: promedio("tiempoMs"),
      validasPromedio: promedio("validas"),
      generadasPromedio: promedio("generadas"),
      ejecuciones
    };
  }

  /**
   * Función: obtenerResultados
   * Entrada: ninguna.
   * Salida: copia de los resultados registrados.
   */
  obtenerResultados() {
    return this.resultados.map(registro => ({
      ...registro
    }));
  }

  /**
   * Función: mostrarResultados
   * Entrada: arreglo de resultados.
   * Salida: tabla impresa en consola.
   */
  mostrarResultados(resultados = this.resultados) {
    console.table(
      resultados.map(registro => ({
        Simulaciones: registro.simulaciones,
        Generadas: registro.generadas,
        Validas: registro.validas,
        Descartadas: registro.descartadas,
        "Tiempo (ms)": registro.tiempoMs,
        Objetivo: registro.objetivo,
        "Probabilidad (%)": registro.probabilidad,
        Completas: registro.muestrasCompletas
      }))
    );
  }

  /**
   * Función: reiniciar
   * Entrada: ninguna.
   * Salida: historial de experimentos vacío.
   */
  reiniciar() {
    this.resultados = [];
    return true;
  }
}
