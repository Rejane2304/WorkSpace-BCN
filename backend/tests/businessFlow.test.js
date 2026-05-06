import request from 'supertest';
import app from '../server.js';
import Product from '../src/models/Product.js';
import { connectTestDatabase, disconnectTestDatabase, clearTestData, seedTestData } from './setup.js';

let customerToken;
let targetProduct;
let initialStock;
let createdOrderId;
let createdSaleId;

const TEST_USER = {
    email: 'maria.rodriguez@email.com',
    password: 'password123'
};

describe('Flujo de Negocio Completo: Compra y Gestión de Stock', () => {

    beforeAll(async () => {
        await connectTestDatabase();
    }, 30000);

    afterAll(async () => {
        await disconnectTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
        await seedTestData();
    });

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
        // Asegurar que tenemos un producto disponible
        targetProduct = await Product.findOne({ stock: { $gt: 0 } });
        expect(targetProduct).toBeDefined();
        initialStock = targetProduct.stock;

        // Login primero
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            });
        customerToken = loginRes.body.token;

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
        createdOrderId = res.body.order._id;
        if (res.body.sale) {
            createdSaleId = res.body.sale._id;
        }
        console.log(`Orden creada ID: ${res.body.order._id}`);
    });

    test('4. Validación de Negocio: El stock debe haber disminuido', async () => {
        // Setup: crear producto y hacer login
        targetProduct = await Product.findOne({ stock: { $gt: 0 } });
        expect(targetProduct).toBeDefined();
        initialStock = targetProduct.stock;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            });
        customerToken = loginRes.body.token;

        // Crear orden
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

        await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(orderData);

        // Validar que el stock disminuyó
        const updatedProduct = await Product.findById(targetProduct._id);

        console.log(`Stock anterior: ${initialStock}, Stock actual: ${updatedProduct.stock}`);

        expect(updatedProduct.stock).toBe(initialStock - 1);
    });

    test('5. Validación de Relaciones: La orden pertenece al usuario', async () => {
        // Setup: crear producto y hacer login
        targetProduct = await Product.findOne({ stock: { $gt: 0 } });
        expect(targetProduct).toBeDefined();

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            });
        customerToken = loginRes.body.token;

        // Crear orden
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

        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send(orderData);

        expect(orderRes.statusCode).toEqual(201);

        // Validar que la orden pertenece al usuario
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
