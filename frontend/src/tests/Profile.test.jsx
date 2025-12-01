import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Profile from "../pages/Profile"
import { AuthContext } from "../context/AuthContext"
import { customers } from "../api/api"

jest.mock("../api/api", () => ({
  customers: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfileImage: jest.fn()
  }
}))

const seedUser = {
  nombre: "María Rodriguez",
  email: "maria.rodriguez@email.com",
  role: "cliente",
}

const contextValue = {
  user: seedUser,
  token: "fake-jwt-token",
  isAuthenticated: true,
  updateUser: jest.fn(),
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  isAdmin: false,
}

describe("Profile page", () => {
  it("muestra datos reales del perfil de usuario autenticado", async () => {
    localStorage.setItem("token", "token-seed-usuario")
    localStorage.setItem("user", JSON.stringify(seedUser))
    
    customers.getProfile.mockResolvedValue({ data: seedUser })

    render(
      <AuthContext.Provider value={contextValue}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(await screen.findByLabelText(/Nombre completo/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/maria\.rodriguez@email\.com/i)).toBeInTheDocument()
  })
})
