import Navbar from '@/components/layout/navbar/Navbar'
import Footer from '@/components/layout/footer/Footer'

export default function DefaultLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main style={{ backgroundColor: '#f9f9f9' }}>{children}</main>
      <Footer />
    </div>
  )
}
