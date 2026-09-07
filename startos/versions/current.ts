import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.8:0',
  releaseNotes: {
    en_US:
      'Updates BentoPDF to v2.8.8. This includes the v2.8.7 security fixes (three advisories affecting all versions up to v2.8.6 — upgrading is strongly recommended) and adds in-place PDF text editing; the editor’s fallback fonts are bundled with the package, so it works without contacting any CDN. Also included: fixes for text rendering on the self-hosted image, WASM initialization timeouts, and PDF-to-TIFF memory use, plus a new duplex-sort tool and non-Latin text support in the editor. Rebuilt on StartOS SDK 2.0.9.',
    es_ES:
      'Actualiza BentoPDF a v2.8.8. Incluye las correcciones de seguridad de v2.8.7 (tres avisos que afectan a todas las versiones hasta v2.8.6 — se recomienda encarecidamente actualizar) y añade edición de texto directamente en el PDF; las fuentes de respaldo del editor vienen incluidas en el paquete, por lo que funciona sin contactar ninguna CDN. También incluye correcciones del renderizado de texto en la imagen autoalojada, de los tiempos de espera al inicializar WASM y del uso de memoria al convertir PDF a TIFF, además de una nueva herramienta de ordenación dúplex y compatibilidad con texto no latino en el editor. Reconstruido con StartOS SDK 2.0.9.',
    de_DE:
      'Aktualisiert BentoPDF auf v2.8.8. Enthält die Sicherheitskorrekturen aus v2.8.7 (drei Advisories, die alle Versionen bis v2.8.6 betreffen — ein Update wird dringend empfohlen) und fügt direkte Textbearbeitung in PDFs hinzu; die Ausweichschriften des Editors sind im Paket enthalten, sodass er ohne Kontakt zu einem CDN funktioniert. Außerdem enthalten: Korrekturen für die Textdarstellung im selbst gehosteten Image, für WASM-Initialisierungs-Timeouts und für den Speicherverbrauch bei der PDF-zu-TIFF-Konvertierung sowie ein neues Duplex-Sortierwerkzeug und Unterstützung für nicht-lateinischen Text im Editor. Neu erstellt mit StartOS SDK 2.0.9.',
    pl_PL:
      'Aktualizuje BentoPDF do v2.8.8. Zawiera poprawki bezpieczeństwa z v2.8.7 (trzy ostrzeżenia dotyczące wszystkich wersji do v2.8.6 — zdecydowanie zalecana aktualizacja) i dodaje edycję tekstu bezpośrednio w PDF; czcionki zastępcze edytora są dołączone do pakietu, więc działa on bez kontaktu z żadnym CDN. Zawiera też poprawki renderowania tekstu w obrazie self-hosted, limitów czasu inicjalizacji WASM i zużycia pamięci przy konwersji PDF do TIFF, a także nowe narzędzie sortowania dupleksowego i obsługę tekstu niełacińskiego w edytorze. Przebudowano na StartOS SDK 2.0.9.',
    fr_FR:
      'Met à jour BentoPDF vers la v2.8.8. Inclut les correctifs de sécurité de la v2.8.7 (trois avis affectant toutes les versions jusqu’à la v2.8.6 — la mise à jour est fortement recommandée) et ajoute l’édition de texte directement dans le PDF ; les polices de secours de l’éditeur sont incluses dans le paquet, il fonctionne donc sans contacter aucun CDN. Inclut aussi des correctifs pour le rendu du texte sur l’image auto-hébergée, les délais d’initialisation WASM et la consommation mémoire de la conversion PDF vers TIFF, ainsi qu’un nouvel outil de tri recto-verso et la prise en charge du texte non latin dans l’éditeur. Reconstruit avec le SDK StartOS 2.0.9.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
