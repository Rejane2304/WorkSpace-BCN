import { devLog, devError } from "../src/utils/devlog.js"
import fs from "fs"
import path from "path"
import { createHash } from "crypto"
import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const folderMap = {
  Informática: "WorkSpaceBCN/Products/Informatica",
  Informatica: "WorkSpaceBCN/Products/Informatica",
  Oficina: "WorkSpaceBCN/Products/Oficina",
  Audiovisual: "WorkSpaceBCN/Products/Audiovisual",
  Perfil: "WorkSpaceBCN/Perfil",
}

const DEFAULT_FOLDER = "WorkSpaceBCN/Products/Oficina"

function sanitizeFileName(fileName = "image") {
  const name = path.basename(fileName, path.extname(fileName))
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "image"
  )
}

function bufferFromSource(source) {
  if (Buffer.isBuffer(source)) {
    return source
  }

  if (typeof source === "string") {
    if (source.startsWith("data:")) {
      return Buffer.from(source.split(",")[1], "base64")
    }

    return fs.readFileSync(source)
  }

  throw new Error("Formato de imagen no soportado")
}

export async function uploadImage(imageSource, categoria = "Informática", options = {}) {
  try {

    const folder = folderMap[categoria] || DEFAULT_FOLDER
    const buffer = bufferFromSource(imageSource)
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12)
    const safeFileName = sanitizeFileName(options.fileName)
    const publicIdBase = `${safeFileName}-${hash}`
    const fullPublicId = `${folder}/${publicIdBase}`
    const uploadInput = typeof imageSource === "string" ? imageSource : buffer

    devLog(
      `Subiendo imagen a Cloudinary... categoría="${categoria}", folder="${folder}", public_id="${publicIdBase}"`,
    )

    try {
      const existing = await cloudinary.api.resource(fullPublicId, { resource_type: "auto" })
      if (existing?.secure_url) {
        devLog("Imagen ya existe en Cloudinary, se reutiliza:", fullPublicId)
        return existing.secure_url
      }
    } catch (error) {
      if (error.http_code && error.http_code !== 404) {
        throw error
      }
    }

    const result = await cloudinary.uploader.upload(uploadInput, {
      public_id: publicIdBase,
      folder: folder,
      resource_type: "auto",
      overwrite: true,
      invalidate: true,
      unique_filename: false,
    })

    devLog("Imagen subida a Cloudinary correctamente:", result.secure_url)
    return result.secure_url
  } catch (error) {
    devError("Error al subir imagen a Cloudinary:", {
      message: error.message,
      name: error.name,
      http_code: error.http_code,
    })
    throw new Error("Error al subir imagen: " + error.message)
  }
}

export async function deleteImage(imageUrl) {
  try {
    const urlParts = imageUrl.split("/")
    const filename = urlParts[urlParts.length - 1].split(".")[0]
    const folder = urlParts.slice(urlParts.indexOf("WorkSpaceBCN"), -1).join("/")
    const publicId = `${folder}/${filename}`

    await cloudinary.uploader.destroy(publicId)
    devLog("Imagen eliminada de Cloudinary:", publicId)
    return true
  } catch (error) {
    devError("Error al eliminar imagen:", error.message)
    return false
  }
}

export default cloudinary
