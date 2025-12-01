import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

let customerToken;
let targetProduct;
let initialStock;

const TEST_USER = {
    email: 'maria.rodriguez@email.com',
    password: 'password123'
};

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Flujo de Negocio Completo: Compra y Gestión de Stock', () => {

    test('1. Preparación: Identificar un producto con stock', async () => {
        targetProduct = await Product.findOne({ stock: { $gt: 0 } });
        expect(targetProduct).toBeDefined();
        initialStock = targetProduct.stock;
        console.log(`Producto seleccionado: ${targetProduct.name} (Stock inicial: ${initialStock})`);
    });

    test('2. Autenticación: Login como Cliente', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        customerToken = res.body.token;
    });

    test('3. Transacción: Crear una Orden (Comprar)', async () => {
        const orderData = {
            items: [
                {
                    product: targetProduct._id,
                    name: targetProduct.name,
                    quantity: 1,
                    unitPrice: targetProduct.price,
                    image: targetProduct.image
                }
            ],
            shippingAddress: {
                street: 'Calle Test 123',
                city: 'Barcelona',
                postalCode: '08001',
                country: 'España'
            },
            paymentMethod: 'tarjeta',
            itemsPrice: targetProduct.price,
            shippingPrice: 0,
            taxPrice: targetProduct.price * 0.21,
            totalPrice: targetProduct.price * 1.21
        };

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(orderData);

        if (res.statusCode !== 201) {
            console.error('Error creando orden:', res.body);
        }

        expect(res.statusCode).toEqual(201);
        expect(res.body.order).toHaveProperty('_id');
        console.log(`Orden creada ID: ${res.body.order._id}`);
    });

    test('4. Validación de Negocio: El stock debe haber disminuido', async () => {
        const updatedProduct = await Product.findById(targetProduct._id);
        
        console.log(`Stock anterior: ${initialStock}, Stock actual: ${updatedProduct.stock}`);
        
        expect(updatedProduct.stock).toBe(initialStock - 1);
    });

    test('5. Validación de Relaciones: La orden pertenece al usuario', async () => {
        const res = await request(app)
            .get('/api/orders/me')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.orders)).toBe(true);
        expect(res.body.orders.length).toBeGreaterThan(0);
        
        const hasProduct = res.body.orders.some(order => 
            order.items.some(item => {
                const productId = item.product._id || item.product;
                return productId.toString() === targetProduct._id.toString();
            })
        );
        expect(hasProduct).toBe(true);
    });
});
