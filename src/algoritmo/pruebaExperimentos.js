
import { PruebasAlgoritmo } from "./PruebasAlgoritmo.js";

/**
 * Archivo: pruebaExperimentos
 * Función: comparar distintas cantidades de simulaciones.
 * Entrada: escenario inicial y cantidades de prueba.
 * Salida: resultados experimentales en consola.
 */

const pruebas = new PruebasAlgoritmo(10);

// Escenario de partida nueva.
const disparos = {
  agua: [],
  impactos: [],
  hundidos: []
};

console.log("=== EXPERIMENTOS DEL ALGORITMO ===");

// Primero ejecutamos una prueba pequeña.
const pruebaInicial = pruebas.ejecutarPrueba(
  100,
  disparos
);

console.log("\n=== PRUEBA INICIAL ===");
pruebas.mostrarResultados([pruebaInicial]);

console.log(
  "Se generaron configuraciones:",
  pruebaInicial.generadas > 0
);

console.log(
  "Se obtuvieron muestras válidas:",
  pruebaInicial.validas > 0
);

console.log(
  "El tiempo es válido:",
  Number.isFinite(pruebaInicial.tiempoMs) &&
  pruebaInicial.tiempoMs >= 0
);

// Cambiar a true para ejecutar la comparación completa.
const ejecutarTodas = true;

if (ejecutarTodas) {
  console.log("\n=== COMPARACIÓN COMPLETA ===");

  // Ejecutamos las cuatro cantidades del enunciado.
  const resultados = pruebas.ejecutarComparacion(
    disparos,
    [100, 1000, 5000, 10000]
  );

  pruebas.mostrarResultados(resultados);
}
