
import { MotorProbabilistico } from "./MotorProbabilistico.js";
import { GeneradorSimulaciones } from "./GeneradorSimulaciones.js";
import { FiltradoResultados } from "./FiltradoResultados.js";

/**
 * Archivo: pruebaCasosEspeciales.js
 *
 * Descripción:
 * Comprueba situaciones especiales del algoritmo,
 * como barcos hundidos, información contradictoria
 * y configuraciones incompatibles.
 *
 * Entrada:
 * - Historial de disparos.
 * - Barcos hundidos conocidos.
 * - Cantidad de simulaciones.
 *
 * Salida:
 * - Resultados de las verificaciones en consola.
 */

const motor = new MotorProbabilistico(10);
const generador = new GeneradorSimulaciones(10);
const filtro = new FiltradoResultados();

/**
 * Función: verificar
 *
 * Entrada:
 * - nombre: descripción de la prueba.
 * - condicion: resultado booleano.
 *
 * Salida:
 * - Mensaje de aprobación o fallo.
 */
function verificar(nombre, condicion) {
  console.log(
    `${condicion ? "CORRECTO" : "FALLO"}: ${nombre}`
  );
}

// PRUEBA 1: información contradictoria.
const resultadosContradictorios = {
  agua: [{ fila: 3, columna: 3 }],
  impactos: [{ fila: 3, columna: 3 }],
  hundidos: []
};

const flotaContradictoria = generador.generarFlota(
  resultadosContradictorios
);

verificar(
  "Detectar agua e impacto en la misma celda",
  flotaContradictoria === null
);

// PRUEBA 2: barco hundido conocido.
const resultadosHundido = {
  agua: [],
  impactos: [],
  hundidos: [
    {
      nombre: "Destructor",
      celdas: [
        { fila: 1, columna: 1 },
        { fila: 1, columna: 2 }
      ]
    }
  ]
};

const flotaHundido = generador.generarFlota(
  resultadosHundido
);

verificar(
  "Generar una flota con un destructor hundido",
  flotaHundido !== null
);

if (flotaHundido !== null) {
  verificar(
    "Respetar la ubicación del barco hundido",
    filtro.esConfiguracionValida(
      flotaHundido,
      resultadosHundido
    )
  );
}

// PRUEBA 3: barco hundido incompatible.
const resultadosImposibles = {
  agua: [
    { fila: 1, columna: 1 }
  ],
  impactos: [],
  hundidos: [
    {
      nombre: "Destructor",
      celdas: [
        { fila: 1, columna: 1 },
        { fila: 1, columna: 2 }
      ]
    }
  ]
};

verificar(
  "Rechazar un barco hundido sobre agua conocida",
  generador.generarFlota(resultadosImposibles) === null
);

// PRUEBA 4: motor sin configuraciones compatibles.
const analisis = motor.analizar(
  resultadosContradictorios,
  10
);

verificar(
  "No producir estimación con datos contradictorios",
  analisis.hayEstimacion === false
);

verificar(
  "No recomendar un objetivo sin estimación",
  analisis.recomendacion === null
);

console.log("\nPruebas de casos especiales terminadas.");
