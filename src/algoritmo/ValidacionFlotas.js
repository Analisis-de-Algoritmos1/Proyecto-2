
/**
 * Clase: ValidacionFlotas
 *
 * Descripción:
 * Esta clase verifica que los barcos se puedan colocar
 * correctamente dentro del tablero de Batalla Naval.
 *
 * Entrada:
 * - Tamaño del tablero.
 * - Posición inicial del barco.
 * - Longitud y orientación del barco.
 * - Celdas ocupadas por otros barcos.
 *
 * Salida:
 * - Lista de posiciones que ocupa un barco.
 * - true si la posición es válida.
 * - false si la posición no es válida.
 */
export class ValidacionFlotas {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa el tamaño del tablero.
   *
   * Entrada:
   * - tamanoTablero: tamaño del tablero (10 por defecto).
   *
   * Salida:
   * - Instancia de ValidacionFlotas configurada.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
  }

  /**
   * Función: obtenerCeldasBarco
   *
   * Descripción:
   * Calcula las celdas que ocupará un barco
   * según su posición inicial y orientación.
   *
   * Entrada:
   * - fila: fila inicial del barco.
   * - columna: columna inicial del barco.
   * - longitud: cantidad de celdas del barco.
   * - orientacion: "H" horizontal o "V" vertical.
   *
   * Salida:
   * - Arreglo de objetos con fila y columna.
   * - null si los parámetros son incorrectos.
   */
  obtenerCeldasBarco(fila, columna, longitud, orientacion) {

    // Verificamos que los parámetros sean correctos.
    if (
      !Number.isInteger(fila) ||
      !Number.isInteger(columna) ||
      !Number.isInteger(longitud) ||
      longitud <= 0 ||
      !["H", "V"].includes(orientacion)
    ) {
      return null;
    }

    // Guardamos las posiciones que ocupará el barco.
    const celdas = [];

    // Recorremos cada posición del barco.
    for (let i = 0; i < longitud; i++) {

      // Si es vertical, aumenta la fila.
      const nuevaFila =
        orientacion === "V" ? fila + i : fila;

      // Si es horizontal, aumenta la columna.
      const nuevaColumna =
        orientacion === "H" ? columna + i : columna;

      // Agregamos la posición calculada.
      celdas.push({
        fila: nuevaFila,
        columna: nuevaColumna
      });
    }

    // Devolvemos todas las posiciones calculadas.
    return celdas;
  }

  /**
   * Función: validarPosicion
   *
   * Descripción:
   * Comprueba que un barco esté dentro del tablero
   * y que no se superponga con otros barcos.
   *
   * Entrada:
   * - fila: fila inicial del barco.
   * - columna: columna inicial del barco.
   * - longitud: tamaño del barco.
   * - orientacion: "H" o "V".
   * - ocupadas: Set con las posiciones ya ocupadas.
   *   Ejemplo: new Set(["2,3", "2,4"]).
   *
   * Salida:
   * - true si el barco puede colocarse.
   * - false si sale del tablero o se superpone.
   */
  validarPosicion(fila, columna, longitud, orientacion, ocupadas) {

    // Obtenemos las posiciones que ocuparía el barco.
    const celdas = this.obtenerCeldasBarco(
      fila,
      columna,
      longitud,
      orientacion
    );

    // Verificamos que los datos recibidos sean válidos.
    if (!celdas || !(ocupadas instanceof Set)) {
      return false;
    }

    // Revisamos cada una de las posiciones del barco.
    for (const celda of celdas) {

      // Comprobamos que no se salga del tablero.
      if (
        celda.fila < 0 ||
        celda.columna < 0 ||
        celda.fila >= this.tamanoTablero ||
        celda.columna >= this.tamanoTablero
      ) {
        return false;
      }

      // Convertimos la posición en una clave de texto.
      const clave = `${celda.fila},${celda.columna}`;

      // Comprobamos si ya existe otro barco en esa celda.
      if (ocupadas.has(clave)) {
        return false;
      }
    }

    // Si todas las posiciones son legales, devolvemos true.
    return true;
  }
}
