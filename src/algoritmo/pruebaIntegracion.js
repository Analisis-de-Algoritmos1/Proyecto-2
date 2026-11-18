
import { IntegracionAgenteMetricas } from "./IntegracionAgenteMetricas.js";

/**
 * Archivo: pruebaIntegracion
 * Función: comprobar agente y métricas trabajando juntos.
 * Entrada: tres disparos simulados.
 * Salida: verificaciones en consola.
 */

const sistema = new IntegracionAgenteMetricas(10, 100);

console.log("=== PRUEBA DE INTEGRACIÓN ===");

/**
 * Función: resolverPrueba
 * Entrada: fila y columna.
 * Salida: resultado simulado de agua.
 */
function resolverPrueba(fila, columna) {
  return { tipo: "agua" };
}

// Ejecutamos tres turnos.
for (let i = 1; i <= 3; i++) {
  const turno = sistema.ejecutarTurnoAgente(
    resolverPrueba
  );

  console.log(
    `Turno ${i}:`,
    turno?.disparo.coordenada,
    turno?.disparo.tipo
  );
}

// Consultamos el estado completo.
const estado = sistema.obtenerEstado();

console.log("\n=== VERIFICACIONES ===");

console.log(
  "Tres disparos del agente:",
  estado.estadisticas.agente.disparos === 3
);

console.log(
  "Tres disparos fallidos:",
  estado.estadisticas.agente.fallidos === 3
);

console.log(
  "Tres análisis registrados:",
  estado.estadisticas.algoritmo.cantidadAnalisis === 3
);

console.log(
  "Tres decisiones registradas:",
  estado.decisiones.length === 3
);

console.log(
  "Tres celdas conocidas:",
  estado.conocimiento.agua.length === 3
);

// Simulamos un turno humano.
sistema.registrarTurnoJugador("B4", "impacto");

console.log(
  "Disparo del jugador registrado:",
  sistema.obtenerEstado().estadisticas.jugador.disparos === 1
);

// Reiniciamos la partida.
sistema.reiniciar();

const reiniciado = sistema.obtenerEstado();

console.log(
  "Agente reiniciado:",
  reiniciado.estadisticas.agente.disparos === 0
);

console.log(
  "Jugador reiniciado:",
  reiniciado.estadisticas.jugador.disparos === 0
);

console.log(
  "Historial vacío:",
  reiniciado.decisiones.length === 0
);
