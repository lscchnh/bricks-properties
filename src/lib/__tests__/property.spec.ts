import { describe, expect, it } from "vitest";
import { isLocated, normalizeProperty } from "../property";

describe("normalizeProperty", () => {
  it("reads the historical Bricks.co API shape", () => {
    const property = normalizeProperty({
      id: 42,
      address: { fr: "12 rue de la Paix, 75002 Paris" },
      imageGallery: ["https://img.example/1.jpg"],
      returnOnInvestment: 7.456,
      rentalDividends: 4.2,
      investorBricks: { owned: 30 },
    });

    expect(property).toEqual({
      id: "42",
      address: "12 rue de la Paix, 75002 Paris",
      bricksOwned: 30,
      url: "https://app.bricks.co/properties/42",
      imageUrl: "https://img.example/1.jpg",
      returnOnInvestment: 7.456,
      rentalDividends: 4.2,
      lat: undefined,
      lng: undefined,
    });
  });

  it("tolerates alternative field shapes", () => {
    const property = normalizeProperty({
      id: "abc",
      address: { street: "1 place Bellecour", zipCode: "69002", city: "Lyon" },
      images: [{ url: "https://img.example/2.jpg" }],
      latitude: "45.757",
      longitude: "4.832",
      investorBricks: { owned: "5" },
    });

    expect(property).toMatchObject({
      id: "abc",
      address: "1 place Bellecour, 69002, Lyon",
      imageUrl: "https://img.example/2.jpg",
      bricksOwned: 5,
      lat: 45.757,
      lng: 4.832,
    });
    expect(property && isLocated(property)).toBe(true);
  });

  it("rejects objects without id or address", () => {
    expect(normalizeProperty(null)).toBeUndefined();
    expect(normalizeProperty({ address: "Paris" })).toBeUndefined();
    expect(normalizeProperty({ id: 1 })).toBeUndefined();
  });
});
