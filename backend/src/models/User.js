import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "El email debe tener un formato válido"],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["cliente", "admin"],
    default: "cliente",
  },
  phone: String,
  address: String,
  city: String,
  postalCode: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

export default mongoose.model("User", userSchema, "users")
