import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.8:1',
  releaseNotes: {
    en_US:
      'OCR now runs locally for 18 languages — Arabic, Chinese (Simplified and Traditional), Dutch, English, French, German, Hebrew, Hindi, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Turkish and Ukrainian — with the recognition engine and language data bundled, so no CDN is contacted for them. Other OCR languages download their language data from jsdelivr on first use. Everything else is unchanged.',
    es_ES:
      'El OCR ahora funciona localmente en 18 idiomas — árabe, chino (simplificado y tradicional), neerlandés, inglés, francés, alemán, hebreo, hindi, italiano, japonés, coreano, polaco, portugués, ruso, español, turco y ucraniano — con el motor de reconocimiento y los datos de idioma incluidos, por lo que no se contacta ninguna CDN para ellos. Los demás idiomas de OCR descargan sus datos desde jsdelivr la primera vez que se usan. Todo lo demás permanece igual.',
    de_DE:
      'OCR läuft jetzt für 18 Sprachen lokal — Arabisch, Chinesisch (vereinfacht und traditionell), Niederländisch, Englisch, Französisch, Deutsch, Hebräisch, Hindi, Italienisch, Japanisch, Koreanisch, Polnisch, Portugiesisch, Russisch, Spanisch, Türkisch und Ukrainisch — mit gebündelter Erkennungs-Engine und Sprachdaten, sodass dafür kein CDN kontaktiert wird. Andere OCR-Sprachen laden ihre Sprachdaten bei der ersten Verwendung von jsdelivr. Alles andere bleibt unverändert.',
    pl_PL:
      'OCR działa teraz lokalnie dla 18 języków — arabskiego, chińskiego (uproszczonego i tradycyjnego), niderlandzkiego, angielskiego, francuskiego, niemieckiego, hebrajskiego, hindi, włoskiego, japońskiego, koreańskiego, polskiego, portugalskiego, rosyjskiego, hiszpańskiego, tureckiego i ukraińskiego — z dołączonym silnikiem rozpoznawania i danymi językowymi, więc dla nich nie jest kontaktowany żaden CDN. Pozostałe języki OCR pobierają dane językowe z jsdelivr przy pierwszym użyciu. Wszystko inne pozostaje bez zmian.',
    fr_FR:
      'L’OCR fonctionne désormais en local pour 18 langues — arabe, chinois (simplifié et traditionnel), néerlandais, anglais, français, allemand, hébreu, hindi, italien, japonais, coréen, polonais, portugais, russe, espagnol, turc et ukrainien — avec le moteur de reconnaissance et les données linguistiques inclus, donc aucun CDN n’est contacté pour ces langues. Les autres langues d’OCR téléchargent leurs données depuis jsdelivr à la première utilisation. Tout le reste est inchangé.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
