import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home"
import ItemDetails from "./pages/menu/ItemDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:id" element={<ItemDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
