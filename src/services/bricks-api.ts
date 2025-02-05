import axios from "axios";

export type Property = {
  id: number;
  address: Address;
  lat: number;
  lng: number;
  rentalDividends: number;
  investorBricks: BricksUser;
};

export type Address = {
  fr: string;
};

export type BricksUser = {
  owned: number;
};

export default {
  async getMyProperties() {
    const propertiesUrl = `https://api.bricks.co/properties`;
    const osmGeocodeUrl = "https://nominatim.openstreetmap.org/search?format=json";
    const iqGeocodeUrl = `https://eu1.locationiq.com/v1/search?format=json&key=${atob("cGsuMDY0ZDU2YjM4YzAwOGU1OWUzYTdlNzYzYWRiNjk0MDE=")}&limit=1`
    const propertiesResponse = await axios.get<{ properties: Property[] }>(
      `${propertiesUrl}?take=1000&cursor=0`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      }
    );

    return Promise.all(
      propertiesResponse.data?.properties
      .filter((prop) => prop.investorBricks.owned > 0)
      .map(async (e, index) => {

        const property = (await axios.get<{data: Property}>(
          `${propertiesUrl}/${e.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`,
            },
          }
        )).data; 

        try {
          await new Promise((resolve) => setTimeout(resolve, index * 500));

          const geocodeResponse = await axios.get(`${osmGeocodeUrl}&q=${encodeURIComponent(property.address.fr)}`);
    
          if (geocodeResponse.data && geocodeResponse.data.length > 0) {
            property.lng = geocodeResponse.data[0].lon;
            property.lat = geocodeResponse.data[0].lat;
          } else {
            throw new Error("Empty OSM Geocode response");
          }
        } catch (error) {
          console.log(`Error with OSM Geocode, falling back to LocationIQ: ${error.message}`);
    
          try {
            const geocodeResponse2 = await axios.get(`${iqGeocodeUrl}&q=${encodeURIComponent(property.address.fr)}`);
    
            if (geocodeResponse2.data && geocodeResponse2.data.length > 0) {
              property.lng = geocodeResponse2.data[0].lon;
              property.lat = geocodeResponse2.data[0].lat;
            } else {
              console.log(`LocationIQ returned an empty response for address: ${property.address.fr}`);
            }
          } catch (error) {
            console.log(`Error with LocationIQ: ${error.message}`);
            property.lng = -8.389829;
            property.lat = 41.206541;
          }
        }       
        return property;
      })
    );    
  }
};
