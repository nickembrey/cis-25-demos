import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Demo from '../../src/demos/call-stack'
import Page from '../Page'
import '../styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page title="The Call Stack">
      <Demo />
    </Page>
  </StrictMode>,
)
