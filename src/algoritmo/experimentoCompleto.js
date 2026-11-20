
import { mkdirSync, writeFileSync } from "node:fs";
import process from "node:process";

import { PruebasAlgoritmo } from "./PruebasAlgoritmo.js";
import { SimuladorPartidas } from "./SimuladorPartidas.js";

// Cantidades de simulaciones solicitadas en el proyecto.
const CANTIDADES_SIMULACIONES = [
  100,
  1000,
  5000,
  10000
];

// Número de partidas por cada cantidad de simulaciones.
// Se puede indicar desde la terminal.
const REPETICIONES = Number(process.argv[2] ?? 1);

// Máximo de disparos posibles en un tablero de 10x10.
const MAXIMO_DISPAROS = 100;

// Directorio y archivo donde se guardarán los resultados.
const DIRECTORIO_RESULTADOS = new URL(
  "../datos/",
  import.meta.url
);

const ARCHIVO_RESULTADOS = new URL(
  "../datos/resultadosExperimentos.json",
  import.meta.url
);

/**
 * Función: crearConocimientoInicial
 *
 * Descripción:
 * Genera el conocimiento inicial del algoritmo,
 * sin resultados de disparos anteriores.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Objeto con los arreglos vacíos.
 */
function crearConocimientoInicial() {
  return {
    agua: [],
    impactos: [],
    hundidos: []
  };
}

/**
 * Función: redondear
 *
 * Descripción:
 * Redondea un valor numérico a dos decimales.
 *
 * Entradas:
 * @param {number} valor - Número que se redondeará.
 *
 * Retorno:
 * Número redondeado.
 */
function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Función: guardarResultados
 *
 * Descripción:
 * Guarda los resultados experimentales en un archivo
 * JSON para utilizarlos posteriormente en la interfaz.
 *
 * Entradas:
 * @param {Array} resultados - Experimentos realizados.
 *
 * Retorno:
 * No retorna valores.
 */
function guardarResultados(resultados) {

  // Crea el directorio si todavía no existe.
  mkdirSync(DIRECTORIO_RESULTADOS, {
    recursive: true
  });

  // Guarda los resultados reales de las pruebas.
  writeFileSync(
    ARCHIVO_RESULTADOS,
    JSON.stringify(resultados, null, 2),
    "utf8"
  );
}

/**
 * Función: ejecutarExperimentoCompleto
 *
 * Descripción:
 * Ejecuta análisis probabilísticos y partidas completas
 * utilizando diferentes cantidades de simulaciones.
 *
 * Mide por separado:
 * - Tiempo de una estimación probabilística.
 * - Configuraciones válidas de esa estimación.
 * - Disparos necesarios en partidas completas.
 * - Tiempo total de las partidas.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Lista con los resultados experimentales.
 */
