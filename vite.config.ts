import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Publicado em GitHub Pages como projeto (não é um site de usuário),
// então os assets precisam do prefixo com o nome do repositório.
export default defineConfig({
  base: "/CartaoDesignacoes/",
  plugins: [react()],
});
