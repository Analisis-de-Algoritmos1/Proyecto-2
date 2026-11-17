
/**
 * Clase: FiltradoResultados
 *
 * Descripción:
 * Analiza las simulaciones generadas y descarta
 * aquellas que no coincidan con los resultados
 * conocidos de los disparos realizados.
 *
 * Entrada:
 * - Lista de configuraciones de flotas.
 * - Celdas donde se obtuvo agua.
 * - Celdas donde se obtuvo impacto.
 * - Información de barcos hundidos conocidos.
 *
 * Salida:
 * - Arreglo de configuraciones compatibles.
 *
 * Importante:
 * Esta clase no consulta la ubicación real de
 * los barcos enemigos. Solo utiliza información
 * obtenida mediante disparos anteriores.
 */
export class FiltradoResultados {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa la clase encargada de filtrar
   * las configuraciones de la flota.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Una instancia de FiltradoResultados.
   */
  constructor() {
    // No necesita atributos iniciales.
  }

  /**
   * Función: crearClave
   *
   * Descripción:
   * Convierte una celda en una cadena de texto
   * para facilitar su comparación.
   *
   * Entrada:
   * - celda: objeto con fila y columna.
   *
   * Salida:
   * - Cadena con formato "fila,columna".
   */
  crearClave(celda) {
    return `${celda.fila},${celda.columna}`;
  }

  /**
   * Función: obtenerCeldasOcupadas
   *
   * Descripción:
   * Obtiene todas las posiciones ocupadas
   * por los barcos de una configuración.
   *
   * Entrada:
   * - configuracion: arreglo con los barcos
   *   y sus respectivas celdas.
   *
   * Salida:
   * - Set con las posiciones ocupadas.
   */
  obtenerCeldasOcupadas(configuracion) {

    const ocupadas = new Set();

    // Recorremos cada barco de la configuración.
    for (const barco of configuracion) {

      // Registramos todas las celdas del barco.
      for (const celda of barco.celdas) {
        ocupadas.add(this.crearClave(celda));
      }
    }

    return ocupadas;
  }

  /**
   * Función: validarAgua
   *
   * Descripción:
   * Comprueba que ninguna celda identificada
   * como agua esté ocupada por un barco.
   *
   * Entrada:
   * - ocupadas: Set de celdas con barcos.
   * - agua: arreglo de disparos fallidos.
   *
   * Salida:
   * - true si no existen contradicciones.
   * - false si hay un barco sobre agua conocida.
   */
  validarAgua(ocupadas, agua) {

    for (const celda of agua) {

      const clave = this.crearClave(celda);

      // No puede existir un barco donde hubo agua.
      if (ocupadas.has(clave)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Función: validarImpactos
   *
   * Descripción:
   * Comprueba que todas las celdas conocidas
   * como impactos contengan un barco.
   *
   * Entrada:
   * - ocupadas: Set de celdas con barcos.
   * - impactos: arreglo de impactos conocidos.
   *
   * Salida:
   * - true si todos los impactos coinciden.
   * - false si algún impacto no contiene barco.
   */
  validarImpactos(ocupadas, impactos) {

    for (const celda of impactos) {

      const clave = this.crearClave(celda);

      // Un impacto siempre debe contener barco.
      if (!ocupadas.has(clave)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Función: validarHundidos
   *
   * Descripción:
   * Comprueba que los barcos hundidos conocidos
   * coincidan exactamente con una embarcación
   * de la configuración simulada.
   *
   * Entrada:
   * - configuracion: posible flota.
   * - hundidos: arreglo de objetos con:
   *   { nombre, celdas }.
   *
   * Salida:
   * - true si los barcos hundidos coinciden.
   * - false si existe alguna contradicción.
   *
   * Nota:
   * Solo se debe incluir un barco hundido cuando
   * se conocen todas sus celdas y su identidad.
   */
  validarHundidos(configuracion, hundidos) {

    for (const hundido of hundidos) {

      // Buscamos el barco por su nombre.
      const barco = configuracion.find(
        actual => actual.nombre === hundido.nombre
      );

      if (!barco) {
        return false;
      }

      // Las longitudes deben coincidir.
      if (barco.celdas.length !== hundido.celdas.length) {
        return false;
      }

      // Convertimos las celdas conocidas en un Set.
      const celdasHundidas = new Set(
        hundido.celdas.map(celda => this.crearClave(celda))
      );

      // Comprobamos que todas las posiciones coincidan.
      for (const celda of barco.celdas) {

        if (!celdasHundidas.has(this.crearClave(celda))) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Función: esConfiguracionValida
   *
   * Descripción:
   * Comprueba que una configuración sea compatible
   * con la información obtenida en la partida.
   *
   * Entrada:
   * - configuracion: posible ubicación de barcos.
   * - resultados: objeto que contiene:
   *   agua, impactos y hundidos.
   *
   * Salida:
   * - true si la configuración es compatible.
   * - false si contradice algún resultado.
   */
  esConfiguracionValida(configuracion, resultados = {}) {

    const agua = resultados.agua ?? [];
    const impactos = resultados.impactos ?? [];
    const hundidos = resultados.hundidos ?? [];

    // Obtenemos las celdas ocupadas por los barcos.
    const ocupadas = this.obtenerCeldasOcupadas(
      configuracion
    );

    // Descartamos barcos ubicados sobre agua conocida.
    if (!this.validarAgua(ocupadas, agua)) {
      return false;
    }

    // Descartamos configuraciones que no cubren impactos.
    if (!this.validarImpactos(ocupadas, impactos)) {
      return false;
    }

    // Comprobamos los barcos hundidos conocidos.
    if (!this.validarHundidos(configuracion, hundidos)) {
      return false;
    }

    return true;
  }

  /**
   * Función: filtrarSimulaciones
   *
   * Descripción:
   * Recorre todas las simulaciones y conserva
   * únicamente las configuraciones compatibles
   * con los resultados conocidos.
   *
   * Entrada:
   * - simulaciones: arreglo de posibles flotas.
   * - resultados: objeto con agua, impactos
   *   y barcos hundidos conocidos.
   *
   * Salida:
   * - Arreglo de configuraciones válidas.
   */
  filtrarSimulaciones(simulaciones, resultados = {}) {

    const configuracionesValidas = [];

    // Evaluamos cada configuración generada.
    for (const configuracion of simulaciones) {

      const esValida = this.esConfiguracionValida(
        configuracion,
        resultados
      );

      // Conservamos solamente las compatibles.
      if (esValida) {
        configuracionesValidas.push(configuracion);
      }
    }

    return configuracionesValidas;
  }
}
