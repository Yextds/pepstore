export const limit = 10;
export const radius = 300;
export const defaultQuery = "";
export const locationInput = <HTMLInputElement>(
  document.getElementById("location-input")
);
export const searchButton = document.getElementById("search-location-button");
// export const useMyLocation = document.getElementById("useLocation");
export const useMyLocation = '';
export const locationNoun = "Store";
export const locationNounPlural = "Stores";

// Live Api query variables
var script_tag = document.getElementById('js-locator');
export const liveAPIKey = "b262ae7768eec3bfa53bfca6d48e4000";
console.log(liveAPIKey);
export const savedFilterId = "910935477";
export const entityTypes = "location";
export const loadLocationsOnLoad = true;
export const enableAutocomplete = false;
export const base_url = "https://liveapi-sandbox.yext.com/v2/accounts/me/";
export const useMiles = true;

export type locationOption = {
  // The value of the content, either a field name or a constant value
  value: string;
  // Determines where this value comes from. Generally either FIELD or text.
  contentSource: string;
  // Determines whether the content defined in value should be parsed as RTF.
  isRtf: boolean | undefined;
};

export const locationOptions = {
  cardTitle: {
    value: "name",
    contentSource: "FIELD",
   
  },
  cardTitleLinkUrl: {
    value: "slug",
    contentSource: "FIELD",
  },
  hours: {
    value: "hours",
    contentSource: "FIELD",
  },
  address: {
    value: "address",
    contentSource: "FIELD",
  },
  phoneNumber: {
    value: "mainPhone",
    contentSource: "FIELD",
  },
  getDirectionsLabel: {
    value: "Get Directions",
    contentSource: "text",
    isRtf: true,
  },
  coordinates: {
    value: "geocodedCoordinate",
    contentSource: "FIELD",
  }, 
  yextCoordinates: {
    value: "yextDisplayCoordinate",
    contentSource: "FIELD",
  },
  viewDetailsLinkText: {
    value: "View Details",
    contentSource: "text",
  },
  viewDetailsLinkUrl: {
    value: "/",
    contentSource: "text",
  },
  c_departments: {
    value: "c_departments",
    contentSource: "FIELD",
  },
};
