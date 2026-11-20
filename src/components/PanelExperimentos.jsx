
import { useState } from "react";

import { PruebasAlgoritmo } from "../algoritmo/PruebasAlgoritmo.js";

// Resultados reales obtenidos desde la terminal.
import resultadosPartidas from "../datos/resultadosExperimentos.json";

import "../styles/panelExperimentos.css";

// Cantidades de simulaciones solicitadas en el proyecto.
const CANTIDADES_SIMULACIONES = [
  100,
  1000,
  5000,
  10000
];

/**
 * Función: formatearNumero
 *
 * Descripción:
 * Presenta un valor numérico en formato legible.
 * Cuando no existe un resultado, muestra un guion.
 *
 * Entradas:
 * @param {number|null} valor - Valor a mostrar.
 *
 * Retorno:
 * Número formateado o un guion.
 */
function formatearNumero(valor) {
  return Number.isFinite(valor)
    ? valor.toLocaleString("es-CR")
    : "—";
}

/**
 * Función: formatearTiempo
 *
 * Descripción:
 * Muestra una medición de tiempo con dos decimales.
 *
 * Entradas:
 * @param {number|null} tiempo - Tiempo en milisegundos.
 *
 * Retorno:
 * Tiempo formateado.
 */
function formatearTiempo(tiempo) {
  return Number.isFinite(tiempo)
    ? tiempo.toFixed(2)
    : "—";
}

/**
 * Función: PanelExperimentos
 *
 * Descripción:
 * Permite ejecutar análisis probabilísticos individuales
 * y presenta los resultados de partidas completas
 * obtenidos mediante SimuladorPartidas.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Panel con controles y tablas experimentales.
 */
