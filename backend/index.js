import express from 'express';
import DB from './db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;
import {check, checkExact, validationResult } from 'express-validator';
import { Collection } from 'mongodb';
//const { body, validationResult } = require('express-validator');

/** Zentrales Objekt für unsere Express-Applikation */
const app = express();

app.use(express.json());

/** global instance of our database */
let db = new DB();

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Customer API',
        version: '1.0.0',
        description: 'Customer API Dokumentation',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        schemas: {
          Customer: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
              },
              lastName: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              street: {
                type: 'string',
              },
              zip: {
                type: 'integer',
              },
              city: {
                type: 'string',
              },
            },
          },
        },
      }
    },
    apis: ['./index.js'], 
  };

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const customerValidationRules = [
    check('firstName')
      .notEmpty()
      .withMessage('Vorname darf nicht leer sein'),
    check('lastName')
      .notEmpty()
      .withMessage('Nachname darf nicht leer sein'),
    check('email')
      .notEmpty()
      .withMessage('E-Mail darf nicht leer sein'),
    check('street')
      .notEmpty()
      .withMessage('Straße darf nicht leer sein'),
    check('zip')
      .notEmpty()
      .withMessage('PLZ darf nicht leer sein'),
    check('city')
      .notEmpty()
      .withMessage('Stadt darf nicht leer sein'),
  ];



// implement API routes

/** Return all customers. 
 *  Be aware that the db methods return promises, so we need to use either `await` or `then` here! 
 * 
 */
/**
 * @swagger
 * /customers:
 *  get:
 *    summary: Gibt alle Kunden zurück
 *    tags: [Customers]
 *    responses:
 *      '200':
 *        description: Eine Liste aller Kunden
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Customer'
 */
app.get('/customers', async (req, res) => {
    let customers = await db.queryAll();
    res.send(customers);
});


/** Return a single customer by id 
 * 
 */
/**
 * @swagger
 * /customers/{id}:
 *  get:
 *    summary: Gibt einen Kunden zurück
 *    tags: [Customers] 
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to retrieve.
 *         schema:
 *           type: string
 *    responses:
 *      '200':
 *        description: Ein Kunde wird zurückgegeben
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                $ref: '#/components/schemas/Customer'
 *      '404':
 *        description: Der Kunde mit der spezifizierten ID wurde nicht gefunden.
 */
app.get('/customers/:id', async (req, res) => {
    // TODO: Implement query by id
    let customer = await db.queryById(req.params.id);
    if(!customer)
        res.sendStatus(404);
    else
        res.send(customer);
});

/** Create a new customer
 *
 */
/**
 * @swagger
 * /customers:
 *  post:
 *    summary: Erstellt einen Kunden Datensatz
 *    tags: [Customers] 
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
*           schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                description: Der Vorname des Kunden.
 *                example: John
 *              lastName:
 *                type: string
 *                description: Der Nachname des Kunden.
 *                example: Doe
 *              email:
 *                type: string
 *                description: Die E-Mail des Kunden.
 *                example: john.doe@skynet.org
 *              street:
 *                type: string
 *                description: Die Straße des Kunden.
 *                example: Musterstraße 1
 *              zip:
 *                type: integer
 *                description: Die PLZ des Kunden.
 *                example: 12345
 *              city:
 *                type: string
 *                description: Die Stadt des Kunden.
 *                example: Musterstadt
 *    responses:
 *      '201':
 *        description: Ein Customer wurde erstellt
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                firstName:
 *                  type: string
 *                  description: Der Vorname des Kunden.
 *                  example: John
 *                lastName:
 *                  type: string
 *                  description: Der Nachname des Kunden.
 *                  example: Doe
 *                email:
 *                  type: string
 *                  description: Die E-Mail des Kunden.
 *                  example: john.doe@skynet.org
 *                street:
 *                  type: string
 *                  description: Die Straße des Kunden.
 *                  example: Musterstraße 1
 *                zip:
 *                  type: integer
 *                  description: Die PLZ des Kunden.
 *                  example: 12345
 *                city:
 *                  type: string
 *                  description: Die Stadt des Kunden.
 *                  example: Musterstadt
 *              items:
 *                $ref: '#/components/schemas/Customer'
 *      '400':
 *        description: Der Benutzer konnte mit den spezifizierten Werten nicht erstellt werden.
 */
