import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import Home from "./pages/home";
import ItemDetails from "./pages/menu/ItemDetails";
import AccountPage from "./pages/auth/AccountPage";
import AuthPage from "./pages/auth/AuthPage";
import NewProductPage from "./pages/products/NewProductPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";
import { CartProvider } from "./cart/CartProvider";
import CartPage from "./pages/cart/CartPage";
import LogoutPage from "./pages/auth/LogoutPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu/:id" element={<ItemDetails />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/account" element={<AccountPage />} />
              <Route path="/products/new" element={<NewProductPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
