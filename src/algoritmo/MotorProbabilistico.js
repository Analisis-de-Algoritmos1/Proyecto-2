
import { GeneradorSimulaciones } from "./GeneradorSimulaciones.js";
import { FiltradoResultados } from "./FiltradoResultados.js";
import { CalculoProbabilidades } from "./CalculoProbabilidades.js";
import { SeleccionObjetivo } from "./SeleccionObjetivo.js";

/**
 * Clase: MotorProbabilistico
 * Función: coordinar el análisis probabilístico.
 * Entrada: disparos conocidos y cantidad de simulaciones.
 * Salida: probabilidades, recomendación y métricas.
 */
export class MotorProbabilistico {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: componentes del motor inicializados.
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
   * Entrada: cantidad de simulaciones.
   * Salida: true o error si la cantidad es inválida.
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
   * Entrada: resultados conocidos y cantidad de simulaciones.
   * Salida: mapa probabilístico, objetivo y estadísticas.
   */
  analizar(resultados = {}, cantidadSimulaciones = 1000) {

    this.validarCantidad(cantidadSimulaciones);

    // Registramos el inicio del análisis.
    const inicio = performance.now();

    // Generamos flotas compatibles con los disparos.
    const simulaciones = this.generador.generarSimulaciones(
      cantidadSimulaciones,
      resultados
    );

    const simulacionesGeneradas = simulaciones.length;

    // Filtramos nuevamente las configuraciones.
    const configuracionesValidas =
      this.filtro.filtrarSimulaciones(
        simulaciones,
        resultados
      );

    const totalValidas = configuracionesValidas.length;

    const configuracionesDescartadas =
      simulacionesGeneradas - totalValidas;

    // Calculamos las probabilidades por celda.
    const analisis = this.calculadora.calcular(
      configuracionesValidas,
      resultados
    );

    // Seleccionamos la mejor posición disponible.
    const recomendacion = this.selector.seleccionar(
      analisis.probabilidades,
      resultados,
      analisis.hayEstimacion
    );

    // Convertimos las probabilidades en porcentajes.
    const porcentajes =
      this.calculadora.convertirPorcentajes(
        analisis.probabilidades
      );

    // Medimos el tiempo total del proceso.
    const tiempoMs = performance.now() - inicio;

    const objetivoMuestrasCumplido =
      totalValidas === cantidadSimulaciones;

    return {
      probabilidades: analisis.probabilidades,
      porcentajes,
      frecuencias: analisis.frecuencias,
      recomendacion,
      simulacionesSolicitadas: cantidadSimulaciones,
      simulacionesGeneradas,
      simulacionesRealizadas: simulacionesGeneradas,
      configuracionesValidas: totalValidas,
      configuracionesDescartadas,
      tiempoMs: Math.round(tiempoMs * 100) / 100,
      hayEstimacion: analisis.hayEstimacion,
      objetivoMuestrasCumplido
    };
  }
}
