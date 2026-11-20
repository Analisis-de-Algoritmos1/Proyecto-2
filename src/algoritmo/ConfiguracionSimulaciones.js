
/**
 * Clase: ConfiguracionSimulaciones
 *
 * Descripción:
 * Administra la cantidad de simulaciones utilizadas por el motor probabilístico.
 *
 * Permite seleccionar diferentes cantidades
 * para comparar la precisión aproximada y
 * el tiempo de ejecución del algoritmo.
 *
 * Entrada:
 * - Cantidad de simulaciones seleccionada.
 *
 * Salida:
 * - Cantidad configurada actualmente.
 * - Lista de cantidades disponibles.
 * - Mensajes de error para valores inválidos.
 */
export class ConfiguracionSimulaciones {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa la configuración del algoritmo.
   *
   * Entrada:
   * - cantidadInicial: número de simulaciones.
   *   Por defecto se utilizan 1000.
   *
   * Salida:
   * - Instancia con la configuración inicial.
   */
  constructor(cantidadInicial = 1000) {

    this.opcionesDisponibles = [
      100,
      1000,
      5000,
      10000
    ];

    // Validamos la configuración inicial.
    this.validarCantidad(cantidadInicial);

    this.cantidadSimulaciones = cantidadInicial;
  }

  /**
   * Función: validarCantidad
   *
   * Descripción:
   * Verifica que el número recibido sea
   * una de las cantidades permitidas.
   *
   * Entrada:
   * - cantidad: número de simulaciones.
   *
   * Salida:
   * - true si la cantidad es válida.
   * - Error si la cantidad no está permitida.
   */
  validarCantidad(cantidad) {

    if (
      !Number.isInteger(cantidad) ||
      !this.opcionesDisponibles.includes(cantidad)
    ) {
      throw new Error(
        "Cantidad no válida. Utilice 100, 1000, 5000 o 10000 simulaciones."
      );
    }

    return true;
  }

  /**
   * Función: establecerCantidad
   *
   * Descripción:
   * Cambia la cantidad de simulaciones
   * que utilizará el algoritmo.
   *
   * Entrada:
   * - nuevaCantidad: cantidad seleccionada.
   *
   * Salida:
   * - Nueva cantidad configurada.
   */
  establecerCantidad(nuevaCantidad) {

    this.validarCantidad(nuevaCantidad);

    this.cantidadSimulaciones = nuevaCantidad;

    return this.cantidadSimulaciones;
  }

  /**
   * Función: obtenerCantidad
   *
   * Descripción:
   * Consulta la cantidad actualmente configurada.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Número de simulaciones configuradas.
   */
  obtenerCantidad() {
    return this.cantidadSimulaciones;
  }

  /**
   * Función: obtenerOpciones
   *
   * Descripción:
   * Devuelve las cantidades disponibles
   * para mostrarlas en la interfaz.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Arreglo con las cantidades permitidas.
   */
  obtenerOpciones() {
    return [...this.opcionesDisponibles];
  }

  /**
   * Función: restablecer
   *
   * Descripción:
   * Restablece la configuración al valor
   * predeterminado de 1000 simulaciones.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Cantidad predeterminada.
   */
  restablecer() {

    this.cantidadSimulaciones = 1000;

    return this.cantidadSimulaciones;
  }
}
