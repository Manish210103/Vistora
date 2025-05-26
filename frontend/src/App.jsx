import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Login from "./pages/login";
import Register from "./pages/register";
import Upload from "./pages/upload";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Upload page wrapped inside Layout */}
        <Route
          path="/upload"
          element={
            <Layout>
              <Upload />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
