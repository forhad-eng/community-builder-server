const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')
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

        app.get('/', async (req, res) => {
            const cursor = activityCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })
    } finally {
    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log('Listening to port', port)
})
