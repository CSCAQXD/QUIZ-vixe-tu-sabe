import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";
import CadastroTurmasPage from "./pages/CadastroTurmas/CadastroTurmasPage";
import QuizConcluidoPage from "./pages/QuizConcluido/QuizConcluidoPage";
import QuizPage from "./pages/Quiz/QuizPage";
import RankingsPage from "./pages/Rankings/RankingsPage";
import TelaInicialPage from "./pages/TelaInicial/TelaInicialPage";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route element={<MainLayout />}>
            <Route index element={<TelaInicialPage />} />

            <Route
                path="/cadastro-turmas"
                element={<CadastroTurmasPage />}
            />

            <Route
                path="/quiz"
                element={<QuizPage />}
            />

            <Route
                path="/quiz-concluido"
                element={<QuizConcluidoPage />}
            />

            <Route
                path="/rankings"
                element={<RankingsPage />}
            />

            <Route
                path="*"
                element={<Navigate replace to="/" />}
            />
            </Route>
        </Routes>
        </BrowserRouter>
    );
}

export default App;