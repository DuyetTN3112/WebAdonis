import { Head } from '@inertiajs/react'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title = 'AdonisJS App' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {children}
      </main>
    </>
  )
} 