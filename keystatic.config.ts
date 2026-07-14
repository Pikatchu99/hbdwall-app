import { config, collection, fields } from '@keystatic/core'

export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'Hbdwall · Blog' },
  },

  collections: {
    blog: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'content/blog/*/',
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Titre de l\'article',
            description: 'Le titre affiché et utilisé pour générer le slug URL.',
          },
        }),

        description: fields.text({
          label: 'Description SEO',
          description: 'Affiché dans Google sous le titre. Vise 120-160 caractères.',
          multiline: true,
          validation: { isRequired: true },
        }),

        excerpt: fields.text({
          label: 'Extrait',
          description: 'Résumé court affiché sur la page liste du blog.',
          multiline: true,
          validation: { isRequired: true },
        }),

        publishedAt: fields.date({
          label: 'Date de publication',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),

        category: fields.select({
          label: 'Catégorie',
          defaultValue: 'surprises',
          options: [
            { label: 'Anniversaire à distance', value: 'distance' },
            { label: 'Collègues & Travail', value: 'collegues' },
            { label: 'Surprises & Idées', value: 'surprises' },
            { label: 'Messages & Textes', value: 'messages' },
            { label: 'Milestones (30, 40, 50 ans…)', value: 'milestones' },
            { label: 'Souvenirs & Cadeaux', value: 'souvenirs' },
          ],
        }),

        draft: fields.checkbox({
          label: 'Brouillon',
          description: 'Si coché, l\'article n\'est pas visible sur le blog.',
          defaultValue: true,
        }),

        content: fields.document({
          label: 'Contenu de l\'article',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/blog-images',
            publicPath: '/blog-images/',
          },
        }),
      },
    }),
  },
})
