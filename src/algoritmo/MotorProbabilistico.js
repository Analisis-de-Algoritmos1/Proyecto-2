
import { GeneradorSimulaciones } from "./GeneradorSimulaciones.js";
import { FiltradoResultados } from "./FiltradoResultados.js";
import { CalculoProbabilidades } from "./CalculoProbabilidades.js";
import { SeleccionObjetivo } from "./SeleccionObjetivo.js";

/**
 * Clase: MotorProbabilistico
 *
 * Descripción:
 * Coordina el algoritmo probabilístico
 * para recomendar disparos en Batalla Naval.
 *
 * Utiliza las configuraciones posibles de
 * la flota sin consultar los barcos reales.
 *
 * Entrada:
 * - Tamaño del tablero.
 * - Resultados de los disparos anteriores.
 * - Cantidad de simulaciones solicitadas.
 *
 * Salida:
 * - Matriz de probabilidades.
 * - Recomendación de disparo.
 * - Cantidad de configuraciones válidas.
 * - Cantidad de simulaciones realizadas.
 * - Tiempo empleado en el análisis.
 */
export class MotorProbabilistico {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa los componentes necesarios
   * para ejecutar el algoritmo.
   *
   * Entrada:
   * - tamanoTablero: tamaño del tablero.
   *
   * Salida:
   * - Instancia del motor configurada.
   */
  constructor(tamanoTablero = 10) {

    this.tamanoTablero = tamanoTablero;

    this.generador = new GeneradorSimulaciones(
      tamanoTablero
    );

    this.filtro = new FiltradoResultados();

    this.calculadora = new CalculoProbabilidades(
      tamanoTablero
    );

    this.selector = new SeleccionObjetivo(
      tamanoTablero
    );
  }

  /**
   * Función: validarCantidad
   *
   * Descripción:
   * Comprueba que la cantidad solicitada
   * de simulaciones sea válida.
   *
   * Entrada:
   * - cantidad: número de simulaciones.
   *
   * Salida:
   * - true cuando la cantidad es correcta.
   * - Error cuando la cantidad es inválida.
   */
  validarCantidad(cantidad) {

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      throw new Error(
        "La cantidad de simulaciones debe ser un entero positivo."
      );
    }

    return true;
  }

  /**
   * Función: analizar
   *
   * Descripción:
   * Ejecuta el análisis probabilístico completo.
   *
   * Primero genera flotas respetando los
   * disparos conocidos. Después valida las
   * configuraciones, calcula probabilidades
   * y selecciona el siguiente objetivo.
   *
   * Entrada:
   * - resultados: objeto con:
   *   agua, impactos y hundidos.
   * - cantidadSimulaciones: número de flotas
   *   que se intentarán generar.
   *
   * Salida:
   * - Objeto con probabilidades, recomendación,
   *   simulaciones, configuraciones válidas,
   *   tiempo de ejecución y estado del análisis.
   */
  analizar(resultados = {}, cantidadSimulaciones = 1000) {

    // Verificamos la cantidad solicitada.
    this.validarCantidad(cantidadSimulaciones);

    // Registramos el inicio del análisis.
    const inicio = performance.now();

    // Generamos posibles flotas utilizando
    // la información de los disparos anteriores.
    const simulaciones = this.generador.generarSimulaciones(
      cantidadSimulaciones,
      resultados
    );

    // Registramos las flotas obtenidas.
    const simulacionesGeneradas = simulaciones.length;

    // Comprobamos nuevamente la compatibilidad.
    const configuracionesValidas =
      this.filtro.filtrarSimulaciones(
        simulaciones,
        resultados
      );

    // Contamos las configuraciones aceptadas.
    const totalValidas = configuracionesValidas.length;

    // Calculamos cuántas flotas fueron descartadas.
    const configuracionesDescartadas =
      simulacionesGeneradas - totalValidas;

    // Calculamos la probabilidad de cada celda.
    const analisis = this.calculadora.calcular(
      configuracionesValidas,
      resultados
    );

    // Seleccionamos la mejor celda disponible.
    const recomendacion = this.selector.seleccionar(
      analisis.probabilidades,
      resultados,
      analisis.hayEstimacion
    );

    // Transformamos el mapa a porcentajes.
    const porcentajes =
      this.calculadora.convertirPorcentajes(
        analisis.probabilidades
      );

    // Registramos el tiempo total.
    const tiempoMs = performance.now() - inicio;

    // Verificamos si se consiguió la cantidad
    // de configuraciones solicitadas.
    const objetivoMuestrasCumplido =
      totalValidas === cantidadSimulaciones;

    // Informamos el resultado del análisis.
    return {
      probabilidades: analisis.probabilidades,

      porcentajes,

      frecuencias: analisis.frecuencias,

      recomendacion,

      simulacionesSolicitadas: cantidadSimulaciones,

      // Número de flotas generadas correctamente.
      simulacionesGeneradas,

      // Cantidad que pasó el filtrado final.
      simulacionesRealizadas: simulacionesGeneradas,

      configuracionesValidas: totalValidas,

      configuracionesDescartadas,

      tiempoMs: Math.round(tiempoMs * 100) / 100,

      hayEstimacion: analisis.hayEstimacion,

      objetivoMuestrasCumplido
    };
  }
}
