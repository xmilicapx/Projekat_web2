import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import type { IUserApi } from "./api_services/interfaces/IUserApi";
import { UserApi } from "./api_services/services/UserApi";
import { useAuth } from "./auth/useAuth";
import AdminPage from "./pages/AdminPage";
import type { IQuizApi } from "./api_services/interfaces/IQuizApi";
import { QuizApi } from "./api_services/services/QuizApi";
import ProtectedRoute from "./auth/ProtectedRoute";
import UserPage from "./pages/UserPage";
import { ResultApi } from "./api_services/services/ResultApi";
import type { IResultApi } from "./api_services/interfaces/IResultApi";

const users: IUserApi = new UserApi();
const quizzess: IQuizApi = new QuizApi();
const results: IResultApi = new ResultApi();

function App() {
  const { user } = useAuth();

  const onSuccess = () => {
    window.location.href = user?.role ?? "/";
  };

  return (
    <Routes>
      <Route path="/" element={<AuthPage userApi={users} onAuthSuccess={onSuccess}/>} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin" children={<AdminPage quizApi={quizzess} resultApi={results} />} />} />
      <Route path="/user" element={<ProtectedRoute requiredRole="user" children={<UserPage resultApi={results} quizApi={quizzess} />} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
