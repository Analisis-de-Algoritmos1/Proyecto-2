
import { AgenteAutomatico } from "./AgenteAutomatico.js";

/**
 * Archivo: pruebaAgente.js
 *
 * Descripción:
 * Comprueba que el agente seleccione disparos,
 * registre sus resultados y pueda reiniciarse.
 *
 * Entrada:
 * - Tablero de 10x10.
 * - 100 simulaciones.
 * - Resultados simulados de agua.
 *
 * Salida:
 * - Historial de disparos.
 * - Verificaciones del funcionamiento.
 */

const agente = new AgenteAutomatico(10, 100);

console.log("=== PRUEBA DEL AGENTE ===");

/**
 * Función: resolverDisparoPrueba
 *
 * Descripción:
 * Simula temporalmente una respuesta del juego.
 * No representa una partida real de Batalla Naval.
 *
 * Entrada:
 * - fila y columna seleccionadas.
 *
 * Salida:
 * - Objeto que indica agua.
 */
function resolverDisparoPrueba(fila, columna) {
  return { tipo: "agua" };
}

// Ejecutamos tres turnos de prueba.
for (let turno = 1; turno <= 3; turno++) {

  const registro = agente.ejecutarTurno(
    resolverDisparoPrueba
  );

  console.log(`\nTurno ${turno}`);

  if (registro !== null) {
    console.log("Celda:", registro.coordenada);
    console.log("Resultado:", registro.tipo);
    console.log("Probabilidad:", registro.porcentaje + "%");
  }
}

// Consultamos el historial.
const historial = agente.obtenerHistorial();

console.log("\n=== VERIFICACIONES ===");

console.log(
  "Tres disparos registrados:",
  historial.length === 3
);

// Verificamos que no repita posiciones.
const posiciones = historial.map(
  disparo => `${disparo.fila},${disparo.columna}`
);

console.log(
  "Sin disparos repetidos:",
  new Set(posiciones).size === historial.length
);

// Comprobamos que conoce los resultados.
const conocimiento = agente.obtenerConocimiento();

console.log(
  "Tres celdas de agua conocidas:",
  conocimiento.agua.length === 3
);

// Cambiamos la configuración.
agente.cambiarSimulaciones(1000);

console.log(
  "Configuración actualizada:",
  agente.configuracion.obtenerCantidad() === 1000
);

// Reiniciamos el agente.
agente.reiniciar();

console.log(
  "Historial reiniciado:",
  agente.obtenerHistorial().length === 0
);

console.log(
  "Conocimiento reiniciado:",
  agente.obtenerConocimiento().agua.length === 0
);
