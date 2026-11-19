
/*
 * Archivo: adaptadorResultados.js
 *
 * Descripción:
 * Convierte los resultados de los disparos al
 * formato requerido por el agente probabilístico.
 *
 * Permite comunicar impactos, fallos y barcos
 * hundidos sin revelar las posiciones ocultas.
 */

import { TIPOS_BARCOS } from "../config/flota.js";

/**
 * Función: adaptarResultadoParaAgente
 *
 * Descripción:
 * Convierte el resultado de procesarDisparo()
 * al formato que utiliza el agente automático.
 * Cuando se hunde un barco, incluye su nombre
 * y todas las posiciones que ocupaba.
 *
 * Entradas:
 * @param {Object} disparo - Resultado del disparo.
 * @param {number} fila - Fila atacada.
 * @param {number} columna - Columna atacada.
 *
 * Retorno:
 * @returns {Object} Resultado compatible con el agente.
 */
export function adaptarResultadoParaAgente(disparo, fila, columna) {

  // Comprueba si el disparo fue válido.
  if (!disparo.valido) {
    throw new Error("No se puede registrar un disparo inválido.");
  }

  // Devuelve directamente los resultados de agua e impacto.
  if (
    disparo.resultado === "agua" ||
    disparo.resultado === "impacto"
  ) {
    return {
      tipo: disparo.resultado
    };
  }

  // Comprueba si el disparo hundió un barco.
  if (disparo.resultado !== "hundido") {
    throw new Error("El resultado del disparo no es válido.");
  }

  // Obtiene el identificador del barco hundido.
  const barcoId = disparo.matriz[fila][columna].barcoId;

  // Busca el nombre y tamaño del barco en la configuración.
  const barco = TIPOS_BARCOS.find(
    (tipo) => tipo.id === barcoId
  );

  // Comprueba si encontró el barco.
  if (!barco) {
    throw new Error("No se encontró el barco hundido.");
  }

  // Almacena las posiciones del barco hundido.
  const celdas = [];

  // Recorre las filas de la matriz.
  for (let filaActual = 0; filaActual < disparo.matriz.length; filaActual++) {

    // Recorre las columnas de cada fila.
    for (let columnaActual = 0;
      columnaActual < disparo.matriz[filaActual].length;
      columnaActual++) {

      // Obtiene la celda actual.
      const celda = disparo.matriz[filaActual][columnaActual];

      // Compara si la celda pertenece al barco hundido.
      if (celda.barcoId === barcoId) {
        celdas.push({
          fila: filaActual,
          columna: columnaActual
        });
      }
    }
  }

  // Comprueba que el barco tenga todas sus posiciones.
  if (celdas.length !== barco.tamano) {
    throw new Error("Las posiciones del barco están incompletas.");
  }

  // Devuelve la información del barco hundido al agente.
  return {
    tipo: "hundido",
    nombre: barco.nombre,
    celdas
  };
}
