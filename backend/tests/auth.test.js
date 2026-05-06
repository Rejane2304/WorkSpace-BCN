import request from "supertest"
import app from "../server.js"
import { connectTestDatabase, disconnectTestDatabase, seedTestData } from "./setup.js"

describe("Auth API", () => {
  beforeAll(async () => {
    await connectTestDatabase()
    await seedTestData()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it("debe iniciar sesión con credenciales válidas de usuario real", async () => {
    const email = "admin@workspacebcn.com"
    const password = "admin123"
    const resp = await request(app).post("/api/auth/login").send({ email, password })
    expect(resp.status).toBe(200)
    expect(resp.body.token).toBeDefined()
  }, 20000)
})
