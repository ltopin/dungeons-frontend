import { Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './auth/SessionContext'
import { RequireSession } from './routes/RequireSession'
import { LoginPage } from './routes/LoginPage'
import { SignupPage } from './routes/SignupPage'
import { CampaignsListPage } from './routes/CampaignsListPage'
import { NewCampaignPage } from './routes/NewCampaignPage'
import { CampaignPage } from './routes/CampaignPage'
import { CharacterSheetPage } from './routes/CharacterSheetPage'
import { CharacterSheetReadOnlyPage } from './routes/CharacterSheetReadOnlyPage'
import { CharacterWizardPage } from './wizard/CharacterWizardPage'
import { WorldWizardPage } from './worldWizard/WorldWizardPage'
import { WorldsListPage } from './routes/WorldsListPage'
import { NewWorldPage } from './routes/NewWorldPage'
import { WorldPage } from './routes/WorldPage'
import { CampaignLorePage } from './routes/CampaignLorePage'
import { GeracaoMundoPage } from './routes/GeracaoMundoPage'

export function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route
          path="/campanhas"
          element={
            <RequireSession>
              <CampaignsListPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/nova"
          element={
            <RequireSession>
              <NewCampaignPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/nova-ia"
          element={
            <RequireSession>
              <WorldWizardPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/nova-ia/:geracaoId"
          element={
            <RequireSession>
              <GeracaoMundoPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/:id"
          element={
            <RequireSession>
              <CampaignPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/:id/ficha"
          element={
            <RequireSession>
              <CharacterSheetPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/:id/ficha/criar"
          element={
            <RequireSession>
              <CharacterWizardPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/:id/fichas/:fichaId"
          element={
            <RequireSession>
              <CharacterSheetReadOnlyPage />
            </RequireSession>
          }
        />
        <Route
          path="/campanhas/:id/historia"
          element={
            <RequireSession>
              <CampaignLorePage />
            </RequireSession>
          }
        />
        <Route
          path="/mundos"
          element={
            <RequireSession>
              <WorldsListPage />
            </RequireSession>
          }
        />
        <Route
          path="/mundos/novo"
          element={
            <RequireSession>
              <NewWorldPage />
            </RequireSession>
          }
        />
        <Route
          path="/mundos/:mundoId"
          element={
            <RequireSession>
              <WorldPage />
            </RequireSession>
          }
        />
        <Route path="/" element={<Navigate to="/campanhas" replace />} />
        <Route path="*" element={<Navigate to="/campanhas" replace />} />
      </Routes>
    </SessionProvider>
  )
}
