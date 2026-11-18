
/*
 * Archivo: logicaDisparos.js
 *
 * Descripción:
 * Gestiona los disparos realizados sobre un tablero
 * de Batalla Naval, identificando impactos, fallos
 * y barcos hundidos.
 */

/**
 * Función: posicionValida
 *
 * Descripción:
 * Verifica que las coordenadas del disparo
 * correspondan a una celda existente.
 *
 * Entradas:
 * @param {Array} matriz - Matriz del tablero.
 * @param {number} fila - Fila del disparo.
 * @param {number} columna - Columna del disparo.
 *
 * Retorno:
 * @returns {boolean} Indica si la posición es válida.
 */
function posicionValida(matriz, fila, columna) {
  return (
    Array.isArray(matriz) &&          // Verifica que sea una matriz.
    Number.isInteger(fila) &&         // Verifica que la fila sea entera.
    Number.isInteger(columna) &&      // Verifica que la columna sea entera.
    fila >= 0 &&                      // Compara si la fila es válida.
    fila < matriz.length &&           // Compara si la fila está dentro del tablero.
    Array.isArray(matriz[fila]) &&    // Verifica que la fila exista.
    columna >= 0 &&                   // Compara si la columna es válida.
    columna < matriz[fila].length     // Compara si la columna está dentro del tablero.
  );
}

/**
 * Función: verificarBarcoHundido
 *
 * Descripción:
 * Comprueba si todas las celdas de un barco
 * ya recibieron un impacto.
 *
 * Entradas:
 * @param {Array} matriz - Matriz actualizada.
 * @param {string} barcoId - Identificador del barco.
 *
 * Retorno:
 * @returns {boolean} Indica si el barco está hundido.
 */
function verificarBarcoHundido(matriz, barcoId) {

  // Recorre la matriz y busca las celdas del barco.
  const celdasBarco = matriz
    .flat()
    .filter((celda) => celda.barcoId === barcoId);

  // Comprueba si encontró celdas del barco.
  if (celdasBarco.length === 0) {
    return false;
  }

  // Comprueba si todas las celdas fueron alcanzadas.
  return celdasBarco.every(
    (celda) =>
      celda.estado === "impacto" ||
      celda.estado === "hundido"
  );
}

/**
 * Función: marcarBarcoHundido
 *
 * Descripción:
 * Cambia al estado "hundido" todas las
 * posiciones pertenecientes al mismo barco.
 *
 * Entradas:
 * @param {Array} matriz - Matriz actualizada.
 * @param {string} barcoId - Identificador del barco.
 *
 * Retorno:
 * No retorna valores; modifica la matriz recibida.
 */
function marcarBarcoHundido(matriz, barcoId) {

  // Recorre las filas del tablero.
  for (const fila of matriz) {

    // Recorre las celdas de cada fila.
    for (const celda of fila) {

      // Compara si la celda pertenece al barco.
      if (celda.barcoId === barcoId) {
        celda.estado = "hundido"; // Marca la celda como hundida.
      }
    }
  }
}

/**
 * Función: procesarDisparo
 *
 * Descripción:
 * Procesa un disparo sobre el tablero, valida
 * las coordenadas, evita disparos repetidos y
 * determina si el resultado es agua, impacto
 * o un barco hundido.
 *
 * Entradas:
 * @param {Array} matriz - Matriz del tablero.
 * @param {number} fila - Fila seleccionada.
 * @param {number} columna - Columna seleccionada.
 *
 * Retorno:
 * @returns {Object} Resultado y matriz actualizada.
 */
export function procesarDisparo(matriz, fila, columna) {

  // Comprueba si el disparo está fuera del tablero.
  if (!posicionValida(matriz, fila, columna)) {
    return {
      matriz,
      resultado: "fuera-de-rango",
      valido: false
    };
  }

  // Busca la celda seleccionada.
  const celdaSeleccionada = matriz[fila][columna];

  // Comprueba si la celda ya fue atacada.
  if (celdaSeleccionada.estado !== "sin-disparo") {
    return {
      matriz,
      resultado: "repetido",
      valido: false
    };
  }

  // Recorre las filas y copia cada celda del tablero.
  const matrizActualizada = matriz.map((filaActual) =>
    filaActual.map((celda) => ({ ...celda }))
  );

  // Obtiene la celda que recibirá el disparo.
  const celdaAtacada = matrizActualizada[fila][columna];

  // Comprueba si la celda no contiene un barco.
  if (!celdaAtacada.tieneBarco) {
    celdaAtacada.estado = "agua";

    return {
      matriz: matrizActualizada,
      resultado: "agua",
      valido: true
    };
  }

  // Marca la celda como impactada.
  celdaAtacada.estado = "impacto";

  // Obtiene el identificador del barco.
  const barcoId = celdaAtacada.barcoId;

  // Comprueba si el barco existe y fue hundido.
  if (
    barcoId != null &&
    verificarBarcoHundido(matrizActualizada, barcoId)
  ) {

    // Marca todas las celdas del barco como hundidas.
    marcarBarcoHundido(matrizActualizada, barcoId);

    return {
      matriz: matrizActualizada,
      resultado: "hundido",
      valido: true
    };
  }

  // Devuelve el impacto si el barco sigue a flote.
  return {
    matriz: matrizActualizada,
    resultado: "impacto",
    valido: true
  };
}
