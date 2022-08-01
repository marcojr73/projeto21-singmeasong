import { faker } from "@faker-js/faker"

const URL_APP = "http://localhost:3000/"


Cypress.Commands.add("resetDatabase", () => {
  cy.request("DELETE", "http://localhost:5000/recommendations/delete/").as(
    "resetDatabase"
  )
})
Cypress.Commands.add("createRecommendation", () => {
	const recommendation = {
		name: faker.name.findName(),
		link: "https://www.youtube.com/shorts/i0zptaVOTxA",
	  }
	  cy.visit(URL_APP)
	  cy.get("#name").type(recommendation.name)
	  cy.get("#url").type(recommendation.link)
	  cy.get("#button").click()
});