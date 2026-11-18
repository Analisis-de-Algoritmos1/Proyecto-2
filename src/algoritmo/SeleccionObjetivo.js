
/**
 * Clase: SeleccionObjetivo
 * Función: recomendar la celda con mayor probabilidad.
 * Entrada: mapa probabilístico y disparos anteriores.
 * Salida: objetivo recomendado o null.
 */
export class SeleccionObjetivo {

  /**
   * Función: constructor
   * Entrada: tamaño del tablero.
   * Salida: selector inicializado.
   */
  constructor(tamanoTablero = 10) {
    this.tamanoTablero = tamanoTablero;
  }

  /**
   * Función: obtenerCeldasAtacadas
   * Entrada: agua, impactos y barcos hundidos.
   * Salida: Set con las posiciones atacadas.
   */
  obtenerCeldasAtacadas(resultados = {}) {
    const atacadas = new Set();

    for (const celda of resultados.agua ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    for (const celda of resultados.impactos ?? []) {
      atacadas.add(`${celda.fila},${celda.columna}`);
    }

    for (const barco of resultados.hundidos ?? []) {
      for (const celda of barco.celdas) {
        atacadas.add(`${celda.fila},${celda.columna}`);
      }
    }

    return atacadas;
  }

  /**
   * Función: convertirCoordenada
   * Entrada: fila y columna numéricas.
   * Salida: coordenada como "E5".
   */
  convertirCoordenada(fila, columna) {
    const letra = String.fromCharCode(65 + fila);
    return `${letra}${columna + 1}`;
  }

  /**
   * Función: seleccionar
   * Entrada: mapa, resultados y estado de estimación.
   * Salida: mejor objetivo o null.
   */
  seleccionar(
    mapaProbabilidades,
    resultados = {},
    hayEstimacion = true
  ) {

    // Sin muestras válidas no recomendamos disparos.
    if (!hayEstimacion) {
      return null;
    }

    // Verificamos las dimensiones del mapa.
    if (
      !Array.isArray(mapaProbabilidades) ||
      mapaProbabilidades.length !== this.tamanoTablero
    ) {
      throw new Error("El mapa de probabilidades no es válido.");
    }

    // Comprobamos los valores de cada celda.
    for (const fila of mapaProbabilidades) {
      if (
        !Array.isArray(fila) ||
        fila.length !== this.tamanoTablero ||
        fila.some(
          valor =>
            typeof valor !== "number" ||
            !Number.isFinite(valor) ||
            valor < 0 ||
            valor > 1
        )
      ) {
        throw new Error(
          "El mapa contiene dimensiones o valores incorrectos."
        );
      }
    }

    const atacadas = this.obtenerCeldasAtacadas(resultados);

    let mayorProbabilidad = -1;
    let mejoresCeldas = [];

    // Buscamos la probabilidad máxima del tablero.
    for (let fila = 0; fila < this.tamanoTablero; fila++) {
      for (let columna = 0; columna < this.tamanoTablero; columna++) {

        const clave = `${fila},${columna}`;

        // Ignoramos las posiciones ya atacadas.
        if (atacadas.has(clave)) {
          continue;
        }

        const probabilidad =
          mapaProbabilidades[fila][columna];

        const tolerancia = 1e-12;

        if (probabilidad > mayorProbabilidad + tolerancia) {

          mayorProbabilidad = probabilidad;
          mejoresCeldas = [{ fila, columna }];

        } else if (
          Math.abs(probabilidad - mayorProbabilidad) <= tolerancia
        ) {
          // Guardamos las celdas empatadas.
          mejoresCeldas.push({ fila, columna });
        }
      }
    }

    if (mejoresCeldas.length === 0) {
      return null;
    }

    // Desempate aleatorio entre las mejores celdas.
    const indiceAleatorio = Math.floor(
      Math.random() * mejoresCeldas.length
    );

    const mejorCelda = mejoresCeldas[indiceAleatorio];

    const coordenada = this.convertirCoordenada(
      mejorCelda.fila,
      mejorCelda.columna
    );

    const porcentaje =
      Math.round(mayorProbabilidad * 10000) / 100;

    return {
      fila: mejorCelda.fila,
      columna: mejorCelda.columna,
      coordenada,
      probabilidad: mayorProbabilidad,
      porcentaje
    };
  }
}
