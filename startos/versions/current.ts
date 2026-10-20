import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.10:0',
  releaseNotes: {
    en_US:
      'Updates BentoPDF to 2.8.10, which fixes two security vulnerabilities, and adds Polish.',
    es_ES:
      'Actualiza BentoPDF a 2.8.10, que corrige dos vulnerabilidades de seguridad, y añade el polaco.',
    de_DE:
      'Aktualisiert BentoPDF auf 2.8.10, das zwei Sicherheitslücken schließt, und fügt Polnisch hinzu.',
    pl_PL:
      'Aktualizuje BentoPDF do wersji 2.8.10, która usuwa dwie luki w zabezpieczeniach, i dodaje język polski.',
    fr_FR:
      'Met à jour BentoPDF vers 2.8.10, qui corrige deux vulnérabilités de sécurité, et ajoute le polonais.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
