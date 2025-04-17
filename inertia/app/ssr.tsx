/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />
/// <reference path="../../config/auth.ts" />

import { createInertiaApp } from '@inertiajs/react'
import ReactDOMServer from 'react-dom/server'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

export default function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      return resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob('./pages/**/*.tsx')
      )
    },
    setup: ({ App, props }) => {
      return <App {...props} />
    },
  })
} 