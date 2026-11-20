
import { MotorProbabilistico } from "./MotorProbabilistico.js";
import { ConfiguracionSimulaciones } from "./ConfiguracionSimulaciones.js";

/**
 * Clase: AgenteAutomatico
 *
 * Descripción:
 * Controla las decisiones del agente computacional
 * durante una partida de Batalla Naval.
 *
 * Utiliza el motor probabilístico para seleccionar
 * objetivos y registra los resultados obtenidos.
 *
 * Entrada:
 * - Tamaño del tablero.
 * - Cantidad de simulaciones.
 * - Resultados de disparos anteriores.
 *
 * Salida:
 * - Objetivos recomendados.
 * - Historial de disparos.
 * - Estado del conocimiento del agente.
 * - Información del análisis probabilístico.
*/
export class AgenteAutomatico {

  /**
   * Función: constructor
   *
   * Descripción:
   * Inicializa el agente y sus componentes.
   *
   * Entrada:
   * - tamanoTablero: tamaño del tablero.
   * - cantidadSimulaciones: configuración inicial.
   *
   * Salida:
   * - Instancia del agente preparada para jugar.
   */
  constructor(tamanoTablero = 10, cantidadSimulaciones = 1000) {

    this.tamanoTablero = tamanoTablero;

    // Motor encargado de las probabilidades.
    this.motor = new MotorProbabilistico(tamanoTablero);

    // Configuración de simulaciones.
    this.configuracion = new ConfiguracionSimulaciones(
      cantidadSimulaciones
    );

    // Información conocida mediante disparos.
    this.resultados = {
      agua: [],
      impactos: [],
      hundidos: []
    };

    // Historial de decisiones y resultados.
    this.historial = [];

    // Último análisis probabilístico.
    this.ultimoAnalisis = null;

    // Disparo pendiente de recibir resultado.
    this.disparoPendiente = null;
  }

  /**
   * Función: validarCelda
   *
   * Descripción:
   * Comprueba que una celda exista en el tablero.
   *
   * Entrada:
   * - celda: objeto con fila y columna.
   *
   * Salida:
   * - true si está dentro del tablero.
   * - false en caso contrario.
   */
  validarCelda(celda) {

    return (
      celda !== null &&
      typeof celda === "object" &&
      Number.isInteger(celda.fila) &&
      Number.isInteger(celda.columna) &&
      celda.fila >= 0 &&
      celda.columna >= 0 &&
      celda.fila < this.tamanoTablero &&
      celda.columna < this.tamanoTablero
    );
  }

  /**
   * Función: crearClave
   *
   * Descripción:
   * Convierte una celda en una clave de texto.
   *
   * Entrada:
   * - celda: objeto con fila y columna.
   *
   * Salida:
   * - Texto con formato "fila,columna".
   */
  crearClave(celda) {
    return `${celda.fila},${celda.columna}`;
  }

  /**
   * Función: obtenerConocimiento
   *
   * Descripción:
   * Devuelve una copia de los resultados conocidos
   * sin permitir modificaciones directas.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Objeto con agua, impactos y hundidos.
   */
  obtenerConocimiento() {

    return {
      agua: this.resultados.agua.map(c => ({ ...c })),

      impactos: this.resultados.impactos.map(c => ({ ...c })),

      hundidos: this.resultados.hundidos.map(barco => ({
        nombre: barco.nombre,
        celdas: barco.celdas.map(c => ({ ...c }))
      }))
    };
  }

  /**
   * Función: celdaAtacada
   *
   * Descripción:
   * Determina si una celda recibió un disparo.
   *
   * Entrada:
   * - celda: posición a consultar.
   *
   * Salida:
   * - true si ya fue atacada.
   * - false si todavía está disponible.
   */
  celdaAtacada(celda) {

    const clave = this.crearClave(celda);

    return this.historial.some(disparo =>
      this.crearClave(disparo) === clave
    );
  }

