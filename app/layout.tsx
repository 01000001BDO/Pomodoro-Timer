import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description: 'A simple pomodoro timer app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}