app.post('/customers', checkExact(customerValidationRules), async (req, res) => {
    // TODO: Implement insert
    const errors = validationResult(req);
    if(!errors.isEmpty())
        res.sendStatus(400);
    else
    {
        let reqjson = req.body;
        db.insert(reqjson);
        res.sendStatus(201);
    }
});

/** Update an existing customer
 * 
 */
/**
 * @swagger
 * /customers/{id}:
 *  put:
 *    summary: Erstellt einen Kunden Datensatz
 *    tags: [Customers]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
*           schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                description: Der Vorname des Kunden.
 *                example: John
 *              lastName:
 *                type: string
 *                description: Der Nachname des Kunden.
 *                example: Doe
 *              email:
 *                type: string
 *                description: Die E-Mail des Kunden.
 *                example: john.doe@skynet.org
 *              street:
 *                type: string
 *                description: Die Straße des Kunden.
 *                example: Musterstraße 1
 *              zip:
 *                type: integer
 *                description: Die PLZ des Kunden.
 *                example: 12345
 *              city:
 *                type: string
 *                description: Die Stadt des Kunden.
 *                example: Musterstadt
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to retrieve.
 *         schema:
 *           type: integer 
 *    responses:
 *      '200':
 *        description: Ein Customer wurde aktualisiert bzw. erstellt
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                firstName:
 *                  type: string
 *                  description: Der Vorname des Kunden.
 *                  example: John
 *                lastName:
 *                  type: string
 *                  description: Der Nachname des Kunden.
 *                  example: Doe
 *                email:
 *                  type: string
 *                  description: Die E-Mail des Kunden.
 *                  example: john.doe@skynet.org
 *                street:
 *                  type: string
 *                  description: Die Straße des Kunden.
 *                  example: Musterstraße 1
 *                zip:
 *                  type: integer
 *                  description: Die PLZ des Kunden.
 *                  example: 12345
 *                city:
 *                  type: string
 *                  description: Die Stadt des Kunden.
 *                  example: Musterstadt
 *              items:
 *                $ref: '#/components/schemas/Customer'
 *      '400':
 *        description: Der Benutzer konnte mit den spezifizierten Werten nicht erstellt werden.
 *      '404':
 *        description: Der Benutzer konnte nicht gefunden werden
 * 
 */
app.put('/customers/:id', customerValidationRules, async (req, res) => {
    // TODO: Implement update
    const customer = await db.queryById(req.params.id)

    const errors = validationResult(req);
    if(!customer)
        res.sendStatus(404);
    else if(!errors.isEmpty())
        res.sendStatus(400);
    else
    {
        let reqjson = req.body;
        await db.update(req.params.id, reqjson);
        res.sendStatus(200);
    }
});


/** Delete a customer by id
 *
 */
/**
 * @swagger
 * /customers/{id}:
 *  delete:
 *    summary: Löscht einen Kunden aus der DB
 *    tags: [Customers] 
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to retrieve.
 *         schema:
 *           type: integer
 *    responses:
 *      '204':
 *        description: Ein Kunde wurde gelöscht
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                $ref: '#/components/schemas/Customer'
 *      '404':
 *        description: Der Kunde mit der spezifizierten ID wurde nicht gefunden.
 */
app.delete('/customers/:id', async (req, res) => {
    // TODO: Implement delete
    const customer = await db.queryById(req.params.id);
    if(!customer)
        res.sendStatus(404);
    else
    {
	    await db.delete(req.params.id);
        res.sendStatus(204);
    }
});

let server;
await db.connect()
    .then(() => {
        return app.listen(PORT)
    })
    .then(s => {
        server = s;
        console.log(`Server listening on port ${PORT}`);
    });

export { app, server, db }
