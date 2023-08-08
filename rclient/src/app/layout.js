import './globals.css'

export const metadata = {
  title: 'R Engineering Interview Client',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
