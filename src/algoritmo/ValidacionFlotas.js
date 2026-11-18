
/**
 * Clase: ValidacionFlotas
 * Función: verificar la colocación de barcos.
 * Entrada: posición, longitud y orientación.
 * Salida: posiciones del barco y validación.
 */
export class ValidacionFlotas {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: validador inicializado.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
  }

  /**
   * Función: obtenerCeldasBarco
   * Entrada: fila, columna, longitud y orientación.
   * Salida: arreglo de celdas o null.
   */
  obtenerCeldasBarco(fila, columna, longitud, orientacion) {

    if (
      !Number.isInteger(fila) ||
      !Number.isInteger(columna) ||
      !Number.isInteger(longitud) ||
      longitud <= 0 ||
      !["H", "V"].includes(orientacion)
    ) {
      return null;
    }

    const celdas = [];

    for (let i = 0; i < longitud; i++) {

      const nuevaFila =
        orientacion === "V" ? fila + i : fila;

      const nuevaColumna =
        orientacion === "H" ? columna + i : columna;

      celdas.push({
        fila: nuevaFila,
        columna: nuevaColumna
      });
    }

    return celdas;
  }

  /**
   * Función: validarPosicion
   * Entrada: posición, longitud, orientación y celdas ocupadas.
   * Salida: true si es válida; false si no lo es.
   */
  validarPosicion(fila, columna, longitud, orientacion, ocupadas) {

    const celdas = this.obtenerCeldasBarco(
      fila,
      columna,
      longitud,
      orientacion
    );

    if (!celdas || !(ocupadas instanceof Set)) {
      return false;
    }

    for (const celda of celdas) {

      // Verificamos los límites del tablero.
      if (
        celda.fila < 0 ||
        celda.columna < 0 ||
        celda.fila >= this.tamanoTablero ||
        celda.columna >= this.tamanoTablero
      ) {
        return false;
      }

      const clave = `${celda.fila},${celda.columna}`;

      // Evitamos superposiciones entre barcos.
      if (ocupadas.has(clave)) {
        return false;
      }
    }

    return true;
  }
}
