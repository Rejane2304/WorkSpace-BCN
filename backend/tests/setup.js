import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

let mongod;

/**
 * Conecta a la base de datos de prueba en memoria (MongoDB Memory Server)
 */
export const connectTestDatabase = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`MongoDB Memory Server conectado: ${uri}`);
};

/**
 * Desconecta y limpia la base de datos de prueba
 */
export const disconnectTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
  console.log('MongoDB Memory Server detenido');
};

/**
 * Limpia todos los datos de las colecciones sin cerrar la conexión
 */
export const clearTestData = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Crea usuarios y productos de prueba necesarios para los tests
 * - Usuario cliente: maria.rodriguez@email.com / password123
 * - Usuario admin: admin@workspacebcn.com / admin123
 * - Productos con stock > 0
 */
export const seedTestData = async () => {
  // Crear usuario cliente
  const clienteUser = await User.create({
    name: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    password: 'password123',
    role: 'cliente',
    phone: '612345678',
    address: 'Calle Test 123',
    city: 'Barcelona',
    postalCode: '08001'
  });

  // Crear usuario admin
  const adminUser = await User.create({
    name: 'Administrador',
    email: 'admin@workspacebcn.com',
    password: 'admin123',
    role: 'admin',
    phone: '612345679',
    address: 'Oficina Central',
    city: 'Barcelona',
    postalCode: '08002'
  });

  // Crear productos de prueba con stock > 0
  const products = await Product.create([
    {
      category: 'Informática',
      name: 'Laptop Dell Inspiron 15',
      description: 'Laptop para trabajo y estudio',
      price: 699.99,
      stock: 10,
      minStock: 2,
      maxStock: 50,
      image: 'https://example.com/laptop.jpg'
    },
    {
      category: 'Oficina',
      name: 'Silla Ergonómica',
      description: 'Silla de oficina ergonómica',
      price: 199.99,
      stock: 20,
      minStock: 5,
      maxStock: 100,
      image: 'https://example.com/silla.jpg'
    },
    {
      category: 'Audiovisual',
      name: 'Monitor 27 pulgadas',
      description: 'Monitor 4K para diseño',
      price: 399.99,
      stock: 15,
      minStock: 3,
      maxStock: 60,
      image: 'https://example.com/monitor.jpg'
    }
  ]);

  console.log('Datos de prueba insertados correctamente');

  return {
    users: {
      cliente: clienteUser,
      admin: adminUser
    },
    products
  };
};
