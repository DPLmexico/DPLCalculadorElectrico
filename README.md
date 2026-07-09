# Calculadora Eléctrica de DPL

Calculadora eléctrica web para cálculos de electricidad básica: CA (monofásico/trifásico), impedancia, conversión Delta/Estrella y CD. Incluye historial de cálculos en sesión con exportación a CSV y PDF.

## Stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [jsPDF](https://github.com/parallax/jsPDF) para exportar el historial a PDF

## Desarrollo

```bash
npm install
npm run dev
```

## Otros comandos

```bash
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción localmente
npm run lint      # corre ESLint
```

## Estructura

```
src/
  calculators/   Componente principal de la calculadora (UI)
  logic/         Funciones puras de cálculo (CA, impedancia, Delta/Estrella, CD)
```
