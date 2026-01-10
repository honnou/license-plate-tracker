import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'License Plate Tracker',
  description: 'Track and compete with friends to collect license plates from all 50 states',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
