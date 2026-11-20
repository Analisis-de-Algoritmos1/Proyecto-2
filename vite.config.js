
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Configuración de Vite para Batalla Naval.
 *
 * La propiedad base permite que los archivos
 * JavaScript, CSS y demás recursos se carguen
 * correctamente desde GitHub Pages.
 */
export default defineConfig({
  plugins: [react()],

  // Nombre exacto del repositorio de GitHub.
  base: "/Proyecto-2/"
});
