import { faker } from "@faker-js/faker";
import {prisma} from "../../src/database.js"

function createDataPostRecommendation(){
    const data = {
        name: faker.name.findName(),
        youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA"
    }
    return data
}

async function createRecommendation(){
    const data = createDataPostRecommendation()
    await prisma.recommendation.create({
        data,
    })
    return await prisma.recommendation.findUnique({
        where:{name: data.name}
    })
}

function randonId() {
    const min = Math.ceil(0);
    const max = Math.floor(1000);
    return Math.floor(Math.random() * (max - min)) + min;
}

async function createRecommendationBadScore(){
    const data = createDataPostRecommendation()
    await prisma.recommendation.create({
        data,
    })
    const recommendation = await prisma.recommendation.findUnique({
        where:{name: data.name}
    })
    await prisma.recommendation.update({
        where: { id: recommendation.id},
        data: {
          score: { ["decrement"]: -6 },
        },
    })
    return recommendation
}

export {
    createDataPostRecommendation,
    createRecommendation,
    randonId,
    createRecommendationBadScore
}