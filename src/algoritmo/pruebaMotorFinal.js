
import { MotorProbabilistico } from "./MotorProbabilistico.js";

/**
 * Archivo: pruebaMotorFinal.js
 *
 * Descripción:
 * Comprueba que el motor probabilístico
 * pueda analizar distintos escenarios
 * de una partida de Batalla Naval.
 *
 * Entrada:
 * - Tablero de 10x10.
 * - Tres escenarios de disparos.
 * - 100 simulaciones por escenario.
 *
 * Salida:
 * - Resultados del análisis.
 * - Recomendaciones.
 * - Estadísticas de funcionamiento.
 */

const motor = new MotorProbabilistico(10);

/**
 * Función: ejecutarEscenario
 *
 * Descripción:
 * Ejecuta el motor y muestra sus resultados.
 *
 * Entrada:
 * - nombre: descripción de la prueba.
 * - resultados: disparos conocidos.
 * - cantidad: simulaciones solicitadas.
 *
 * Salida:
 * - Objeto con el análisis realizado.
 */
function ejecutarEscenario(nombre, resultados, cantidad) {

  console.log("\n============================");
  console.log(nombre);
  console.log("============================");

  const analisis = motor.analizar(
    resultados,
    cantidad
  );

  console.log(
    "Simulaciones solicitadas:",
    analisis.simulacionesSolicitadas
  );

  console.log(
    "Simulaciones generadas:",
    analisis.simulacionesGeneradas
  );

  console.log(
    "Configuraciones válidas:",
    analisis.configuracionesValidas
  );

  console.log(
    "Configuraciones descartadas:",
    analisis.configuracionesDescartadas
  );

  console.log(
    "Tiempo:",
    analisis.tiempoMs,
    "ms"
  );

  console.log(
    "Existe estimación:",
    analisis.hayEstimacion
  );

  console.log(
    "Muestras solicitadas alcanzadas:",
    analisis.objetivoMuestrasCumplido
  );

  if (analisis.recomendacion !== null) {

    console.log(
      "Objetivo recomendado:",
      analisis.recomendacion.coordenada
    );

    console.log(
      "Probabilidad estimada:",
      analisis.recomendacion.porcentaje + "%"
    );

  } else {
    console.log(
      "No existe una recomendación disponible."
    );
  }

  return analisis;
}

// ESCENARIO 1:
// Partida nueva, sin disparos anteriores.
const escenario1 = ejecutarEscenario(
  "ESCENARIO 1: PARTIDA NUEVA",
  {
    agua: [],
    impactos: [],
    hundidos: []
  },
  100
);

// ESCENARIO 2:
// Se conocen dos disparos fallidos.
const escenario2 = ejecutarEscenario(
  "ESCENARIO 2: AGUA CONOCIDA",
  {
    agua: [
      { fila: 0, columna: 0 },
      { fila: 0, columna: 1 }
    ],
    impactos: [],
    hundidos: []
  },
  100
);

// ESCENARIO 3:
// Se conocen dos celdas de agua
// y tres impactos consecutivos.
const escenario3 = ejecutarEscenario(
  "ESCENARIO 3: VARIOS IMPACTOS",
  {
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
  },
  100
);

// Verificamos que los resultados tengan
// matrices del tamaño solicitado.
const matricesCorrectas = [
  escenario1,
  escenario2,
  escenario3
].every(analisis =>
  analisis.probabilidades.length === 10 &&
  analisis.probabilidades.every(
    fila => fila.length === 10
  )
);

console.log("\n=== VERIFICACIÓN FINAL ===");

console.log(
  "Matrices de 10x10:",
  matricesCorrectas
);

// Verificamos que las probabilidades
// estén siempre entre cero y uno.
const probabilidadesCorrectas = [
  escenario1,
  escenario2,
  escenario3
].every(analisis =>
  analisis.probabilidades.every(
    fila => fila.every(
      valor => valor >= 0 && valor <= 1
    )
  )
);

console.log(
  "Probabilidades válidas:",
  probabilidadesCorrectas
);

// Comprobamos que el escenario de impactos
// tenga suficientes muestras para recomendar.
console.log(
  "Escenario de impactos con muestras:",
  escenario3.configuracionesValidas > 0
);

// Verificamos que no recomiende posiciones
// que ya fueron atacadas en el escenario 3.
const atacadas = new Set([
  "0,0",
  "0,1",
  "4,4",
  "4,5",
  "4,6"
]);

const objetivo = escenario3.recomendacion;

console.log(
  "No repite disparos:",
  objetivo !== null &&
  !atacadas.has(
    `${objetivo.fila},${objetivo.columna}`
  )
);
