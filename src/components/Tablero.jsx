
import Celda from "./Celda";
import "../styles/tablero.css";

// Dimensiones del tablero de Batalla Naval.
const TOTAL_FILAS = 10;
const TOTAL_COLUMNAS = 10;

// Genera las letras de las columnas (A - J).
const LETRAS_COLUMNAS = Array.from(
  { length: TOTAL_COLUMNAS },
  (_, indice) => String.fromCharCode(65 + indice)
);

// Define los colores utilizados por el mapa probabilístico.
const ESCALA_COLORES = [
  { porcentaje: 0, color: [22, 138, 57] },
  { porcentaje: 25, color: [156, 195, 36] },
  { porcentaje: 50, color: [255, 208, 0] },
  { porcentaje: 75, color: [245, 130, 32] },
  { porcentaje: 100, color: [217, 35, 35] }
];

/**
 * Función: obtenerColorProbabilidad
 *
 * Descripción:
 * Convierte una intensidad entre 0 y 100 en un color.
 * Utiliza una transición gradual entre verde,
 * amarillo dorado, naranja y rojo.
 *
 * Entradas:
 * @param {number} intensidad - Intensidad del color.
 *
 * Retorno:
 * Color calculado en formato RGB.
 */
function obtenerColorProbabilidad(intensidad) {

  // Limita la intensidad al intervalo permitido.
  const valor = Math.max(0, Math.min(100, intensidad));

  // Identifica el tramo de la escala.
  const indice = Math.min(
    Math.floor(valor / 25),
    ESCALA_COLORES.length - 2
  );

  // Obtiene los colores del tramo.
  const inferior = ESCALA_COLORES[indice];
  const superior = ESCALA_COLORES[indice + 1];

  // Calcula la proporción entre los colores.
  const proporcion =
    (valor - inferior.porcentaje) /
    (superior.porcentaje - inferior.porcentaje);

  // Interpola los componentes rojo, verde y azul.
  const canales = inferior.color.map((canal, posicion) =>
    Math.round(
      canal +
      (superior.color[posicion] - canal) * proporcion
    )
  );

  // Construye el color final.
  return `rgb(${canales.join(", ")})`;
}

/**
 * Función: obtenerProbabilidadMaxima
 *
 * Descripción:
 * Identifica la probabilidad más alta entre
 * las celdas disponibles del tablero.
 *
 * Entradas:
 * @param {Array} celdas - Matriz del tablero.
 * @param {Array} probabilidades - Matriz de porcentajes.
 *
 * Retorno:
 * Mayor probabilidad disponible.
 */
function obtenerProbabilidadMaxima(celdas, probabilidades) {

  let maxima = 0;

  // Recorre las filas del tablero.
  for (let fila = 0; fila < TOTAL_FILAS; fila++) {

    // Recorre las columnas del tablero.
    for (
      let columna = 0;
      columna < TOTAL_COLUMNAS;
      columna++
    ) {

      // Obtiene la celda y su probabilidad.
      const celda = celdas[fila]?.[columna];
      const porcentaje = probabilidades?.[fila]?.[columna];

      // Considera solamente las posiciones no atacadas.
      if (
        celda?.estado === "sin-disparo" &&
        Number.isFinite(porcentaje)
      ) {
        maxima = Math.max(maxima, porcentaje);
      }
    }
  }

  return maxima;
}

/**
 * Función: Tablero
 *
 * Descripción:
 * Construye un tablero de 10x10 y permite mostrar
 * las probabilidades del algoritmo sobre las celdas
 * disponibles, junto con las métricas del análisis.
 *
 * Entradas:
 * @param {Object} propiedades - Configuración del tablero.
 * @param {Array} propiedades.celdas - Matriz de celdas.
 * @param {string} propiedades.titulo - Título del tablero.
 * @param {boolean} propiedades.mostrarBarcos - Muestra los barcos.
 * @param {Function} propiedades.alSeleccionar - Procesa los clics.
 * @param {boolean} propiedades.deshabilitado - Bloquea el tablero.
 * @param {Array} propiedades.probabilidades - Porcentajes estimados.
 * @param {Object} propiedades.recomendacion - Objetivo recomendado.
 * @param {Object} propiedades.analisis - Métricas probabilísticas.
 *
 * Retorno:
 * Componente visual del tablero de Batalla Naval.
 */