function PanelExperimentos() {

  // Resultados de los análisis ejecutados desde el navegador.
  const [resultados, setResultados] = useState([]);

  // Cantidad de simulaciones que se está ejecutando.
  const [ejecutando, setEjecutando] = useState(null);

  // Mensaje de error, si corresponde.
  const [error, setError] = useState("");

  /**
   * Función: ejecutarExperimento
   *
   * Descripción:
   * Ejecuta una estimación probabilística individual.
   * Esta prueba no representa una partida completa.
   *
   * Entradas:
   * @param {number} cantidad - Número de simulaciones.
   *
   * Retorno:
   * No retorna valores.
   */
  function ejecutarExperimento(cantidad) {

    // Impide iniciar otra prueba mientras una está activa.
    if (ejecutando !== null) {
      return;
    }

    setEjecutando(cantidad);
    setError("");

    // Permite que se actualice el botón antes del cálculo.
    setTimeout(() => {

      try {

        // Crea una instancia independiente de las pruebas.
        const pruebas = new PruebasAlgoritmo(10);

        // Escenario inicial sin disparos conocidos.
        const conocimiento = {
          agua: [],
          impactos: [],
          hundidos: []
        };

        // Ejecuta el análisis probabilístico.
        const resultado = pruebas.ejecutarPrueba(
          cantidad,
          conocimiento
        );

        // Actualiza la fila de esa cantidad de simulaciones.
        setResultados((anteriores) => {

          const actualizados = anteriores.filter(
            (registro) =>
              registro.simulaciones !== cantidad
          );

          return [...actualizados, resultado].sort(
            (a, b) => a.simulaciones - b.simulaciones
          );
        });

      } catch (errorCapturado) {

        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : String(errorCapturado)
        );

      } finally {

        setEjecutando(null);
      }

    }, 50);
  }

  return (
    <section className="panel-experimentos">

      <h2>Experimentos del algoritmo probabilístico</h2>

      <p>
        Comparación del comportamiento del algoritmo
        con diferentes cantidades de simulaciones.
      </p>

      {/* PRIMER EXPERIMENTO: ANÁLISIS INDIVIDUAL */}
      <h3>Análisis probabilístico individual</h3>

      <p>
        Estas pruebas calculan probabilidades utilizando
        un escenario inicial sin disparos conocidos.
      </p>

      {/* Botones para ejecutar los análisis. */}
      <div className="panel-experimentos__controles">

        {CANTIDADES_SIMULACIONES.map((cantidad) => (

          <button
            key={cantidad}
            type="button"
            disabled={ejecutando !== null}
            onClick={() => ejecutarExperimento(cantidad)}
          >
            {ejecutando === cantidad
              ? "Calculando..."
              : `${formatearNumero(cantidad)} simulaciones`}
          </button>

        ))}

      </div>

      {/* Muestra los errores del cálculo. */}
      {error && (
        <p role="alert">
          Error al ejecutar el experimento: {error}
        </p>
      )}

      {/* Tabla de análisis individuales. */}
      {resultados.length > 0 && (

        <div className="panel-experimentos__tabla-contenedor">

          <table className="panel-experimentos__tabla">

            <thead>
              <tr>
                <th scope="col">Simulaciones</th>
                <th scope="col">Generadas</th>
                <th scope="col">Válidas</th>
                <th scope="col">Descartadas</th>
                <th scope="col">Tiempo (ms)</th>
                <th scope="col">Objetivo</th>
                <th scope="col">Probabilidad</th>
              </tr>
            </thead>

            <tbody>

              {resultados.map((resultado) => (

                <tr key={resultado.simulaciones}>

                  <td>
                    {formatearNumero(resultado.simulaciones)}
                  </td>

                  <td>
                    {formatearNumero(resultado.generadas)}
                  </td>

                  <td>
                    {formatearNumero(resultado.validas)}
                  </td>

                  <td>
                    {formatearNumero(resultado.descartadas)}
                  </td>

                  <td>
                    {formatearTiempo(resultado.tiempoMs)}
                  </td>

                  <td>
                    {resultado.objetivo ?? "—"}
                  </td>

                  <td>
                    {Number.isFinite(resultado.probabilidad)
                      ? `${resultado.probabilidad.toFixed(2)} %`
                      : "Sin estimación"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* SEGUNDO EXPERIMENTO: PARTIDAS COMPLETAS */}
      <h3>Comparación de partidas completas</h3>

      <p>
        Resultados reales obtenidos mediante
        SimuladorPartidas, ejecutado desde Node.js.
      </p>

      <div className="panel-experimentos__tabla-contenedor">

        <table className="panel-experimentos__tabla">

          <thead>
            <tr>
              <th scope="col">Simulaciones</th>
              <th scope="col">
                Tiempo de estimación (ms)
              </th>
              <th scope="col">
                Configuraciones válidas
              </th>
              <th scope="col">
                Disparos para ganar
              </th>
              <th scope="col">Victorias</th>
              <th scope="col">
                Tiempo total de partida (ms)
              </th>
            </tr>
          </thead>

          <tbody>

            {resultadosPartidas.map((resultado) => (

              <tr key={resultado.simulaciones}>

                <td>
                  {formatearNumero(resultado.simulaciones)}
                </td>

                <td>
                  {formatearTiempo(
                    resultado.tiempoEstimacionMs
                  )}
                </td>

                <td>
                  {formatearNumero(
                    resultado.configuracionesValidas
                  )}
                </td>

                <td>
                  {formatearNumero(
                    resultado.disparosNecesarios
                  )}
                </td>

                <td>
                  {resultado.victorias}/
                  {resultado.repeticiones}
                </td>

                <td>
                  {formatearTiempo(
                    resultado.tiempoPartidaMs
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <p>
        Cada resultado corresponde a{" "}
        {resultadosPartidas[0]?.repeticiones ?? 0}{" "}
        partida(s) por cantidad de simulaciones.
        Las flotas se generan aleatoriamente,
        por lo que estos resultados no demuestran
        por sí solos que una cantidad de simulaciones
        sea superior a otra.
      </p>

    </section>
  );
}

export default PanelExperimentos;
