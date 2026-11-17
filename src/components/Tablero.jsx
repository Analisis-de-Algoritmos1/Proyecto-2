

import Celda from "./Celda";

// Dimensiones del tablero de Batalla Naval.
const TOTAL_FILAS = 10;
const TOTAL_COLUMNAS = 10;

// Genera las letras que identifican las columnas (A - J).
const LETRAS_COLUMNAS = Array.from(
  { length: TOTAL_COLUMNAS },
  (_, indice) => String.fromCharCode(65 + indice)
);

/**
 * Función: Tablero
 *
 * Descripción:
 * Construye un tablero de Batalla Naval de 10x10,
 * organizando las celdas y mostrando sus coordenadas
 * y estados correspondientes.
 *
 * Entradas:
 * @param {Object} propiedades - Configuración del tablero.
 * @param {Array} propiedades.celdas - Matriz con los datos de cada celda.
 * @param {string} propiedades.titulo - Nombre del tablero.
 * @param {boolean} propiedades.mostrarBarcos - Permite visualizar los barcos.
 * @param {Function} propiedades.alSeleccionar - Recibe la posición seleccionada.
 * @param {boolean} propiedades.deshabilitado - Bloquea las interacciones.
 *
 * Retorno:
 * @returns {JSX.Element} Tablero de 10 filas y 10 columnas
 *                        construido con componentes Celda.
 */
function Tablero({
  celdas = [],
  titulo = "Tablero",
  mostrarBarcos = false,
  alSeleccionar,
  deshabilitado = false,
}) {
  return (
    <section className="tablero-contenedor" aria-label={titulo}>
      <h2>{titulo}</h2>

      <table className="tablero">
        {/* Encabezado con las letras de las columnas */}
        <thead>
          <tr>
            <th scope="col"></th>

            {LETRAS_COLUMNAS.map((letra) => (
              <th key={letra} scope="col">
                {letra}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Genera las 10 filas del tablero */}
          {Array.from({ length: TOTAL_FILAS }, (_, fila) => (
            <tr key={fila}>
              {/* Número que identifica cada fila */}
              <th scope="row">{fila + 1}</th>

              {/* Genera las 10 celdas de cada fila */}
              {Array.from(
                { length: TOTAL_COLUMNAS },
                (_, columna) => {
                  // Obtiene los datos de la posición actual.
                  const datosCelda =
                    celdas[fila]?.[columna] ?? {};

                  return (
                    <td key={columna}>
                      <Celda
                        fila={fila}
                        columna={columna}
                        estado={datosCelda.estado ?? "sin-disparo"}
                        tieneBarco={datosCelda.tieneBarco ?? false}
                        mostrarBarco={mostrarBarcos}
                        alSeleccionar={alSeleccionar}
                        deshabilitada={deshabilitado}
                      />
                    </td>
                  );
                }
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Tablero;
