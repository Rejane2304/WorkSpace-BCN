import request from "supertest"
import app from "../server.js"
import { connectDatabase, disconnectDatabase } from "../config/database.js"
describe("Auth API", () => {
  beforeAll(async () => {
    await connectDatabase()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })
  it("debe iniciar sesión con credenciales válidas de usuario real", async () => {
    const email = "admin@workspacebcn.com"
    const password = "admin123"
    const resp = await request(app).post("/api/auth/login").send({ email, password })
    expect(resp.status).toBe(200)
    expect(resp.body.token).toBeDefined()
  }, 20000)
})