function ejecutarExperimentoCompleto() {

  // Verifica que el número de repeticiones sea válido.
  if (
    !Number.isInteger(REPETICIONES) ||
    REPETICIONES < 1
  ) {
    throw new Error(
      "La cantidad de repeticiones debe ser un entero positivo."
    );
  }

  const resultados = [];

  console.log("\n==========================================");
  console.log("  BATALLA NAVAL - ANÁLISIS EXPERIMENTAL");
  console.log("==========================================");

  console.log(`Repeticiones por escenario: ${REPETICIONES}`);
  console.log(`Máximo de disparos: ${MAXIMO_DISPAROS}`);

  // Recorre las cuatro cantidades de simulaciones.
  for (const cantidad of CANTIDADES_SIMULACIONES) {

    console.log(
      `\nEjecutando escenario de ${cantidad} simulaciones...`
    );

    // Acumuladores de las mediciones.
    let totalTiempoEstimacion = 0;
    let totalConfiguracionesValidas = 0;
    let totalDisparosVictoria = 0;
    let totalTiempoPartidas = 0;

    // Cantidad de partidas ganadas.
    let victorias = 0;

    // Repite el escenario seleccionado.
    for (
      let repeticion = 1;
      repeticion <= REPETICIONES;
      repeticion++
    ) {

      console.log(
        `  Partida ${repeticion} de ${REPETICIONES}`
      );

      // ---------------------------------------
      // 1. ANÁLISIS PROBABILÍSTICO INDIVIDUAL
      // ---------------------------------------

      // Crea el sistema de pruebas.
      const pruebas = new PruebasAlgoritmo(10);

      // Ejecuta una estimación con tablero desconocido.
      const analisis = pruebas.ejecutarPrueba(
        cantidad,
        crearConocimientoInicial()
      );

      // Verifica los datos calculados.
      if (
        !Number.isFinite(analisis.tiempoMs) ||
        !Number.isFinite(analisis.validas)
      ) {
        throw new Error(
          "El análisis probabilístico no devolvió métricas válidas."
        );
      }

      // Acumula las mediciones del análisis.
      totalTiempoEstimacion += analisis.tiempoMs;

      totalConfiguracionesValidas += analisis.validas;

      // ---------------------------------------
      // 2. PARTIDA COMPLETA DEL AGENTE
      // ---------------------------------------

      // Genera una nueva partida con una flota aleatoria.
      const simulador = new SimuladorPartidas();

      // Ejecuta la partida completa utilizando el algoritmo.
      const partida = simulador.ejecutarPartida(
        cantidad,
        MAXIMO_DISPAROS
      );

      // Verifica las métricas de la partida.
      if (
        !Number.isFinite(partida.disparos) ||
        !Number.isFinite(partida.tiempoTotalMs)
      ) {
        throw new Error(
          "El simulador de partidas no devolvió métricas válidas."
        );
      }

      // Acumula el tiempo total de la partida.
      totalTiempoPartidas += partida.tiempoTotalMs;

      // Los disparos necesarios para ganar solo
      // se promedian entre las partidas ganadas.
      if (partida.victoria) {

        victorias++;

        totalDisparosVictoria += partida.disparos;
      }

      // Muestra el resultado individual.
      console.log(
        `    Victoria: ${partida.victoria ? "Sí" : "No"}`
      );

      console.log(
        `    Disparos: ${partida.disparos}`
      );
    }

    // Calcula las métricas promedio.
    const promedioTiempoEstimacion =
      totalTiempoEstimacion / REPETICIONES;

    const promedioConfiguracionesValidas =
      totalConfiguracionesValidas / REPETICIONES;

    const promedioTiempoPartida =
      totalTiempoPartidas / REPETICIONES;

    // No inventa disparos de victoria cuando no ganó.
    const promedioDisparos = victorias > 0
      ? totalDisparosVictoria / victorias
      : null;

    // Construye la fila experimental.
    const resultado = {
      simulaciones: cantidad,
      repeticiones: REPETICIONES,
      tiempoEstimacionMs: redondear(
        promedioTiempoEstimacion
      ),
      configuracionesValidas: redondear(
        promedioConfiguracionesValidas
      ),
      disparosNecesarios: promedioDisparos === null
        ? null
        : redondear(promedioDisparos),
      victorias,
      tiempoPartidaMs: redondear(
        promedioTiempoPartida
      )
    };

    // Agrega la fila a los resultados.
    resultados.push(resultado);

    // Guarda los avances después de cada escenario.
    guardarResultados(resultados);

    console.log(
      `  Escenario de ${cantidad} simulaciones terminado.`
    );
  }

  // Presenta la tabla experimental final.
  console.log("\n==========================================");
  console.log("       RESULTADOS EXPERIMENTALES");
  console.log("==========================================\n");

  console.table(
    resultados.map((resultado) => ({
      Simulaciones: resultado.simulaciones,
      "Tiempo estimación (ms)":
        resultado.tiempoEstimacionMs,
      "Configuraciones válidas":
        resultado.configuracionesValidas,
      "Disparos necesarios":
        resultado.disparosNecesarios ?? "Sin victoria",
      Victorias:
        `${resultado.victorias}/${resultado.repeticiones}`,
      "Tiempo partida (ms)":
        resultado.tiempoPartidaMs
    }))
  );

  console.log(
    "\nResultados guardados en src/datos/resultadosExperimentos.json"
  );

  return resultados;
}

// Ejecuta los experimentos.
ejecutarExperimentoCompleto();
