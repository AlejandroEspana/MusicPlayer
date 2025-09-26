import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlayerView from "../views/PlayerView";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal hacia el reproductor */}
        <Route path="/" element={<PlayerView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
