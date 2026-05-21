import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bentopdf',
  title: 'BentoPDF',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/bentopdf-startos',
  upstreamRepo: 'https://github.com/alam00000/bentopdf',
  marketingUrl: 'https://www.bentopdf.com/',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bentopdf: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
