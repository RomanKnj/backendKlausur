import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/customers';
const MONGO_DB = process.env.MONGO_DB || 'customers';


export default class DB {
    /** Connect to MongoDB and open client */
    connect() {
        return MongoClient.connect(MONGO_URI)
            .then((_client) => {
                this.client = _client;
                this.db = this.client.db(MONGO_DB);
                this.collection = this.db.collection('customers');
                console.log("Connected to MongoDB");
            })
    }

    /** Close client connection to MongoDB 
     * @returns {Promise} - Promise that resolves when connection is closed
    */
    close() {
        return this.client.close()
    }

    /** Query all customers from database
     * @returns {Promise} - Promise that resolves to an array of customers
     */
    queryAll() {
        return this.collection.find().toArray();
    }

    /** Query a single customer by id
     * @param {string} id - id of customer to query
     * @returns {Promise} - Promise that resolves to a customer object 
     */
    async queryById(id) {
        // TODO: Implement query by id
        const query = {'_id': new ObjectId(id)};
        let customer = await this.collection.findOne(query);
        return customer;
    }

    /** Update customer by id
     * @param {string} id - id of customer to update
     * @returns {Promise} - Promise with updated customer
     */
    async update(id, customer) {
        //TODO: Implement update
        const query = {'_id': new ObjectId(id)};
        let newValues = { $set: {firstName: customer.firstName, lastName: customer.lastName, email: customer.email , street: customer.street, zip: customer.zip, city: customer.city } }; 
        await this.collection.updateOne(query, newValues);
    }

    /** Delete customer by id
     * @param {string} id - id of customer to delete
     * @returns {Promise} - Promise with deleted customer
     */
    async delete(id) {
        // TODO: Implement delete
        const query = {'_id': new ObjectId(id)};
        await this.collection.deleteOne(query);
    }

    /** Insert customer
     * @param {object} customer - customer to insert
     * @returns {Promise} - Promise with inserted customer
     */
    insert(customer) {
        // TODO: Implement insert
        if(!customer.id)
            customer._id = new ObjectId();
        else
            customer._id = new ObjectId(customer.id);
        this.collection.insertOne(customer);
    }
}