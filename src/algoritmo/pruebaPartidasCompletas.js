
import { SimuladorPartidas } from "./SimuladorPartidas.js";

/**
 * Archivo: pruebaPartidasCompletas
 * Función: evaluar varias partidas completas.
 * Entrada: cantidad de partidas y simulaciones.
 * Salida: victorias, disparos y tiempos.
 */

const simulador = new SimuladorPartidas(10);

const cantidadPartidas = 3;
const simulaciones = 100;

console.log("=== EXPERIMENTO DE PARTIDAS COMPLETAS ===");

const resultados = [];

// Ejecutamos tres partidas independientes.
for (let i = 0; i < cantidadPartidas; i++) {

  console.log(`\nEjecutando partida ${i + 1}...`);

  const partida = simulador.ejecutarPartida(
    simulaciones,
    100
  );

  resultados.push(partida);

  console.log(
    "Estado:",
    partida.estado
  );

  console.log(
    "Disparos:",
    partida.disparos
  );

  console.log(
    "Barcos hundidos:",
    partida.barcosHundidos
  );

  console.log(
    "Tiempo:",
    partida.tiempoTotalMs,
    "ms"
  );
}

console.log("\n=== RESULTADOS ===");

console.table(resultados);

// Obtenemos estadísticas de las partidas completas.
const resumen = simulador.obtenerResumen(resultados);

console.log("\n=== RESUMEN ===");
console.log("Partidas:", resumen.partidas);
console.log("Victorias:", resumen.victorias);
console.log("Porcentaje de victorias:", resumen.porcentajeVictorias + "%");
console.log("Promedio de disparos en victorias:", resumen.promedioDisparos);
console.log("Tiempo promedio:", resumen.promedioTiempoMs, "ms");
