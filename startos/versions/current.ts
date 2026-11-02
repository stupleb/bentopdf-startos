import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.11:0',
  releaseNotes: {
    en_US:
      'Updates BentoPDF to 2.8.11, which adds measurement tools to the PDF editor, favorite tools, a redesigned page organizer, a new compression engine, and Catalan and Persian.',
    es_ES:
      'Actualiza BentoPDF a 2.8.11, que añade herramientas de medición al editor de PDF, herramientas favoritas, un organizador de páginas rediseñado, un nuevo motor de compresión, y el catalán y el persa.',
    de_DE:
      'Aktualisiert BentoPDF auf 2.8.11, das dem PDF-Editor Messwerkzeuge hinzufügt, außerdem Favoriten-Werkzeuge, einen überarbeiteten Seitenorganisator, eine neue Komprimierungs-Engine sowie Katalanisch und Persisch.',
    pl_PL:
      'Aktualizuje BentoPDF do wersji 2.8.11, która dodaje narzędzia pomiarowe w edytorze PDF, ulubione narzędzia, przeprojektowany organizator stron, nowy mechanizm kompresji oraz język kataloński i perski.',
    fr_FR:
      'Met à jour BentoPDF vers 2.8.11, qui ajoute des outils de mesure à l’éditeur PDF, des outils favoris, un organisateur de pages repensé, un nouveau moteur de compression, ainsi que le catalan et le persan.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
