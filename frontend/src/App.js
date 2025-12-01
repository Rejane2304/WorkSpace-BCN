import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import Header from "./components/Header"
import Footer from "./components/Footer"
import ScrollToTopButton from "./components/ScrollToTopButton"
import Home from "./pages/Home"
import Products from "./pages/Products"
import Contact from "./pages/Contact"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderSummaryPage from "./pages/OrderSummaryPage"
import OrdersHistory from "./pages/OrdersHistory"
import OrderDetail from "./pages/OrderDetail"
import ProductDetail from "./pages/ProductDetail"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ProductsAdmin from "./pages/admin/ProductsAdmin"
import AdminProductEdit from "./pages/admin/AdminProductEdit"
import CustomersAdmin from "./pages/admin/CustomersAdmin"
import SalesAdmin from "./pages/admin/SalesAdmin"
import InventoryAdmin from "./pages/admin/InventoryAdmin"
import InventoryDetailAdmin from "./pages/admin/InventoryDetailAdmin"
import PaymentsAdmin from "./pages/admin/PaymentsAdmin"

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />

              <Route path="/perfil" element={<Profile />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders/success/:orderId" element={<OrderSummaryPage />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/orders" element={<OrdersHistory />} />

              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/productos" element={<ProductsAdmin />} />
              <Route path="/admin/productos/:id/editar" element={<AdminProductEdit />} />
              <Route path="/admin/clientes" element={<CustomersAdmin />} />
              <Route path="/admin/ventas" element={<SalesAdmin />} />
              <Route path="/admin/inventario" element={<InventoryAdmin />} />
              <Route path="/admin/inventario/:id" element={<InventoryDetailAdmin />} />
              <Route path="/admin/pagos" element={<PaymentsAdmin />} />
            </Routes>
          </main>
          <ScrollToTopButton />
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