function Tablero({
  celdas = [],
  titulo = "Tablero",
  mostrarBarcos = false,
  alSeleccionar,
  deshabilitado = false,
  probabilidades = null,
  recomendacion = null,
  analisis = null
}) {

  // Comprueba si hay probabilidades disponibles.
  const mostrarProbabilidades = Array.isArray(probabilidades);

  // Busca el porcentaje más alto entre las celdas disponibles.
  const probabilidadMaxima = mostrarProbabilidades
    ? obtenerProbabilidadMaxima(celdas, probabilidades)
    : 0;

  // Obtiene la probabilidad real de la celda recomendada.
  const probabilidadRecomendada = recomendacion
    ? probabilidades?.[recomendacion.fila]?.[recomendacion.columna]
    : null;

  // Construye la coordenada recomendada.
  const coordenadaRecomendada = recomendacion
    ? `${LETRAS_COLUMNAS[recomendacion.columna]}${recomendacion.fila + 1}`
    : null;

  return (
    <section
      className="tablero-contenedor"
      aria-label={titulo}
    >

      <h2>{titulo}</h2>

      <table className="tablero">

        <thead>
          <tr>
            <th scope="col"></th>

            {/* Muestra las letras de las columnas. */}
            {LETRAS_COLUMNAS.map((letra) => (
              <th key={letra} scope="col">
                {letra}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {/* Construye las filas del tablero. */}
          {Array.from(
            { length: TOTAL_FILAS },
            (_, fila) => (
              <tr key={fila}>

                <th scope="row">{fila + 1}</th>

                {/* Construye las celdas de cada fila. */}
                {Array.from(
                  { length: TOTAL_COLUMNAS },
                  (_, columna) => {

                    // Obtiene los datos de la celda.
                    const datosCelda =
                      celdas[fila]?.[columna] ?? {};

                    // Obtiene el estado actual de la celda.
                    const estado =
                      datosCelda.estado ?? "sin-disparo";

                    // Consulta la probabilidad de la posición.
                    const valor =
                      probabilidades?.[fila]?.[columna];

                    // Muestra el porcentaje solo si no fue atacada.
                    const probabilidad =
                      estado === "sin-disparo" &&
                      Number.isFinite(valor)
                        ? valor
                        : null;

                    // Calcula la intensidad relativa del color.
                    const intensidad =
                      probabilidad !== null &&
                      probabilidadMaxima > 0
                        ? Math.min(
                            100,
                            Math.max(
                              0,
                              (
                                probabilidad /
                                probabilidadMaxima
                              ) * 100
                            )
                          )
                        : 0;

                    // Asigna el color según la intensidad.
                    const colorProbabilidad =
                      probabilidad !== null
                        ? obtenerColorProbabilidad(intensidad)
                        : null;

                    // Usa texto oscuro cuando el fondo es claro.
                    const colorTexto =
                      intensidad >= 25 && intensidad <= 80
                        ? "#17212b"
                        : "#ffffff";

                    // Identifica el objetivo recomendado.
                    const esRecomendada =
                      probabilidad !== null &&
                      recomendacion?.fila === fila &&
                      recomendacion?.columna === columna;

                    return (
                      <td key={columna}>
                        <Celda
                          fila={fila}
                          columna={columna}
                          estado={estado}
                          tieneBarco={
                            datosCelda.tieneBarco ?? false
                          }
                          mostrarBarco={mostrarBarcos}
                          alSeleccionar={alSeleccionar}
                          deshabilitada={deshabilitado}
                          probabilidad={probabilidad}
                          colorProbabilidad={colorProbabilidad}
                          colorTexto={colorTexto}
                          esRecomendada={esRecomendada}
                        />
                      </td>
                    );
                  }
                )}

              </tr>
            )
          )}

        </tbody>
      </table>

      {/* Muestra la ayuda únicamente si existen probabilidades. */}
      {mostrarProbabilidades && (

        <div className="tablero-ayuda-probabilistica">

          <p>
            Probabilidades estimadas para tus próximos disparos.
          </p>

          {/* Escala visual de probabilidad relativa. */}
          <div className="tablero-escala-probabilidades"></div>

          <p>
            Verde: menor probabilidad · Rojo: mayor probabilidad
          </p>

          {/* Muestra las métricas del último análisis. */}
          {analisis && (

            <div className="tablero-detalles-probabilisticos">

              {/* Muestra el objetivo recomendado. */}
              {recomendacion && (

                <>
                  <p>
                    Posición recomendada:{" "}
                    <strong>
                      {coordenadaRecomendada}
                    </strong>
                  </p>

                  <p>
                    Probabilidad estimada:{" "}
                    <strong>
                      {Number.isFinite(probabilidadRecomendada)
                        ? `${probabilidadRecomendada.toFixed(2)} %`
                        : "Sin estimación"}
                    </strong>
                  </p>
                </>

              )}

              {/* Muestra las simulaciones ejecutadas. */}
              <p>
                Simulaciones realizadas:{" "}
                <strong>
                  {Number.isFinite(analisis.simulacionesRealizadas)
                    ? analisis.simulacionesRealizadas.toLocaleString("es-CR")
                    : "No disponible"}
                </strong>
              </p>

              {/* Muestra las configuraciones válidas. */}
              <p>
                Configuraciones válidas:{" "}
                <strong>
                  {Number.isFinite(analisis.configuracionesValidas)
                    ? analisis.configuracionesValidas.toLocaleString("es-CR")
                    : "No disponible"}
                </strong>
              </p>

              {/* Muestra el tiempo de cálculo del algoritmo. */}
              <p>
                Tiempo de análisis:{" "}
                <strong>
                  {Number.isFinite(analisis.tiempoMs)
                    ? `${analisis.tiempoMs.toFixed(2)} ms`
                    : "No disponible"}
                </strong>
              </p>

            </div>

          )}

        </div>

      )}

    </section>
  );
}

export default Tablero;
