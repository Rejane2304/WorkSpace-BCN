import request from "supertest"
import app from "../server.js"
import { connectTestDatabase, disconnectTestDatabase } from "./setup.js"

describe("Auth API - errores", () => {
  beforeAll(async () => {
    await connectTestDatabase()
  }, 30000)
  afterAll(async () => {
    await disconnectTestDatabase()
  })
  it("rechaza login con credenciales incorrectas", async () => {
    const resp = await request(app).post("/api/auth/login").send({
      email: "noexiste@email.com",
      password: "incorrecta"
    })
    expect([400,401]).toContain(resp.status)
    expect(resp.body.token).toBeUndefined()
  })
})
