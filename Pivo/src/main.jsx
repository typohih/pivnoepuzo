import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PhotoSection } from './PhotoSection/PhotoSection.jsx'
import { Main } from './Main/Main.jsx'
import { Experts } from './Experts/Experts.jsx'
import { Footer } from './Footer/Footer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PhotoSection />
    <Main />
    <Experts />
    <Footer />
  </StrictMode>,
)
