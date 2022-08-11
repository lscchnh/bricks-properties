import axios from "axios";

export type Properties = {
  id: number;
  address: Address;
  lat: number;
  lng: number;
  returnOnInvestment: number;
  rentalDividends: number;
  bricksUser: BricksUser;
  capitalGrowth: number;
  imageGallery: string[];
};

export type Address = {
  fr: string;
};

export type BricksUser = {
  currentOwned: number;
};

export default {
  async getMyProperties() {
    const propertiesUrl = `https://api.bricks.co/customers/properties?take=1000&cursor=0`;
    const geocodeUrl = "https://api-adresse.data.gouv.fr/search/";
    const propertiesResponse = await axios.get<{ properties: Properties[] }>(
      propertiesUrl,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      }
    );

    return Promise.all(
      propertiesResponse.data?.properties.map(async (e) => {
        const geocodeResponse = await axios.get<{
          features: any;
          geoProperties: any;
        }>(`${geocodeUrl}?q=${e.address.fr}`);
        e.lng = geocodeResponse.data?.features[0].geometry.coordinates[0];
        e.lat = geocodeResponse.data?.features[0].geometry.coordinates[1];
        return e;
      })
    );
  },
};
