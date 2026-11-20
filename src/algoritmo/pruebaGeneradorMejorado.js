
import { GeneradorSimulaciones } from "./GeneradorSimulaciones.js";
import { FiltradoResultados } from "./FiltradoResultados.js";

/**
 * Archivo: pruebaGeneradorMejorado.js
 *
 * Función:
 * Comprobar que el nuevo generador construya
 * flotas compatibles con los disparos conocidos.
 *
 * Entrada:
 * - 100 configuraciones solicitadas.
 * - Dos celdas de agua y tres impactos.
 *
 * Salida:
 * - Cantidad de configuraciones generadas.
 * - Resultado de las validaciones.
 */

const generador = new GeneradorSimulaciones(10);
const filtro = new FiltradoResultados();

// Resultados conocidos de una partida.
const resultados = {
  agua: [
    { fila: 0, columna: 0 },
    { fila: 0, columna: 1 }
  ],
  impactos: [
    { fila: 4, columna: 4 },
    { fila: 4, columna: 5 },
    { fila: 4, columna: 6 }
  ],
  hundidos: []
};

// Generamos las configuraciones compatibles.
const simulaciones = generador.generarSimulaciones(
  100,
  resultados
);

console.log("=== GENERADOR MEJORADO ===");

console.log(
  "Configuraciones generadas:",
  simulaciones.length
);

// Todas las flotas deben contener cinco barcos.
const flotasCompletas = simulaciones.every(
  flota => flota.length === 5
);

console.log(
  "Todas las flotas completas:",
  flotasCompletas
);

// Verificamos que respeten los disparos.
const compatibles = simulaciones.every(
  flota => filtro.esConfiguracionValida(
    flota,
    resultados
  )
);

console.log(
  "Todas compatibles:",
  compatibles
);

// Comprobamos que ninguna flota tenga
// celdas superpuestas.
const sinSuperposiciones = simulaciones.every(flota => {

  const ocupadas = new Set();

  for (const barco of flota) {

    for (const celda of barco.celdas) {

      const clave = `${celda.fila},${celda.columna}`;

      if (ocupadas.has(clave)) {
        return false;
      }

      ocupadas.add(clave);
    }
  }

  return true;
});

console.log(
  "Sin superposiciones:",
  sinSuperposiciones
);

// Probamos información contradictoria.
const contradiccion = generador.generarFlota({
  agua: [{ fila: 2, columna: 2 }],
  impactos: [{ fila: 2, columna: 2 }],
  hundidos: []
});

console.log(
  "Detecta contradicción:",
  contradiccion === null
);
