import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.8.8:2',
  releaseNotes: {
    en_US:
      'Fixes OCR. In the 18 bundled languages it now runs entirely from your server, including the fonts for the searchable text it adds. If you used OCR before this update, clear BentoPDF’s site data in your browser once.',
    es_ES:
      'Corrige el OCR. En los 18 idiomas incluidos ahora funciona por completo desde tu servidor, incluidas las fuentes del texto buscable que añade. Si usaste el OCR antes de esta actualización, borra una vez los datos del sitio de BentoPDF en tu navegador.',
    de_DE:
      'Behebt einen Fehler in der OCR. In den 18 mitgelieferten Sprachen läuft sie jetzt vollständig von Ihrem Server, einschließlich der Schriften für den durchsuchbaren Text, den sie hinzufügt. Wenn Sie die OCR vor diesem Update verwendet haben, löschen Sie einmal die Websitedaten von BentoPDF in Ihrem Browser.',
    pl_PL:
      'Naprawia OCR. W 18 dołączonych językach działa teraz w całości z Twojego serwera, łącznie z czcionkami dla dodawanego przeszukiwalnego tekstu. Jeśli przed tą aktualizacją korzystano z OCR, wyczyść raz dane witryny BentoPDF w przeglądarce.',
    fr_FR:
      'Corrige l’OCR. Dans les 18 langues incluses, l’OCR fonctionne désormais entièrement depuis votre serveur, y compris les polices du texte interrogeable ajouté. Si vous avez utilisé l’OCR avant cette mise à jour, effacez une fois les données du site BentoPDF dans votre navigateur.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
