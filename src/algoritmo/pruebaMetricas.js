
import { MetricasAlgoritmo } from "./MetricasAlgoritmo.js";

/**
 * Archivo: pruebaMetricas
 * Función: comprobar el registro de estadísticas.
 * Entrada: disparos y análisis de prueba.
 * Salida: verificaciones en consola.
 */

const metricas = new MetricasAlgoritmo(5);

console.log("=== PRUEBA DE MÉTRICAS ===");

// Registramos disparos del agente.
metricas.registrarDisparo("agente", "agua");
metricas.registrarDisparo("agente", "impacto");
metricas.registrarDisparo("agente", "hundido");

// Registramos disparos del jugador.
metricas.registrarDisparo("jugador", "agua");
metricas.registrarDisparo("jugador", "impacto");

// Registramos un análisis de ejemplo.
metricas.registrarAnalisis({
  simulacionesSolicitadas: 1000,
  simulacionesRealizadas: 1000,
  configuracionesValidas: 950,
  configuracionesDescartadas: 50,
  tiempoMs: 125.5,
  hayEstimacion: true,
  recomendacion: {
    coordenada: "E5",
    probabilidad: 0.65
  }
});

// Registramos una decisión.
metricas.registrarDecision("agente", {
  coordenada: "E5",
  resultado: "impacto",
  siguioRecomendacion: true,
  probabilidad: 0.65
});

const datos = metricas.obtenerEstadisticas();

console.log("\n=== VERIFICACIONES ===");

console.log(
  "Agente realizó 3 disparos:",
  datos.agente.disparos === 3
);

console.log(
  "Agente obtuvo 2 impactos:",
  datos.agente.impactos === 2
);

console.log(
  "Agente tiene 4 barcos restantes:",
  datos.agente.barcosRestantes === 4
);

console.log(
  "Jugador realizó 2 disparos:",
  datos.jugador.disparos === 2
);

console.log(
  "Análisis registrado:",
  datos.algoritmo.cantidadAnalisis === 1
);

console.log(
  "Tiempo promedio correcto:",
  datos.algoritmo.tiempoPromedioMs === 125.5
);

console.log(
  "Decisión registrada:",
  metricas.obtenerHistorialDecisiones().length === 1
);

// Reiniciamos las estadísticas.
metricas.reiniciar();

console.log(
  "Reinicio correcto:",
  metricas.obtenerEstadisticas().agente.disparos === 0
);
