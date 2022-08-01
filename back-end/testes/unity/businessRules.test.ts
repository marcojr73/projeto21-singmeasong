import { jest } from "@jest/globals";
import {prisma} from "../../src/database.js"

import { recommendationService } from "../../src/services/recommendationsService.js"
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js"

beforeEach(async ()=> {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`
})

describe("insert recommendations", () => {
  it("should create recommendation", async () => {
    const createRecommendationData = {
      name: "osvaldo",
      youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA"
    }
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {null})
    jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => {null})
    await recommendationService.insert(createRecommendationData)
    expect(recommendationRepository.create).toBeCalled()
  });

  it("should fail to create duplicate recommendation", async () => {
    const createRecommendationData = {
      name: "osvaldo",
      youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA"
    }
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {return true})
    const promisse = recommendationService.insert(createRecommendationData)
    expect(promisse).rejects.toEqual({type: "conflict", message: "Recommendations names must be unique"})
  });
});

describe("upvote on video", () => {
  it("shold upvote on video", async ()=> {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {return true})
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {return null})
    await recommendationService.upvote(1)
    expect(recommendationRepository.updateScore).toBeCalled()
  })

  it("shold fail to upvote on fake video", async ()=> {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {return false})
    const promisse = recommendationService.upvote(1)
    expect(promisse).rejects.toEqual({type: "not_found", message: ""})
  })

})

describe("downvote on video", () => {
  
  it("shold downvote on video and keep recommendation", async ()=> {
    const recommendation = {
      id: 1,
      name: "string",
      youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA",
      score: 4
    }
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {return true})
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {return recommendation})
    jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {return null})
    await recommendationService.downvote(recommendation.id)
    expect(recommendationRepository.updateScore).toBeCalled()
    expect(recommendationRepository.remove).not.toBeCalled()
  })
  it("shold downvote on video and remove recommendation", async ()=> {
    const recommendation = {
      id: 1,
      name: "string",
      youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA",
      score: -6
    }
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {return true})
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {return recommendation})
    jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {return null})
    await recommendationService.downvote(recommendation.id)
    expect(recommendationRepository.updateScore).toBeCalled()
    expect(recommendationRepository.remove).toBeCalled()
  })
  
  it("shold fail to upvote on fake video", async ()=> {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {return false})
    const promisse = recommendationService.downvote(1)
    expect(promisse).rejects.toEqual({type: "not_found", message: ""})
  })
})

describe("list last recommendations", ()=>{
  it("shold return last recomendations", async() => {
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(():any => {return null})
    await recommendationService.get()
    expect(recommendationRepository.findAll).toBeCalled()
  })
})

describe("get an randon recomendation", ()=>{
  it("shold return an recommendation score for score > 0.7", async() => {
    const recommendation = [{
      id: 1,
      name: "string",
      youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA",
      score: 4
    }]
    jest.spyOn(Math, "random").mockReturnValueOnce(0.8)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {return recommendation})
    const response = await recommendationService.getRandom()
    expect(response.name).toEqual(recommendation[0].name)
  })
  it("shold return an recommendation score for score < 0.7", async() => {
    const recommendation = [{
      id: 1,
      name: "string",
      youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA",
      score: 4
    }]
    jest.spyOn(Math, "random").mockReturnValueOnce(0.6)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {return recommendation})
    const response = await recommendationService.getRandom()
    expect(response.name).toEqual(recommendation[0].name)
  })
  it("should fail if there are no recommendations", async() => {
    const recommendation = []
    jest.spyOn(Math, "random").mockReturnValueOnce(0.6)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {return recommendation})
    const response = recommendationService.getRandom()
    expect(response).rejects.toEqual({type: "not_found", message: ""})
  })
})
describe("list top score recommendations", ()=>{
  it("shold return list recommendations", async() => {
  const recommendation = {
    id: 1,
    name: "string",
    youtubeLink: "https://www.youtube.com/shorts/i0zptaVOTxA",
    score: 4
  }
    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => {return recommendation})
    const response = await recommendationService.getTop(1)
    expect(response).toEqual(recommendation)
  })
})