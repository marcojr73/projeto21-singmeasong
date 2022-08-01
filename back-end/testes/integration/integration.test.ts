import { prisma } from "../../src/database.js"
import supertest from "supertest"
import * as factory from "../factory/factory.js"

import app from "../../src/app.js"
import dotenv from "dotenv"

dotenv.config()

console.log("tests running on base" + process.env.DATABASE_URL)

beforeEach(async ()=> {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
})

describe("validation post recommendation", ()=> {
    it("should create an recommendation", async() => {
        const data = await factory.createDataPostRecommendation()
        const response = await supertest(app).post("/recommendations").send(data)
        expect(response.statusCode).toBe(201)
    })

    it("should fail to duplicate recommendation", async() => {
        const data = await factory.createDataPostRecommendation()
        await supertest(app).post("/recommendations").send(data)
        const response = await supertest(app).post("/recommendations").send(data)
        expect(response.statusCode).toBe(409)
    })

    it("should fail to send incorrect data", async() => {
        const data = null
        await supertest(app).post("/recommendations").send(data)
        const response = await supertest(app).post("/recommendations").send(data)
        expect(response.statusCode).toBe(422)
    })
})

describe("validation post upvote", ()=> {
    it("should upvote on the video", async() => {
        const recommendation = await factory.createRecommendation()
        const response = await supertest(app).post(`/recommendations/${recommendation.id}/upvote`)
        expect(response.statusCode).toBe(200)
    })
    it("should fail to upvote on inexist video", async() => {
        const id = factory.randonId()
        const response = await supertest(app).post(`/recommendations/${id}/upvote`)
        expect(response.statusCode).toBe(404)
    })
})

describe("validation post downvote", ()=> {
    it("should downvote on the video", async() => {
        const recommendation = await factory.createRecommendation()
        const response = await supertest(app).post(`/recommendations/${recommendation.id}/downvote`)
        expect(response.statusCode).toBe(200)
    })
    it("should downvote on the video and remove recommendation", async() => {
        const recommendation = await factory.createRecommendationBadScore()
        const response = await supertest(app).post(`/recommendations/${recommendation.id}/downvote`)
        const exist = await prisma.recommendation.findUnique({
            where: { name: recommendation.name }
        })
        console.log(exist)
        expect(exist).toBeNull();
        expect(response.statusCode).toBe(200)
    })
    it("should fail to downvote on inexist video", async() => {
        const id = factory.randonId()
        const response = await supertest(app).post(`/recommendations/${id}/downvote`)
        expect(response.statusCode).toBe(404)
    })
})
describe("get recommendations", ()=> {
    it("should list all recommendations", async() => {
        const recommendations = await supertest(app).get("/recommendations")
        expect(recommendations.statusCode).toBe(200)
    })
    it("should list an recommendations", async() => {
        const recommendation = await factory.createRecommendation()
        const response  = await supertest(app).get(`/recommendations/${recommendation.id}`)
        expect(response.statusCode).toBe(200)
    })
    it("should fail to get an non existent recommendation", async() => {
        const response  = await supertest(app).get(`/recommendations/1`)
        expect(response.statusCode).toBe(404)
    })
    it("should list an random recommendation", async() => {
        await factory.createRecommendation()
        const response  = await supertest(app).get("/recommendations/random")
        expect(response.statusCode).toBe(200)
    })
    it("should fail to list a random recommendation in an empty list", async() => {
        const response  = await supertest(app).get("/recommendations/random")
        expect(response.statusCode).toBe(404)
    })
    it("should list top recommendations", async() => {
        await factory.createRecommendation()
        const response  = await supertest(app).get("/recommendations/top/1")
        expect(response.statusCode).toBe(200)
    })
})