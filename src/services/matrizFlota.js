
/**
 * Función: convertirFlotaAMatriz
 *
 * Descripción:
 * Convierte las posiciones de los barcos en una matriz
 * que permite representar la flota dentro del tablero.
 *
 * Entradas:
 * @param {Array} flota - Lista de barcos con sus posiciones.
 * @param {number} tamanoTablero - Cantidad de filas y columnas.
 *
 * Retorno:
 * @returns {Array} Matriz con el estado y la información
 *                  de cada celda del tablero.
 */
export function convertirFlotaAMatriz(flota, tamanoTablero) {
  // Crear una matriz de celdas inicialmente vacías.
  const matriz = Array.from(
    { length: tamanoTablero },
    () => Array.from({ length: tamanoTablero }, () => ({ estado: "sin-disparo",
        tieneBarco: false, barcoId: null}))
  );

  // Recorrer los barcos que conforman la flota.
  for (const barco of flota) {

    // Recorrer cada posición ocupada por el barco.
    for (const posicion of barco.posiciones) {
      const { fila, columna } = posicion;

      // Verificar que la posición esté dentro del tablero.
      if ( !Number.isInteger(fila) || !Number.isInteger(columna) ||
        fila < 0 || fila >= tamanoTablero || 
        columna < 0 || columna >= tamanoTablero ) {

        throw new Error("El barco contiene una posición inválida.");
      }

      // Evitar asignar dos barcos a una misma celda.
      if (matriz[fila][columna].tieneBarco) {
        throw new Error("Se detectaron barcos superpuestos.");
      }

      // Registrar la información del barco en la celda.
      matriz[fila][columna].tieneBarco = true;
      matriz[fila][columna].barcoId = barco.id;
    }
  }

  return matriz;
}
