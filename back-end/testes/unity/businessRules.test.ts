import { jest } from "@jest/globals";
import { faker } from "@faker-js/faker";

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";


import dotenv from "dotenv"
dotenv.config()
console.log("tests running on base" + process.env.DATABASE_URL)

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