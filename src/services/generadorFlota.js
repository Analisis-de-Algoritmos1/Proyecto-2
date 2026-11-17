
/**
 * Función: crearPosiciones
 *
 * Descripción:
 * Calcula las celdas que ocupa un barco según su
 * posición inicial, tamaño y orientación.
 *
 * Entradas:
 * @param {number} filaInicial - Fila donde inicia el barco.
 * @param {number} columnaInicial - Columna donde inicia el barco.
 * @param {number} tamano - Cantidad de celdas del barco.
 * @param {string} orientacion - "horizontal" o "vertical".
 *
 * Retorno:
 * @returns {Array} Lista de posiciones del barco.
 */
function crearPosiciones(filaInicial, columnaInicial, tamano, orientacion) {
  const posiciones = [];

  for (let indice = 0; indice < tamano; indice++) {
    const fila = filaInicial + (orientacion === "vertical" ? indice : 0);
    const columna = columnaInicial + (orientacion === "horizontal" ? indice : 0);

    posiciones.push({ fila, columna });
  }

  return posiciones;
}

/**
 * Función: ubicacionDisponible
 *
 * Descripción:
 * Verifica que las posiciones de un barco estén dentro
 * del tablero y no se superpongan con otros barcos.
 *
 * Entradas:
 * @param {Array} posiciones - Celdas que ocuparía el barco.
 * @param {Set} ocupadas - Conjunto de celdas ya ocupadas.
 * @param {number} tamanoTablero - Dimensión del tablero.
 *
 * Retorno:
 * @returns {boolean} true si la ubicación es válida.
 */
function ubicacionDisponible(posiciones, ocupadas, tamanoTablero) {
  return posiciones.every(({ fila, columna }) => {
    const dentroTablero =
      fila >= 0 &&
      fila < tamanoTablero &&
      columna >= 0 &&
      columna < tamanoTablero;

    const estaOcupada = ocupadas.has(`${fila},${columna}`);

    return dentroTablero && !estaOcupada;
  });
}

/**
 * Función: generarOpciones
 *
 * Descripción:
 * Obtiene todas las ubicaciones horizontales y verticales
 * donde un barco puede caber dentro del tablero.
 *
 * Entradas:
 * @param {Object} barco - Barco que se desea colocar.
 * @param {number} tamanoTablero - Dimensión del tablero.
 *
 * Retorno:
 * @returns {Array} Ubicaciones posibles del barco.
 */
function generarOpciones(barco, tamanoTablero) {
  const opciones = [];

  for (const orientacion of ["horizontal", "vertical"]) {
    for (let fila = 0; fila < tamanoTablero; fila++) {
      for (let columna = 0; columna < tamanoTablero; columna++) {
        const posiciones = crearPosiciones(
          fila,
          columna,
          barco.tamano,
          orientacion
        );

        const cabeTablero = posiciones.every(
          (posicion) =>
            posicion.fila < tamanoTablero &&
            posicion.columna < tamanoTablero
        );

        if (cabeTablero) {
          opciones.push({
            filaInicial: fila,
            columnaInicial: columna,
            orientacion,
            posiciones,
          });
        }
      }
    }
  }

  return opciones;
}

/**
 * Función: mezclarOpciones
 *
 * Descripción:
 * Mezcla aleatoriamente las posibles ubicaciones
 * para evitar utilizar siempre el mismo orden.
 *
 * Entradas:
 * @param {Array} opciones - Ubicaciones disponibles.
 *
 * Retorno:
 * @returns {Array} Copia de las opciones mezcladas.
 */
function mezclarOpciones(opciones) {
  const opcionesMezcladas = [...opciones];

  for (let indice = opcionesMezcladas.length - 1; indice > 0; indice--) {
    const aleatorio = Math.floor(Math.random() * (indice + 1));

    [opcionesMezcladas[indice], opcionesMezcladas[aleatorio]] = [
      opcionesMezcladas[aleatorio],
      opcionesMezcladas[indice],
    ];
  }

  return opcionesMezcladas;
}

/**
 * Función: colocarBarcos
 *
 * Descripción:
 * Coloca los barcos en posiciones aleatorias válidas.
 * Si una ubicación impide completar la flota, retrocede
 * y prueba otra alternativa.
 *
 * Entradas:
 * @param {Array} barcos - Barcos que deben colocarse.
 * @param {number} indice - Índice del barco actual.
 * @param {Set} ocupadas - Celdas ocupadas.
 * @param {Array} colocados - Barcos ya ubicados.
 * @param {number} tamanoTablero - Dimensión del tablero.
 *
 * Retorno:
 * @returns {boolean} true si logra colocar toda la flota.
 */
function colocarBarcos(barcos, indice, ocupadas, colocados, tamanoTablero) {
  if (indice === barcos.length) {
    return true;
  }

  const barco = barcos[indice];
  const opciones = mezclarOpciones(
    generarOpciones(barco, tamanoTablero)
  );

  for (const opcion of opciones) {
    if (!ubicacionDisponible(opcion.posiciones, ocupadas, tamanoTablero)) {
      continue;
    }

    // Reservar las posiciones del barco.
    for (const posicion of opcion.posiciones) {
      ocupadas.add(`${posicion.fila},${posicion.columna}`);
    }

    colocados.push({
      ...barco,
      filaInicial: opcion.filaInicial,
      columnaInicial: opcion.columnaInicial,
      orientacion: opcion.orientacion,
      posiciones: opcion.posiciones,
    });

    // Intentar colocar el siguiente barco.
    if (colocarBarcos(barcos, indice + 1, ocupadas, colocados, tamanoTablero)) {
      return true;
    }

    // Liberar las posiciones si debemos buscar otra alternativa.
    colocados.pop();

    for (const posicion of opcion.posiciones) {
      ocupadas.delete(`${posicion.fila},${posicion.columna}`);
    }
  }

  return false;
}

/**
 * Función: generarFlotaAleatoria
 *
 * Descripción:
 * Genera una flota completa con posiciones aleatorias,
 * respetando los tamaños y evitando superposiciones.
 *
 * Entradas:
 * @param {Array} barcos - Configuración de los barcos.
 * @param {number} tamanoTablero - Dimensión del tablero.
 *
 * Retorno:
 * @returns {Array} Flota con las posiciones de cada barco.
 */
export function generarFlotaAleatoria(barcos, tamanoTablero) {
  if (!Number.isInteger(tamanoTablero) || tamanoTablero <= 0) {
    throw new Error("El tamaño del tablero debe ser un entero positivo.");
  }

  if (!Array.isArray(barcos) || barcos.length === 0) {
    throw new Error("Debe proporcionarse una lista de barcos.");
  }

  for (const barco of barcos) {
    if (!Number.isInteger(barco.tamano) ||
        barco.tamano <= 0 ||
        barco.tamano > tamanoTablero) {
      throw new Error("La configuración contiene un tamaño de barco inválido.");
    }
  }

  const ocupadas = new Set();
  const colocados = [];

  const completada = colocarBarcos(
    barcos,
    0,
    ocupadas,
    colocados,
    tamanoTablero
  );

  if (!completada) {
    throw new Error("No fue posible colocar toda la flota.");
  }

  return colocados;
}
