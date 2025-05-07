import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import Welcome from "../pages";
import ChatIA from "../pages/ChatIA";

const AppRoutes = () => (
  <Routes>
    {/* Rotas públicas */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Rotas protegidas */}
    <Route element={<ProtectedRoute />}>
      <Route path="/home" element={<Welcome />} />
      <Route path="/chat-ia" element={<ChatIA />} />
    </Route>
    
    {/* Redirecionamentos */}
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);

export default AppRoutes;