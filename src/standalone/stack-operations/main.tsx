import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Demo from '../../src/demos/stack-operations'
import Page from '../Page'
import '../styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page title="How a Stack Works">
      <Demo />
    </Page>
  </StrictMode>,
)
