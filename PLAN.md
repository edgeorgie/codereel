# codereel: plan

Editor web de videos de codigo y devlogs. Sin instalar nada. Render en el navegador.

## Alcance
- Plantillas: snippet de codigo animado (tipeo, resaltado de lineas, diff), changelog, tarjeta de repo.
- Composicion en HTML con atributos data, compatible con el formato de Hyperframes.
- Vista previa en vivo, panel simple de edicion, exportar MP4 con WebCodecs.
- Fuera de alcance: linea de tiempo completa, audio avanzado, render en servidor.

## Entregas
1. Semana 2: modelo de escena, reproductor con reloj determinista, plantilla de snippet, export MP4 en Chrome/Edge.
2. Semana 3: panel de edicion (texto, tema, duracion, orden de escenas), plantillas de diff y changelog.
3. Semana 4: escena desde prompt (BYOK), importar desde un commit o PR de GitHub, README y deploy.

## Riesgos
- Safari con WebCodecs parcial: avisar y degradar.
- Render de DOM a frames: preferir canvas 2D para el export; la vista previa puede usar DOM.
- Memoria en videos largos: limitar a 60 s en el MVP.

## Ramas
GitFlow: feature/scene-model, feature/player, feature/export-mp4 desde develop.
