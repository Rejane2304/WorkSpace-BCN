import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import Login from "../pages/Login"
import { AuthProvider } from "../context/AuthContext"
import { auth as authAPI } from "../api/api"

jest.mock("../api/api", () => ({
  auth: {
    login: jest.fn(),
    getProfile: jest.fn()
  }
}))

jest.mock("../components/Toast", () => {
  return {
    __esModule: true,
    default: ({ message }) => {
      return message ? <div data-testid="mock-toast">{message}</div> : null
    }
  }
})

const renderLogin = () => {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<h1>Mi Perfil Mock</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("Login page (Mocked)", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("permite login exitoso y redirige", async () => {
    authAPI.login.mockResolvedValue({
      data: {
        token: "fake-jwt-token",
        user: { id: "1", name: "Maria", role: "client" }
      }
    })
    authAPI.getProfile.mockResolvedValue({
      data: { id: "1", name: "Maria", role: "client" }
    })

    renderLogin()
    const user = userEvent.setup()

    await act(async () => {
      await user.type(screen.getByLabelText(/Email/i), "maria@test.com")
      await user.type(screen.getByLabelText("Contraseña", { selector: 'input' }), "password123")
      await user.click(screen.getByRole("button", { name: /Iniciar Sesión/i }))
    })

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith("maria@test.com", "password123")
      expect(screen.getByText("Mi Perfil Mock")).toBeInTheDocument()
    })
  })

  it("muestra error con credenciales incorrectas", async () => {
    authAPI.login.mockRejectedValue({
      response: {
        data: {
          mensaje: "Credenciales inválidas"
        }
      }
    })

    renderLogin()
    const user = userEvent.setup()

    await act(async () => {
      await user.type(screen.getByLabelText(/Email/i), "wrong@test.com")
      await user.type(screen.getByLabelText("Contraseña", { selector: 'input' }), "wrongpass")
      await user.click(screen.getByRole("button", { name: /Iniciar Sesión/i }))
    })

    await waitFor(() => {
      expect(screen.getByTestId("mock-toast")).toHaveTextContent(/Credenciales inválidas/i)
    })
  })
})
