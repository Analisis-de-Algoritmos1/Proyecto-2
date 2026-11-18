
import { SimuladorPartidas } from "./SimuladorPartidas.js";

/**
 * Archivo: pruebaSimulador
 * Función: comprobar las simulaciones de partidas.
 * Entrada: 100 simulaciones y límite de 10 disparos.
 * Salida: estadísticas y verificaciones.
 */

const simulador = new SimuladorPartidas(10);

console.log("=== PRUEBA DEL SIMULADOR ===");

// Primera prueba con un máximo de 10 disparos.
const partida = simulador.ejecutarPartida(100, 10);

console.log("\nResultados:");
console.table([partida]);

console.log("\n=== VERIFICACIONES ===");

console.log(
  "Disparos dentro del límite:",
  partida.disparos >= 0 && partida.disparos <= 10
);

console.log(
  "Impactos y fallidos correctos:",
  partida.impactos + partida.fallidos === partida.disparos
);

console.log(
  "Barcos dentro del rango:",
  partida.barcosHundidos >= 0 &&
  partida.barcosHundidos <= 5
);

console.log(
  "Total de barcos correcto:",
  partida.barcosHundidos + partida.barcosRestantes === 5
);

console.log(
  "Tiempo registrado:",
  Number.isFinite(partida.tiempoTotalMs) &&
  partida.tiempoTotalMs >= 0
);

console.log(
  "Historial registrado:",
  simulador.obtenerHistorial().length === 1
);

// Activar cuando termine la prueba inicial.
const ejecutarPartidaCompleta = true;

if (ejecutarPartidaCompleta) {
  console.log("\n=== PARTIDA COMPLETA ===");

  const completa = simulador.ejecutarPartida(100, 100);

  console.table([completa]);

  console.log("Resumen:");
  console.log(simulador.obtenerResumen());
}
