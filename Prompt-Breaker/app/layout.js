import './globals.css'
import { SessionProvider } from '../components/SessionProvider'

export const metadata = {
  title:       'Prompt Breaker',
  description: 'Break the AI. Capture the flag.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}