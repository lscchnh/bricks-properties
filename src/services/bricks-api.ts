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
    const osmGeocodeUrl = "https://nominatim.openstreetmap.org/search?format=json";
    const iqGeocodeUrl = `https://eu1.locationiq.com/v1/search?format=json&key=${atob("cGsuMDY0ZDU2YjM4YzAwOGU1OWUzYTdlNzYzYWRiNjk0MDE=")}&limit=1`
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
          data: any;
        }>(`${osmGeocodeUrl}&q=${e.address.fr}`);
        if (geocodeResponse.data[0] != undefined) {
          e.lng = geocodeResponse.data[0].lon;
          e.lat = geocodeResponse.data[0].lat;
        }
        else {
          const geocodeResponse2 = await axios.get<{
            data: any;
          }>(`${iqGeocodeUrl}&q=${e.address.fr}`);
          e.lng = geocodeResponse2.data[0].lon;
          e.lat = geocodeResponse2.data[0].lat;
        }
        return e;
      })
    );
  },
};
