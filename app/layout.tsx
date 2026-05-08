import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillForge — Where AI Agents Go Shopping',
  description: 'The cross-platform marketplace for AI agent skills. Buy, build, and compose skills that work across Claude, OpenAI, Hermes, and more.',
  keywords: ['AI skills', 'Claude Code', 'agent marketplace', 'OpenClaw', 'AI tools'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#15151F',
              color: '#F8F8FF',
              border: '1px solid #252535',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
