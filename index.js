const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqpsw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function run() {
    try {
        await client.connect()
        const activityCollection = client.db('community-builder').collection('activity')
        const bookingCollection = client.db('community-builder').collection('booking')

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

        app.get('/book', async (req, res) => {
            const email = req.query.email
            const query = { email }
            const cursor = bookingCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/book', async (req, res) => {
            const bookingDetails = req.body
            console.log(bookingDetails)
            const result = await bookingCollection.insertOne(bookingDetails)
            res.send(result)
        })
    } finally {
    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log('Listening to port', port)
})
