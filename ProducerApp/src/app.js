import express from "express"
import dotenv from "dotenv"
import jwtVerify from "./middleware.js"
import jwt from "jsonwebtoken"
import morgan from "morgan"
import { createTopics } from "./kafka-admin.js"
import { createUpdates } from "./kakfa-producer.js"

dotenv.config({
    path: "./.env",
    debug: process.env.NODE_ENV === 'development'
})

const port = 8000
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: '1mb'}))

app.use(morgan("dev"))

app.get('/', (_, res)=>{
    res.status(200).json({
        message: "Welcome to Scalable Notification System.",
        statusCode: 200,
        success: true,
        data: {
            bearerToken: jwt.sign(Math.random().toString(), process.env.AUTH_TOKEN)
        }
    })
})

app.post('/create-topics/:id', jwtVerify, (req, res)=>{
    const id = req.params.id
    try {
        if(!id.trim()) throw new Error("Id is required params")
        createTopics(id.trim())
        res.status(200).json({
            message: "kafka topic created successfully.",
            statusCode: 201,
            success: true,
            data: {
                topicName: id.trim()
            }
        })
    } catch (error) {
        res.status(400).json({
            message: error?.message ?? "Some error occured",
            statusCode: 400,
            success: false
        })
    }
})

app.post('/notify', jwtVerify, (req, res)=>{    
    try {
        createUpdates("transactional_notify", "notification", {
            to: req.body['to'],
            message: req.body['message']
        })

        res.status(200).json({
            message: "Notification queued successfully.",
            statusCode: 200,
            success: true
        })
    } catch (error) {
        res.status(400).json({
            message: error?.message ?? "Some error occured",
            statusCode: 400,
            success: false
        })
    }
})

app.listen(port, ()=>{
    console.log(`App is running on port ${port}`)
})