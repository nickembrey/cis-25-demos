import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Demo from '../../src/demos/stack-and-heap'
import Page from '../Page'
import '../styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page title="Stack Memory and Heap Memory">
      <Demo />
    </Page>
  </StrictMode>,
)
