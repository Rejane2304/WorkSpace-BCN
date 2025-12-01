import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProductsAdmin from "../pages/admin/ProductsAdmin"
import { AuthProvider } from "../context/AuthContext"
import { MemoryRouter } from "react-router-dom"
import { products as productsAPI } from "../api/api"

jest.mock("../api/api", () => ({
  products: {
    getAll: jest.fn(),
    delete: jest.fn()
  }
}))

jest.mock("../components/FilterSelect", () => ({ value, onChange, options, dataTestId }) => (
  <select 
    data-testid={dataTestId || "mock-select"}
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="mock-select"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
))

jest.mock("../components/Toast", () => {
  return {
    __esModule: true,
    default: ({ message }) => {
      return <div data-testid="mock-toast">{message || "NO MESSAGE"}</div>
    }
  }
})

const mockProducts = [
  { _id: "1", name: "Silla Ergonómica", category: "Oficina", price: 100, stock: 10, image: "" },
  { _id: "2", name: "Teclado Mecánico", category: "Informática", price: 50, stock: 20, image: "" },
  { _id: "3", name: "Monitor 4K", category: "Informática", price: 300, stock: 5, image: "" }
]

const renderAdminProducts = () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <ProductsAdmin />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("ProductsAdmin page (datos mockeados)", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-token")
    localStorage.setItem("user", JSON.stringify({ role: "admin" }))
    productsAPI.getAll.mockResolvedValue({ data: mockProducts })
  })

  it("muestra al menos un producto mockeado y el contador", async () => {
    renderAdminProducts()
    const productos = await screen.findAllByText(/Silla Ergonómica|Teclado Mecánico/i, { selector: 'h3' })
    expect(productos.length).toBeGreaterThan(0)
    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument()
    expect(screen.getByText(/productos disponibles/i)).toBeInTheDocument()
  })

  it("filtra por término de búsqueda mockeado", async () => {
    const user = userEvent.setup()
    renderAdminProducts()
    await screen.findAllByText(/Silla Ergonómica/i, { selector: 'h3' })
    
    const searchInput = screen.getByPlaceholderText(/Buscar productos.../i)
    await act(async () => {
      await user.clear(searchInput)
      await user.type(searchInput, "teclado")
    })
    
    await waitFor(() => {
      const teclados = screen.getAllByText(/Teclado Mecánico/i, { selector: 'h3' })
      expect(teclados.length).toBe(1)
      expect(screen.queryByText(/Silla Ergonómica/i)).not.toBeInTheDocument()
    })
  })

  it("permite filtrar por categoría mockeada", async () => {
    const user = userEvent.setup()
    renderAdminProducts()
    await screen.findAllByText(/Silla Ergonómica/i, { selector: 'h3' })
    
    const select = screen.getByRole("combobox")
    
    await act(async () => {
      await user.selectOptions(select, "Oficina")
    })
    
    await waitFor(() => {
      expect(screen.getByText(/Silla Ergonómica/i)).toBeInTheDocument()
      expect(screen.queryByText(/Teclado Mecánico/i)).not.toBeInTheDocument()
    })
  })
})
