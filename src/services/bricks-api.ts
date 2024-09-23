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
      propertiesResponse.data?.properties.map(async (e, index) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, index * 200));

          const geocodeResponse = await axios.get(`${osmGeocodeUrl}&q=${encodeURIComponent(e.address.fr)}`);
    
          if (geocodeResponse.data && geocodeResponse.data.length > 0) {
            e.lng = geocodeResponse.data[0].lon;
            e.lat = geocodeResponse.data[0].lat;
          } else {
            throw new Error("Empty OSM Geocode response");
          }
        } catch (error) {
          console.log(`Error with OSM Geocode, falling back to LocationIQ: ${error.message}`);
    
          try {
            const geocodeResponse2 = await axios.get(`${iqGeocodeUrl}&q=${encodeURIComponent(e.address.fr)}`);
    
            if (geocodeResponse2.data && geocodeResponse2.data.length > 0) {
              e.lng = geocodeResponse2.data[0].lon;
              e.lat = geocodeResponse2.data[0].lat;
            } else {
              console.log(`LocationIQ returned an empty response for address: ${e.address.fr}`);
            }
          } catch (error) {
            console.log(`Error with LocationIQ: ${error.message}`);
            e.lng = -8.389829;
            e.lat = 41.206541;
          }
        }       
        return e;
      })
    );    
  }
};
