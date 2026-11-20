
/**
 * Clase: SeleccionObjetivo
 * Función: recomendar disparos usando búsqueda y persecución.
 * Entrada: probabilidades y disparos conocidos.
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
   * Función: crearClave
   * Entrada: fila y columna.
   * Salida: clave única de la celda.
   */
  crearClave(fila, columna) {
    return `${fila},${columna}`;
  }

  /**
   * Función: obtenerCeldasAtacadas
   * Entrada: resultados conocidos.
   * Salida: conjunto de celdas atacadas.
   */
  obtenerCeldasAtacadas(resultados = {}) {
    const atacadas = new Set();

    for (const celda of [
      ...(resultados.agua ?? []),
      ...(resultados.impactos ?? [])
    ]) {
      atacadas.add(this.crearClave(celda.fila, celda.columna));
    }

    for (const barco of resultados.hundidos ?? []) {
      for (const celda of barco.celdas) {
        atacadas.add(this.crearClave(celda.fila, celda.columna));
      }
    }

    return atacadas;
  }

  /**
   * Función: convertirCoordenada
   * Entrada: fila y columna.
   * Salida: coordenada como "E5".
   */
  convertirCoordenada(fila, columna) {
    return `${String.fromCharCode(65 + fila)}${columna + 1}`;
  }

  /**
   * Función: validarMapa
   * Entrada: matriz de probabilidades.
   * Salida: true o error de validación.
   */
  validarMapa(mapa) {
    if (
      !Array.isArray(mapa) ||
      mapa.length !== this.tamanoTablero ||
      mapa.some(fila =>
        !Array.isArray(fila) ||
        fila.length !== this.tamanoTablero ||
        fila.some(valor =>
          !Number.isFinite(valor) ||
          valor < 0 ||
          valor > 1
        )
      )
    ) {
      throw new Error("El mapa de probabilidades no es válido.");
    }

    return true;
  }

  /**
   * Función: celdaDisponible
   * Entrada: posición y conjunto de disparos.
   * Salida: true si puede atacarse.
   */
  celdaDisponible(fila, columna, atacadas) {
    return (
      Number.isInteger(fila) &&
      Number.isInteger(columna) &&
      fila >= 0 &&
      columna >= 0 &&
      fila < this.tamanoTablero &&
      columna < this.tamanoTablero &&
      !atacadas.has(this.crearClave(fila, columna))
    );
  }

  /**
   * Función: agruparImpactos
   * Entrada: impactos de barcos todavía no hundidos.
   * Salida: grupos de impactos conectados.
   */
  agruparImpactos(impactos = []) {
    const pendientes = new Map();

    for (const celda of impactos) {
      pendientes.set(
        this.crearClave(celda.fila, celda.columna),
        celda
      );
    }

    const grupos = [];

    while (pendientes.size > 0) {
      const inicial = pendientes.values().next().value;
      const grupo = [];
      const cola = [inicial];

      pendientes.delete(
        this.crearClave(inicial.fila, inicial.columna)
      );

      while (cola.length > 0) {
        const actual = cola.shift();
        grupo.push(actual);

        const vecinos = [
          [actual.fila - 1, actual.columna],
          [actual.fila + 1, actual.columna],
          [actual.fila, actual.columna - 1],
          [actual.fila, actual.columna + 1]
        ];

        for (const [fila, columna] of vecinos) {
          const clave = this.crearClave(fila, columna);

          if (pendientes.has(clave)) {
            cola.push(pendientes.get(clave));
            pendientes.delete(clave);
          }
        }
      }

      grupos.push(grupo);
    }

    return grupos;
  }

  /**
   * Función: obtenerCandidatosPersecucion
   * Entrada: impactos conocidos y celdas atacadas.
   * Salida: objetivos vecinos o alineados.
   */
  obtenerCandidatosPersecucion(resultados, atacadas) {
    const grupos = this.agruparImpactos(
      resultados.impactos ?? []
    );

    const candidatos = new Map();

    const agregar = (fila, columna) => {
      if (this.celdaDisponible(fila, columna, atacadas)) {
        const clave = this.crearClave(fila, columna);
        candidatos.set(clave, { fila, columna });
      }
    };

    for (const grupo of grupos) {
      const mismaFila = grupo.every(
        celda => celda.fila === grupo[0].fila
      );

      const mismaColumna = grupo.every(
        celda => celda.columna === grupo[0].columna
      );

      if (grupo.length >= 2 && mismaFila) {
        const fila = grupo[0].fila;
        const columnas = grupo.map(c => c.columna);

        agregar(fila, Math.min(...columnas) - 1);
        agregar(fila, Math.max(...columnas) + 1);

      } else if (grupo.length >= 2 && mismaColumna) {
        const columna = grupo[0].columna;
        const filas = grupo.map(c => c.fila);

        agregar(Math.min(...filas) - 1, columna);
        agregar(Math.max(...filas) + 1, columna);

      } else {
        for (const celda of grupo) {
          agregar(celda.fila - 1, celda.columna);
          agregar(celda.fila + 1, celda.columna);
          agregar(celda.fila, celda.columna - 1);
          agregar(celda.fila, celda.columna + 1);
        }
      }
    }

    return [...candidatos.values()];
  }

  /**
   * Función: elegirMayorProbabilidad
   * Entrada: candidatos y mapa probabilístico.
   * Salida: mejor candidato o null.
   */
  elegirMayorProbabilidad(candidatos, mapa) {
    let maxima = -1;
    let mejores = [];

    for (const celda of candidatos) {
      const probabilidad = mapa[celda.fila][celda.columna];

      if (probabilidad > maxima + 1e-12) {
        maxima = probabilidad;
        mejores = [celda];

      } else if (Math.abs(probabilidad - maxima) <= 1e-12) {
        mejores.push(celda);
      }
    }

    if (mejores.length === 0) {
      return null;
    }

    const indice = Math.floor(Math.random() * mejores.length);
    const elegida = mejores[indice];

    return {
      fila: elegida.fila,
      columna: elegida.columna,
      coordenada: this.convertirCoordenada(
        elegida.fila,
        elegida.columna
      ),
      probabilidad: maxima,
      porcentaje: Math.round(maxima * 10000) / 100
    };
  }

  /**
   * Función: seleccionar
   * Entrada: probabilidades, resultados y estimación.
   * Salida: objetivo de búsqueda o persecución.
   */
  seleccionar(mapa, resultados = {}, hayEstimacion = true) {
    if (!hayEstimacion) {
      return null;
    }

    this.validarMapa(mapa);

    const atacadas = this.obtenerCeldasAtacadas(resultados);

    // Perseguimos solamente impactos de barcos no hundidos.
    const candidatos = this.obtenerCandidatosPersecucion(
      resultados,
      atacadas
    );

    // Priorizamos candidatos compatibles con las muestras.
    const persecucion = candidatos.filter(
      celda => mapa[celda.fila][celda.columna] > 0
    );

    if (persecucion.length > 0) {
      return this.elegirMayorProbabilidad(persecucion, mapa);
    }

    // Sin persecución posible, usamos el mapa completo.
    const disponibles = [];

    for (let fila = 0; fila < this.tamanoTablero; fila++) {
      for (let columna = 0; columna < this.tamanoTablero; columna++) {
        if (this.celdaDisponible(fila, columna, atacadas)) {
          disponibles.push({ fila, columna });
        }
      }
    }

    return this.elegirMayorProbabilidad(disponibles, mapa);
  }
}
