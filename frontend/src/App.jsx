import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout";
import Login from "./pages/login";
import Register from "./pages/register";
import Upload from "./pages/upload";
import History from "./pages/history";
import Analyse from "./pages/analyse";
import Info from "./pages/info"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/upload"
          element={
            <Layout>
              <Upload />
            </Layout>
          }
        />
        <Route
          path="/history"
          element={
            <Layout>
              <History />
            </Layout>
          }
        />
        <Route
          path="/analyse"
          element={
            <Layout>
              <Analyse />
            </Layout>
          }
        />
        <Route
          path="/info"
          element={
            <Layout>
              <Info />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
