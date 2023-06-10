import request from 'supertest';
import { ObjectId } from 'mongodb';
import { app, server, db } from './index';

beforeAll(async () => {

    let { default: customers } = await import('./customers.json');
    // convert string ids to ObjectIds
    customers = customers.map(c => {
        c['_id'] = new ObjectId(c['_id']['$oid']);
        return c;
    });
    // restore sample customers in db    
    await customers.forEach(c => {
        db.collection
            .replaceOne({ _id: c['_id'] }, c, { upsert: true })
            .then(result => {
                console.log("updated customer %s", c.firstName);
            })
    });

});


describe('GET /customers', () => {
    it('sollte Statuscode 200 zurückgeben', async () => {
        const response = await request(app).get('/customers');

        expect(response.statusCode).toBe(200);
    });
});

describe('GET /customers/:id', () => {
    it('sollte Statuscode 404 zurückgeben, falls der Kunde nicht existiert', async () => {
        const response = await request(app).get('/customers/647f16c04088d9a6028aaa0a');

        expect(response.statusCode).toBe(404);
    });
});

describe('GET /customers/:id', () => {
    it('sollte Statuscode 200 zurückgeben, falls der Kunde existiert', async () => {
        const response = await request(app).get('/customers/647f1654be8df684218752bb');

        expect(response.statusCode).toBe(200);
    });
});







describe('POST /customers', () => {
    it('sollte Statuscode 201 zurückgeben, falls der Kunde erstellt wurde', async () => {
        let jsonData = 
        {
            "firstName": "Test",
            "lastName": "Testt",
            "email": "Test.Testt@darkside.moon",
            "street": "Teststraße 1",
            "city": "Teststadt",
            "zip": "11111"
        }
    
        
        
        const response = await request(app).post('/customers').send(jsonData);

        expect(response.statusCode).toBe(201);
    });
});

describe('POST /customers', () => {
    it('sollte Statuscode 400 zurückgeben, da der zipcode fehlt und daher nicht erstellt werden kann', async () => {
        let jsonData = 
        {
            "firstName": "Test",
            "lastName": "Testt",
            "email": "Test.Testt@darkside.moon",
            "street": "Teststraße 1",
            "city": "Teststadt",
        }        
        
        const response = await request(app).post('/customers').send(jsonData);
        expect(response.statusCode).toBe(400);
    });
});

describe('PUT /customers/:id', () => {
    it('sollte Statuscode 200 zurückgeben, falls der Kunde erstellt wurde', async () => {
        const jsonData = 
        {
            "firstName": "Test 2",
            "lastName": "Testt 2",
            "email": "Test.Testt@darkside.moon",
            "street": "Teststraße 2",
            "city": "Teststadt",
        };
        
        const response = await request(app).put('/customers/64846d029f13da3e27dd6585').send(jsonData);

        expect(response.statusCode).toBe(200);
    });
});

describe('DELETE /customers/:id', () => {
    it('sollte Statuscode 204 zurückgeben, falls der Kunde gelöscht wurde', async () => {
        const jsonData = 
        {
            "id": "64846f87da508f4046ed0a81",
            "firstName": "Loesch",
            "lastName": "Test",
            "email": "loesch.test@darkside.moon",
            "street": "loeschenstr 1",
            "city": "Loeschstadt",
            "zip": "99999"
        }
        
        let customer = await request(app).post('/customers').send(jsonData);
        await request(app).delete('/customers/' + customer.id);
        
        const response = await request(app).get('/customers/' + customer.id);

        expect(response.statusCode).toBe(204);
    });
});









afterAll(async () => {
    await server.close()
    await db.close()
});


