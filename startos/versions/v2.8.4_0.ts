import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_2_8_4_0 = VersionInfo.of({
  version: '2.8.4:0',
  releaseNotes: {
    en_US:
      'Initial StartOS release. Packages BentoPDF v2.8.4 with PyMuPDF, Ghostscript, and CoherentPDF WebAssembly libraries bundled locally — no external CDN is contacted at runtime.',
    es_ES:
      'Versión inicial para StartOS. Empaqueta BentoPDF v2.8.4 con las bibliotecas WebAssembly PyMuPDF, Ghostscript y CoherentPDF incluidas localmente — no se contacta ninguna CDN externa en tiempo de ejecución.',
    de_DE:
      'Erstveröffentlichung für StartOS. Bündelt BentoPDF v2.8.4 mit den WebAssembly-Bibliotheken PyMuPDF, Ghostscript und CoherentPDF lokal — zur Laufzeit wird kein externes CDN kontaktiert.',
    pl_PL:
      'Pierwsze wydanie dla StartOS. Pakiet BentoPDF v2.8.4 z lokalnie dołączonymi bibliotekami WebAssembly PyMuPDF, Ghostscript i CoherentPDF — w trakcie działania nie jest kontaktowany żaden zewnętrzny CDN.',
    fr_FR:
      "Version initiale pour StartOS. Inclut BentoPDF v2.8.4 avec les bibliothèques WebAssembly PyMuPDF, Ghostscript et CoherentPDF intégrées localement — aucun CDN externe n'est contacté à l'exécution.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
