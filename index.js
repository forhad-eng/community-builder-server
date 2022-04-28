const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqpsw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function run() {
    try {
        await client.connect()
        const activityCollection = client.db('community-builder').collection('activity')
        const bookingCollection = client.db('community-builder').collection('booking')

        //access token
        app.post('/login', (req, res) => {
            const email = req.body
            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ accessToken })
        })

        //activity collection apis
        app.get('/', async (req, res) => {
            const cursor = activityCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/activity/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const activity = await activityCollection.findOne(query)
            res.send(activity)
        })

        app.post('/activity', async (req, res) => {
            const activity = req.body
            const result = await activityCollection.insertOne(activity)
            res.send(result)
        })

        //booking collection apis
        app.get('/book', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if (email === decodedEmail) {
                const query = { email }
                const cursor = bookingCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            } else {
                const cursor = bookingCollection.find({})
                const result = await cursor.toArray()
                res.send(result)
            }
        })

        app.post('/book', async (req, res) => {
            const bookingDetails = req.body
            const result = await bookingCollection.insertOne(bookingDetails)
            res.send(result)
        })

        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })
    } finally {
    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log('Listening to port', port)
})
