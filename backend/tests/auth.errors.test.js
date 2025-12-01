import request from "supertest"
import app from "../server.js"
import { connectDatabase, disconnectDatabase } from "../config/database.js"

describe("Auth API - errores", () => {
  beforeAll(async () => {
    await connectDatabase()
  })
  afterAll(async () => {
    await disconnectDatabase()
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