  /**
   * Función: analizarTablero
   *
   * Descripción:
   * Ejecuta el motor utilizando únicamente
   * la información conocida por el agente.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Objeto con probabilidades y recomendación.
   */
  analizarTablero() {

    const cantidad = this.configuracion.obtenerCantidad();

    this.ultimoAnalisis = this.motor.analizar(
      this.obtenerConocimiento(),
      cantidad
    );

    return this.ultimoAnalisis;
  }

  /**
   * Función: seleccionarDisparo
   *
   * Descripción:
   * Selecciona el próximo objetivo recomendado
   * utilizando el análisis probabilístico.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Objeto con la posición y probabilidad.
   * - null si no existe una recomendación.
   */
  seleccionarDisparo() {

    // No seleccionamos otro objetivo si existe
    // uno pendiente de recibir resultado.
    if (this.disparoPendiente !== null) {
      return { ...this.disparoPendiente };
    }

    const analisis = this.analizarTablero();

    if (analisis.recomendacion === null) {
      return null;
    }

    const objetivo = { ...analisis.recomendacion };

    // evitar disparos repetidos.
    if (this.celdaAtacada(objetivo)) {
      throw new Error(
        "El motor recomendó una celda previamente atacada."
      );
    }

    this.disparoPendiente = objetivo;

    return { ...objetivo };
  }

  /**
   * Función: registrarResultado
   *
   * Descripción:
   * Registra el resultado del disparo seleccionado.
   *
   * Entrada:
   * - resultado: objeto con:
   *   tipo: "agua", "impacto" o "hundido".
   *
   * Para "hundido" también recibe:
   * - nombre: identidad del barco hundido.
   * - celdas: todas las posiciones de ese barco.
   *
   * Salida:
   * - Registro del disparo realizado.
   */
  registrarResultado(resultado) {

    if (this.disparoPendiente === null) {
      throw new Error("No existe un disparo pendiente.");
    }

    const tiposValidos = ["agua", "impacto", "hundido"];

    if (
      !resultado ||
      !tiposValidos.includes(resultado.tipo)
    ) {
      throw new Error("Resultado de disparo inválido.");
    }

    const celda = {
      fila: this.disparoPendiente.fila,
      columna: this.disparoPendiente.columna
    };

    // Comprobamos que no estemos repitiendo un disparo.
    if (this.celdaAtacada(celda)) {
      throw new Error("La celda ya fue atacada.");
    }

    // Preparamos el barco hundido, cuando corresponde.
    let barcoHundido = null;

    if (resultado.tipo === "hundido") {

      const nombresValidos = [
        "Portaaviones",
        "Acorazado",
        "Crucero",
        "Submarino",
        "Destructor"
      ];

      const longitudes = {
        Portaaviones: 5,
        Acorazado: 4,
        Crucero: 3,
        Submarino: 3,
        Destructor: 2
      };

      if (
        !nombresValidos.includes(resultado.nombre) ||
        !Array.isArray(resultado.celdas) ||
        resultado.celdas.length !== longitudes[resultado.nombre] ||
        !resultado.celdas.every(c => this.validarCelda(c))
      ) {
        throw new Error(
          "Información del barco hundido incompleta o inválida."
        );
      }

      const claves = resultado.celdas.map(c => this.crearClave(c));

      // Todas las posiciones deben ser diferentes.
      if (new Set(claves).size !== claves.length) {
        throw new Error("El barco contiene celdas repetidas.");
      }

      // El último disparo debe pertenecer al barco hundido.
      if (!claves.includes(this.crearClave(celda))) {
        throw new Error(
          "El disparo pendiente no pertenece al barco hundido."
        );
      }

      // No se puede hundir dos veces el mismo barco.
      if (this.resultados.hundidos.some(
        barco => barco.nombre === resultado.nombre
      )) {
        throw new Error("Ese barco ya fue registrado como hundido.");
      }

      // Todas las celdas anteriores del barco
      // debieron haber sido impactos conocidos.
      const impactosAnteriores = new Set(
        this.resultados.impactos.map(c => this.crearClave(c))
      );

      for (const clave of claves) {
        if (
          clave !== this.crearClave(celda) &&
          !impactosAnteriores.has(clave)
        ) {
          throw new Error(
            "El barco hundido incluye impactos no registrados."
          );
        }
      }

      barcoHundido = {
        nombre: resultado.nombre,
        celdas: resultado.celdas.map(c => ({ ...c }))
      };
    }

    // Guardamos el resultado del disparo.
    if (resultado.tipo === "agua") {
      this.resultados.agua.push(celda);
    }

    if (resultado.tipo === "impacto") {
      this.resultados.impactos.push(celda);
    }

    if (resultado.tipo === "hundido") {

      this.resultados.hundidos.push(barcoHundido);

      // Las celdas hundidas ya quedan representadas
      // en hundidos; quitamos impactos duplicados.
      const clavesHundidas = new Set(
        barcoHundido.celdas.map(c => this.crearClave(c))
      );

      this.resultados.impactos = this.resultados.impactos.filter(
        c => !clavesHundidas.has(this.crearClave(c))
      );
    }

    // Guardamos la decisión para estadísticas.
    const registro = {
      ...celda,
      coordenada: this.disparoPendiente.coordenada,
      probabilidad: this.disparoPendiente.probabilidad,
      porcentaje: this.disparoPendiente.porcentaje,
      tipo: resultado.tipo,
      numeroDisparo: this.historial.length + 1
    };

    this.historial.push(registro);

    // Finaliza el disparo pendiente.
    this.disparoPendiente = null;

    // El análisis anterior ya no está actualizado.
    this.ultimoAnalisis = null;

    return { ...registro };
  }

