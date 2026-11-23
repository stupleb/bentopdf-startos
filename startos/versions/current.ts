import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.12:0',
  releaseNotes: {
    en_US:
      'Updates BentoPDF to 2.8.12, which adds sorting to file lists and fixes signature validation of document timestamps.',
    es_ES:
      'Actualiza BentoPDF a 2.8.12, que añade la ordenación de las listas de archivos y corrige la validación de firmas de las marcas de tiempo de documentos.',
    de_DE:
      'Aktualisiert BentoPDF auf 2.8.12, das Dateilisten sortierbar macht und die Signaturprüfung von Dokument-Zeitstempeln behebt.',
    pl_PL:
      'Aktualizuje BentoPDF do wersji 2.8.12, która dodaje sortowanie list plików i naprawia weryfikację podpisów znaczników czasu dokumentów.',
    fr_FR:
      'Met à jour BentoPDF vers 2.8.12, qui ajoute le tri des listes de fichiers et corrige la validation des signatures d’horodatage de documents.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
