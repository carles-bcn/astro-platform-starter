# Pla Apòcrif

Generador de textos literaris **originals** a la manera de Josep Pla, escrits per una IA amb l'API d'Anthropic. Tries el gènere (dietari, recepta, crítica televisiva…), el to (de «Obra Completa» a «Deliri total»), el tema, l'extensió i la llengua, i el text apareix mentre s'escriu, maquetat com una pàgina de llibre.

Cap d'aquests textos no és de Josep Pla: cada pàgina porta una referència bibliogràfica clarament apòcrifa, que també es copia i es descarrega amb el text.

## Requisits

- Node.js 20.19 o més nou
- Una clau de l'API d'Anthropic

## Instal·lació i arrencada

```bash
cd pla-apocrif
npm install
cp .env.example .env     # i posa-hi la teva ANTHROPIC_API_KEY
npm run dev
```

Obre <http://127.0.0.1:5173>. `npm run dev` arrenca alhora el servidor Express (port 3001) i Vite (port 5173). Vite redirigeix `/api` cap a Express, de manera que la clau no surt mai del servidor.

Si canvies el `.env`, reinicia `npm run dev`.

## Altres ordres

| Ordre | Què fa |
| --- | --- |
| `npm run build` i després `npm start` | Compila el frontend i el serveix des d'Express en un sol port (<http://127.0.0.1:3001>) |
| `npm run prova` | Genera tres textos de prova (Dietari/to 1, Recepta/to 3, Crítica televisiva/to 5) i els desa a `proves/resultats.md` |
| `npm test` | Proves unitàries (prompt, validació, interpretació del text) |

## Configuració (`.env`)

| Variable | Per defecte | |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | — | Obligatòria |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Model que escriu els textos |
| `ANTHROPIC_EFFORT` | `medium` | Esforç de raonament. Més alt, més temps abans que comenci a escriure. Buit per no enviar-lo |
| `PORT` | `3001` | Port del servidor |

## Com funciona

- `server/`: Express amb un sol endpoint, `POST /api/generate`. Valida els paràmetres, construeix el prompt (`server/prompt.js`) i crida l'API amb el SDK oficial en streaming. Els fragments arriben al navegador com a Server-Sent Events. Si l'usuari prem «Atura», el servidor talla també la crida a l'API.
- `src/`: React + Tailwind. La pàgina de llibre fa servir EB Garamond (Google Fonts), versaletes i caplletra.
- `shared/catalog.js`: els tipus de text, tons, extensions i llengües, compartits entre client i servidor.
- L'historial de les últimes 20 generacions es desa al `localStorage` del navegador, amb els paràmetres de cada una.
- Amb els models que ho admeten, s'activa el *fallback* del servidor d'Anthropic: si un filtre de seguretat declina la petició, l'API la reintenta amb un altre model.