  /**
   * Función: ejecutarTurno
   *
   * Descripción:
   * Ejecuta un turno completo del agente.
   *
   * Selecciona el objetivo y solicita al sistema
   * de juego que resuelva el disparo.
   *
   * Entrada:
   * - resolverDisparo: función externa que recibe
   *   fila y columna y devuelve el resultado.
   *
   * Salida:
   * - Registro del turno.
   * - null si no existe un objetivo disponible.
   *
   * Importante:
   * La función externa conoce las reglas reales
   * del juego. El agente solo recibe su resultado.
   */
  ejecutarTurno(resolverDisparo) {

    if (typeof resolverDisparo !== "function") {
      throw new Error(
        "Debe proporcionar una función para resolver el disparo."
      );
    }

    const objetivo = this.seleccionarDisparo();

    if (objetivo === null) {
      return null;
    }

    // La lógica del juego resuelve el disparo.
    const resultado = resolverDisparo(
      objetivo.fila,
      objetivo.columna
    );

    // Registramos únicamente el resultado obtenido.
    return this.registrarResultado(resultado);
  }

  /**
   * Función: obtenerHistorial
   *
   * Descripción:
   * Devuelve una copia del historial de disparos.
   *
   * Entrada:
   * - No recibe parámetros.
   *
   * Salida:
   * - Arreglo con las decisiones realizadas.
   */
  obtenerHistorial() {
    return this.historial.map(disparo => ({ ...disparo }));
  }

  /**
   * Función: cambiarSimulaciones
   *
   * Descripción:
   * Actualiza la cantidad de simulaciones del agente.
   *
   * Entrada:
   * - cantidad: 100, 1000, 5000 o 10000.
   *
   * Salida:
   * - Nueva cantidad configurada.
   */
  cambiarSimulaciones(cantidad) {

    const nuevaCantidad =
      this.configuracion.establecerCantidad(cantidad);

    this.ultimoAnalisis = null;

    return nuevaCantidad;
  }

  /**
   * Función: reiniciar
   * Descripción:
   * Elimina el conocimiento y el historial anterior
   * para comenzar una nueva partida.
   * Entrada:
   * - No recibe parámetros.
   * Salida:
   * - true cuando el agente fue reiniciado.
   */
  reiniciar() {

    this.resultados = {
      agua: [],
      impactos: [],
      hundidos: []
    };

    this.historial = [];
    this.ultimoAnalisis = null;
    this.disparoPendiente = null;

    return true;
  }
}
