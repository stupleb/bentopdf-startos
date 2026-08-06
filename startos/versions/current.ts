import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.7:0',
  releaseNotes: {
    en_US:
      'Updates BentoPDF to v2.8.7, a security release that fixes vulnerabilities present in all earlier versions — upgrading is strongly recommended. Also brings the v2.8.5–v2.8.6 improvements (custom rotate, alternate/mix pages, split-PDF refactor, multi-tool drag-and-drop) and OCR, HEIC, and email-parsing fixes. Rebuilt on StartOS SDK 2.0.9.',
    es_ES:
      'Actualiza BentoPDF a v2.8.7, una versión de seguridad que corrige vulnerabilidades presentes en todas las versiones anteriores — se recomienda encarecidamente actualizar. También incluye las mejoras de v2.8.5–v2.8.6 (rotación personalizada, páginas alternas/mixtas, refactorización de la división de PDF, arrastrar y soltar en la multiherramienta) y correcciones de OCR, HEIC y análisis de correo. Reconstruido con StartOS SDK 2.0.9.',
    de_DE:
      'Aktualisiert BentoPDF auf v2.8.7, eine Sicherheitsversion, die Schwachstellen in allen früheren Versionen behebt — ein Update wird dringend empfohlen. Enthält außerdem die Verbesserungen aus v2.8.5–v2.8.6 (benutzerdefinierte Drehung, alternierende/gemischte Seiten, Split-PDF-Überarbeitung, Multi-Tool-Drag-and-Drop) sowie Korrekturen für OCR, HEIC und E-Mail-Verarbeitung. Neu erstellt mit StartOS SDK 2.0.9.',
    pl_PL:
      'Aktualizuje BentoPDF do v2.8.7 — wydania bezpieczeństwa naprawiającego podatności obecne we wszystkich wcześniejszych wersjach; zdecydowanie zalecana aktualizacja. Zawiera też usprawnienia z v2.8.5–v2.8.6 (własny obrót, naprzemienne/mieszane strony, przebudowa dzielenia PDF, przeciąganie i upuszczanie w multinarzędziu) oraz poprawki OCR, HEIC i analizy e-maili. Przebudowano na StartOS SDK 2.0.9.',
    fr_FR:
      'Met à jour BentoPDF vers la v2.8.7, une version de sécurité corrigeant des vulnérabilités présentes dans toutes les versions antérieures — la mise à jour est fortement recommandée. Inclut aussi les améliorations des v2.8.5–v2.8.6 (rotation personnalisée, pages alternées/mixtes, refonte de la division de PDF, glisser-déposer multi-outils) et des corrections OCR, HEIC et d’analyse d’e-mails. Reconstruit avec le SDK StartOS 2.0.9.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
