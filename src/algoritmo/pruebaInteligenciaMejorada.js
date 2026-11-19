
import { SeleccionObjetivo } from "./SeleccionObjetivo.js";

/**
 * Archivo: pruebaInteligenciaMejorada
 * Función: comprobar búsqueda y persecución.
 * Entrada: escenarios controlados.
 * Salida: verificaciones en consola.
 */

const selector = new SeleccionObjetivo(10);

/**
 * Función: crearMapa
 * Entrada: probabilidad inicial.
 * Salida: matriz de 10 x 10.
 */
function crearMapa(valor = 0.1) {
  return Array.from(
    { length: 10 },
    () => Array(10).fill(valor)
  );
}

/**
 * Función: comprobar
 * Entrada: nombre y condición.
 * Salida: resultado de la prueba.
 */
function comprobar(nombre, condicion) {
  console.log(`${nombre}: ${condicion ? "true" : "false"}`);

  if (!condicion) {
    throw new Error(`Falló la prueba: ${nombre}`);
  }
}

console.log("=== INTELIGENCIA MEJORADA ===");

// Escenario 1: búsqueda normal.
const mapa1 = crearMapa();
mapa1[4][4] = 0.9;

const objetivo1 = selector.seleccionar(mapa1);

comprobar(
  "Selecciona máxima probabilidad sin impactos",
  objetivo1.coordenada === "E5"
);

// Escenario 2: un impacto pendiente.
const mapa2 = crearMapa();
mapa2[0][0] = 0.95;
mapa2[4][5] = 0.6;

const resultados2 = {
  agua: [],
  impactos: [{ fila: 4, columna: 4 }],
  hundidos: []
};

const objetivo2 = selector.seleccionar(
  mapa2,
  resultados2
);

comprobar(
  "Persigue un impacto conocido",
  objetivo2.coordenada === "E6"
);

// Escenario 3: dos impactos horizontales.
const mapa3 = crearMapa();
mapa3[2][2] = 0.8;
mapa3[4][2] = 0.7;
mapa3[4][5] = 0.6;

const resultados3 = {
  agua: [],
  impactos: [
    { fila: 4, columna: 3 },
    { fila: 4, columna: 4 }
  ],
  hundidos: []
};

const objetivo3 = selector.seleccionar(
  mapa3,
  resultados3
);

comprobar(
  "Continúa la orientación horizontal",
  ["E3", "E6"].includes(objetivo3.coordenada)
);

// Escenario 4: evita disparos repetidos.
const mapa4 = crearMapa();
mapa4[4][5] = 0.9;

const resultados4 = {
  agua: [{ fila: 4, columna: 5 }],
  impactos: [{ fila: 4, columna: 4 }],
  hundidos: []
};

const objetivo4 = selector.seleccionar(
  mapa4,
  resultados4
);

comprobar(
  "No repite disparos",
  objetivo4.coordenada !== "E6" &&
  objetivo4.coordenada !== "E5"
);

// Escenario 5: no existen muestras válidas.
const objetivo5 = selector.seleccionar(
  crearMapa(),
  {},
  false
);

comprobar(
  "No recomienda sin estimación",
  objetivo5 === null
);

console.log("\nTodas las pruebas terminaron correctamente.");
