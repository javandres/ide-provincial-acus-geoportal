const axios = require("axios");
const { writeFileSync } = require("fs");

const apiUrl = "http://localhost/api/v2/";

const geoserverUrl = "http://localhost/geoserver/ows";

const initTemplate = require("./wwwroot/init/init_template.json");
const institucionesEc = require("./wwwroot/init/instituciones_ec.json");
const serviciosGlobales = require("./wwwroot/init/servicios_globales.json");

// const fs = require('fs/promises');

// var instituciones_ec = null

// fs.readFile("wwwroot/init/instituciones_ec.json", "utf8")
//   .then((data) => {
//     // Do something with the data
//     instituciones_ec = JSON.parse(data);

//   })
//   .catch((error) => {
//     // Do something if error
//     console.log("ERROR", error)
//   });

async function getResources(category) {
  //localhost/api/v2/

  http: try {
    // Make GET request to the API endpoint
    const response = await axios.get(
      apiUrl +
        `resources?include[]=executions&sort[]=title&filter%7Bcategory.identifier.in%7D=${category.identifier}&filter%7Bmetadata_only%7D=false&filter%7Bresource_type.in%7D=dataset&page=1&page_size=24`
    );

    // Store the results in an object
    const resultObject = {
      status: response.status,
      data: response.data
    };

    return resultObject.data?.resources;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function getCategories() {
  try {
    const response = await axios.get(apiUrl + "categories");

    const resultObject = {
      status: response.status,
      data: response.data
    };
    return resultObject.data?.categories;
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

function createTerriaWmsLayer(dataset) {
  return {
    name: dataset.title,
    url: `${geoserverUrl}?service=wms&version=1.3.0&request=GetCapabilities`,
    layers: `${dataset.alternate}`,
    type: "wms"
  };
}
async function buildGeonode() {
  try {
    const categories = await getCategories();

    const terriaCategories = [];

    for (const category of categories) {
      //   const layers = await getCategories();
      if (category.count !== 0) {
        console.log("Category:", category.id, category.gn_description);

        const resources = await getResources(category);

        const layers = [];
        for (const resource of resources) {
          const layer = createTerriaWmsLayer(resource);

          console.log("Layer:", layer);
          layers.push(layer);
        }

        terriaCategories.push({
          name: category.gn_description,
          type: "group",
          members: [...layers]
        });
      }
    }

    const terriaInit = {
      ...initTemplate,
      catalog: [
        {
          name: "Categorías",
          type: "group",
          isOpen: true,
          members: [...terriaCategories]
        },
        {
          name: "Instituciones Ecuador",
          type: "group",
          isOpen: true,
          members: [...institucionesEc]
        },
        {
          name: "Servcios Globales",
          type: "group",
          isOpen: true,
          members: [...serviciosGlobales]
        }
      ]
    };

    console.log("=======", JSON.stringify(terriaInit));

    try {
      writeFileSync(
        "./wwwroot/init/init_congope.json",
        JSON.stringify(terriaInit, null, 2),
        "utf8"
      );
      console.log("Data successfully saved to disk");
    } catch (error) {
      console.log("An error has occurred ", error);
    }
  } catch (error) {
    console.error("Error building GeoNode layers:", error);
  }
}

// Call the fetchData function
buildGeonode();
