
/**
 * Clase: FiltradoResultados
 * Función: descartar flotas incompatibles con los disparos.
 * Entrada: configuraciones, agua, impactos y hundidos.
 * Salida: configuraciones válidas.
 */
export class FiltradoResultados {

  /**
   * Función: constructor
   * Entrada: ninguna.
   * Salida: instancia del filtro.
   */
  constructor() {
    // No requiere atributos iniciales.
  }

  /**
   * Función: crearClave
   * Entrada: celda con fila y columna.
   * Salida: texto "fila,columna".
   */
  crearClave(celda) {
    return `${celda.fila},${celda.columna}`;
  }

  /**
   * Función: obtenerCeldasOcupadas
   * Entrada: configuración de barcos.
   * Salida: Set con las posiciones ocupadas.
   */
  obtenerCeldasOcupadas(configuracion) {
    const ocupadas = new Set();

    for (const barco of configuracion) {
      for (const celda of barco.celdas) {
        ocupadas.add(this.crearClave(celda));
      }
    }

    return ocupadas;
  }

  /**
   * Función: validarAgua
   * Entrada: posiciones ocupadas y celdas de agua.
   * Salida: true si no existen contradicciones.
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
   * Entrada: posiciones ocupadas e impactos conocidos.
   * Salida: true si todos los impactos tienen barco.
   */
  validarImpactos(ocupadas, impactos) {
    for (const celda of impactos) {
      const clave = this.crearClave(celda);

      // Cada impacto debe contener un barco.
      if (!ocupadas.has(clave)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Función: validarHundidos
   * Entrada: configuración y barcos hundidos.
   * Salida: true si las posiciones coinciden.
   */
  validarHundidos(configuracion, hundidos) {
    for (const hundido of hundidos) {

      const barco = configuracion.find(
        actual => actual.nombre === hundido.nombre
      );

      if (!barco) {
        return false;
      }

      if (barco.celdas.length !== hundido.celdas.length) {
        return false;
      }

      const celdasHundidas = new Set(
        hundido.celdas.map(celda => this.crearClave(celda))
      );

      // Comprobamos todas las posiciones del barco.
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
   * Entrada: configuración y resultados conocidos.
   * Salida: true si la flota es compatible.
   */
  esConfiguracionValida(configuracion, resultados = {}) {
    const agua = resultados.agua ?? [];
    const impactos = resultados.impactos ?? [];
    const hundidos = resultados.hundidos ?? [];

    const ocupadas = this.obtenerCeldasOcupadas(
      configuracion
    );

    if (!this.validarAgua(ocupadas, agua)) {
      return false;
    }

    if (!this.validarImpactos(ocupadas, impactos)) {
      return false;
    }

    if (!this.validarHundidos(configuracion, hundidos)) {
      return false;
    }

    return true;
  }

  /**
   * Función: filtrarSimulaciones
   * Entrada: simulaciones y resultados conocidos.
   * Salida: arreglo con configuraciones compatibles.
   */
  filtrarSimulaciones(simulaciones, resultados = {}) {
    const configuracionesValidas = [];

    for (const configuracion of simulaciones) {
      if (this.esConfiguracionValida(
        configuracion,
        resultados
      )) {
        configuracionesValidas.push(configuracion);
      }
    }

    return configuracionesValidas;
  }
}
