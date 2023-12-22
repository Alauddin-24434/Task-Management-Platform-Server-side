const express = require('express')
const cors = require('cors')
// const axios = require('axios');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
    origin: ['http://localhost:5173',],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())




// Mongo db Driver collection code start hare


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ldebrq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // all collection start hare 

        const userRoleCollection = client.db('TaskManagementDB').collection('users')
        const taskCollection = client.db('TaskManagementDB').collection('tasks')
        const kanbanCollection = client.db('TaskManagementDB').collection('kanban')


        // tasks collection code start hare ----------------


        app.post('/tasks', async (req, res) => {
            try {
                const newTask = req.body;
                const result = await taskCollection.insertOne(newTask);
                res.send(result)
            } catch (error) {
                console.error('Error creating task:', error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
        app.post('/prac-kanban', async (req, res) => {
            try {
                const newTask = req.body;
                const result = await kanbanCollection.insertOne(newTask);
                res.send(result)
            } catch (error) {
                console.error('Error creating task:', error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // app.get('/user/:email', async (req, res) => {
        //     try {
        //         const email = req.params.email;

        //         const result = await kanbanCollection.findOne({ email })
        //         res.send(result)
        //     }
        //     catch (err) {
        //         console.log(err)
        //     }
        // })

        // Handle POST requests to '/prac-kanban'
        // app.post('', (req, res) => {
        //     const { boards } = req.body;

        //     // In a real application, you would handle the boards data, e.g., store it in a database.

        //     // For this example, we'll simply send a response echoing the received data.
        //     res.json({ message: 'Data received successfully', boards });
        // });

        app.get('/tasks', async (req, res) => {
            try {
                const cursor = taskCollection.find()
                const result = await cursor.toArray()
                res.send(result)
            }
            catch (err) {
                console.log(err)
            }
        })


        // Backend route to handle the update of task order
        app.patch('/tasks/update-order', async (req, res) => {
            const { tasks } = req.body;

            try {
                for (const task of tasks) {
                    // Assuming each task object has an _id field
                    await taskCollection.updateOne({ _id: task._id }, { order: tasks.indexOf(task) });

                }

                res.status(200).json({ message: 'Task order updated successfully' });
            } catch (error) {
                console.error('Error updating task order:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }

        });
        // 3----------------------- userRoleCollection code start hare -----------------

        app.get('/users', async (req, res) => {
            try {
                const cursor = userRoleCollection.find()
                const result = await cursor.toArray()
                res.send(result)
            }
            catch (err) {
                console.log(err)
            }
        })

        app.delete('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await userRoleCollection.deleteOne(query);

                // Check if the deletion was successful
                if (result.deletedCount === 1) {
                    res.status(204).send(); // 204 No Content indicates success
                } else {
                    res.status(404).send({ error: 'Review not found' });
                }
            } catch (err) {
                console.error(err);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
        app.patch('/users/:id', async (req, res) => {
            const userId = req.params.id;
            const { role } = req.body;

            try {
                const filter = { _id: new ObjectId(userId) };
                const update = { $set: { role: role } };

                const result = await userRoleCollection.updateOne(filter, update);

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const updatedUser = await userRoleCollection.findOne(filter);

                res.json(updatedUser);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/user/:email', async (req, res) => {
            try {
                const email = req.params.email;

                const result = await userRoleCollection.findOne({ email })
                res.send(result)
            }
            catch (err) {
                console.log(err)
            }
        })


        // Save or modify user email, status in DB
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const isExist = await userRoleCollection.findOne(query)
            console.log('User found?----->', isExist)
            if (isExist) return res.send(isExist)
            const result = await userRoleCollection.updateOne(
                query,
                {
                    $set: { ...user, timestamp: Date.now() },
                },
                options
            )
            res.send(result)
        })





        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Task Management Server is running")
})

app.listen(port, () => {
    console.log(`Task Management Server is running: ${port}`)
})