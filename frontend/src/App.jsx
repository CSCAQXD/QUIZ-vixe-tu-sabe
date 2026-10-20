import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PageStatus from './components/common/PageStatus/PageStatus'
import MainLayout from './layouts/MainLayout/MainLayout'

const CadastroTurmasPage = lazy(() => import('./pages/CadastroTurmas/CadastroTurmasPage'))
const QuizConcluidoPage = lazy(() => import('./pages/QuizConcluido/QuizConcluidoPage'))
const QuizPage = lazy(() => import('./pages/Quiz/QuizPage'))
const RankingsPage = lazy(() => import('./pages/Rankings/RankingsPage'))
const TelaInicialPage = lazy(() => import('./pages/TelaInicial/TelaInicialPage'))

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageStatus fullScreen message="Carregando tela..." />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<TelaInicialPage />} />

            <Route path="/cadastro-turmas" element={<CadastroTurmasPage />} />

            <Route path="/quiz" element={<QuizPage />} />

            <Route path="/quiz-concluido" element={<QuizConcluidoPage />} />

            <Route path="/rankings" element={<RankingsPage />} />

            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
