
import { useState } from "react";

import Tablero from "./components/Tablero";
import "./styles/juego.css";
import { TAMANO_TABLERO, TIPOS_BARCOS } from "./config/flota";
import { generarFlotaAleatoria } from "./services/generadorFlota";
import { convertirFlotaAMatriz } from "./services/matrizFlota";

/**
 * Función: crearTableroAleatorio
 *
 * Descripción:
 * Genera una flota aleatoria y la convierte en una
 * matriz de celdas para representar un tablero.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Matriz con los barcos colocados aleatoriamente.
 */
function crearTableroAleatorio() {
  const flota = generarFlotaAleatoria(
    TIPOS_BARCOS,
    TAMANO_TABLERO
  );

  return convertirFlotaAMatriz(flota, TAMANO_TABLERO);
}

/**
 * Función: crearTablerosIniciales
 *
 * Descripción:
 * Crea dos tableros independientes: uno para el
 * jugador y otro para la máquina.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Objeto con las matrices de ambos tableros.
 */
function crearTablerosIniciales() {
  return {
    jugador: crearTableroAleatorio(),
    maquina: crearTableroAleatorio()
  };
}

/**
 * Función: App
 *
 * Descripción:
 * Presenta los tableros de Batalla Naval y permite
 * generar una nueva distribución de las flotas.
 *
 * Entradas:
 * No recibe parámetros.
 *
 * Retorno:
 * Interfaz principal del juego.
 */
function App() {
  const [tableros, setTableros] = useState(crearTablerosIniciales);

  /**
   * Función: reiniciarTableros
   *
   * Descripción:
   * Genera nuevas flotas aleatorias para ambos tableros.
   *
   * Entradas:
   * No recibe parámetros.
   *
   * Retorno:
   * No retorna valores.
   */
  function reiniciarTableros() {
    setTableros(crearTablerosIniciales());
  }

  return (
    <main className="pantalla-juego">
      <header className="encabezado-juego">
        <h1>Batalla Naval </h1>

        <p>
          Jugador contra máquina
        </p>

        <button
          type="button"
          onClick={reiniciarTableros}
        >
          Generar nueva partida
        </button>
      </header>

      <section className="tableros-juego">
        <Tablero
          titulo="Mis barcos"
          celdas={tableros.jugador}
          mostrarBarcos={true}
          deshabilitado={true}
        />

        <Tablero
          titulo="Barcos enemigo"
          celdas={tableros.maquina}
          mostrarBarcos={false}
          deshabilitado={true}
        />
      </section>
    </main>
  );
}

export default App;
