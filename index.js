const express = require('express');
var cors = require('cors');
const app = express();
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ctdj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const userCollection = client.db("carparts").collection("products");
        const orderCollection = client.db("carparts").collection("orders");
        const reviewCollection = client.db("carparts").collection("reviews");

        //Get Products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.post('/reviews', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const result = await reviewCollection.insertOne(newUser);
            res.send(result);

        });

        //Get Product By Id

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });


        app.get('/myorder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const addusers = await cursor.toArray();
            res.send(addusers);
        });

        // Add Orders

        app.post('/order', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const result = await orderCollection.insertOne(newUser);
            res.send(result);

        });


    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Car Parts House!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})