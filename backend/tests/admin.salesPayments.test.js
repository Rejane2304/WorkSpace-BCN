import request from "supertest"
import app from "../server.js"
import { connectTestDatabase, disconnectTestDatabase, seedTestData } from "./setup.js"

const ADMIN_EMAIL = "admin@workspacebcn.com"
const ADMIN_PASSWORD = "admin123"

describe("Admin sales & payments endpoints", () => {
  let adminToken = null
  let userToken = null

  beforeAll(async () => {
    await connectTestDatabase()
    await seedTestData()

    const adminResp = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
    adminToken = adminResp.body.token

    const userResp = await request(app).post("/api/auth/login").send({
      email: "maria.rodriguez@email.com",
      password: "password123",
    })
    userToken = userResp.body.token
  }, 30000)

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it("permite al admin listar resumen de ventas", async () => {
    const res = await request(app).get("/api/sales").set("Authorization", `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.summary).toBeDefined()
    expect(Array.isArray(res.body.ventas)).toBe(true)
  })

  it("permite al admin listar pagos y el usuario normal no puede", async () => {
    const adminRes = await request(app)
      .get("/api/payments/admin")
      .set("Authorization", `Bearer ${adminToken}`)
    expect(adminRes.status).toBe(200)
    expect(Array.isArray(adminRes.body)).toBe(true)

    const userRes = await request(app)
      .get("/api/payments/admin")
      .set("Authorization", `Bearer ${userToken}`)
    expect([401, 403]).toContain(userRes.status)
  })
})