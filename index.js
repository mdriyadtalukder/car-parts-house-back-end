const express = require('express');
var cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })

}

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ctdj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const userCollection = client.db("carparts").collection("products");
        const orderCollection = client.db("carparts").collection("orders");
        const reviewCollection = client.db("carparts").collection("reviews");
        const usersCollection = client.db("carparts").collection("users");

        //Get Products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        });

        app.get('/allproducts', verifyJWT, async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        });

        app.post('/products', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);

        });

        app.delete('/allproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);

        });
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });


        });

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await usersCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };

                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Forbidden' });
            }


        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,

            };

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });

        })

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

        app.get('/order', verifyJWT, async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        });


        app.get('/myorder', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const addusers = await cursor.toArray();
                res.send(addusers);
            }
            else {
                res.status(403).send({ message: 'forbidden access' });
            }
        });

        app.get('/myorder/:id',  async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        })

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