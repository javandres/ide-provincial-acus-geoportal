const axios = require("axios");

// URL de la API de GeoNetwork (reemplaza esta URL con la real)
const apiUrl =
  "https://metadatos.azuay.gob.ec/geonetwork/srv/api/search/records/_search?bucket=s101";

// Configuración de cabeceras para la solicitud
const headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "spa",
  "content-type": "application/json;charset=UTF-8",
  "sec-ch-ua":
    '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Linux"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-xsrf-token": "f2b28a1b-a52a-42e2-84fd-5d6c869d218c",
  cookie:
    "XSRF-TOKEN=f2b28a1b-a52a-42e2-84fd-5d6c869d218c; JSESSIONID=B986C8901F51B2DFB732757950951F83; serverTime=1706490757747; sessionExpiry=1706490757747",
  Referer: "https://metadatos.azuay.gob.ec/geonetwork/srv/spa/catalog.search",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

// Cuerpo de la solicitud
const data = {
  from: 0,
  size: 30,
  sort: ["_score"],
  query: {
    function_score: {
      boost: "5",
      functions: [
        { filter: { exists: { field: "parentUuid" } }, weight: 0.3 },
        { filter: { match: { "cl_status.key": "obsolete" } }, weight: 0.2 },
        { filter: { match: { "cl_status.key": "superseded" } }, weight: 0.3 },
        { gauss: { dateStamp: { scale: "365d", offset: "90d", decay: 0.5 } } }
      ],
      score_mode: "multiply",
      query: {
        bool: {
          must: [{ terms: { isTemplate: ["n"] } }]
        }
      }
    }
  },
  aggregations: {
    // Agregaciones aquí...
  },
  _source: {
    includes: [
      "uuid",
      "id",
      "creat*",
      "group*",
      "logo",
      "category",
      "topic*",
      "inspire*",
      "resource*",
      "draft*",
      "overview.*",
      "owner*",
      "link*",
      "image*",
      "status*",
      "rating",
      "tag*",
      "geom",
      "contact*",
      "*Org*",
      "hasBoundingPolygon",
      "isTemplate",
      "valid",
      "isHarvested",
      "dateStamp",
      "documentStandard",
      "standardNameObject.default",
      "cl_status*",
      "mdStatus*",
      "recordLink"
    ]
  },
  track_total_hits: true
};

// Función para realizar la solicitud a la API
async function consultarAPI() {
  try {
    const response = await axios.post(apiUrl, data, { headers });
    console.log(response.data);
  } catch (error) {
    console.error("Error al consultar la API:", error);
  }
}

// Llamar a la función para consultar la API
consultarAPI();
