import {
  defaultQuery,
  enableAutocomplete,
  loadLocationsOnLoad,
  locationInput,
  searchButton,
  useMyLocation
} from "./locator/constants";
import { getLocations, getNearestLocationsByString, getUsersLocation} from "./locator/locations";
import { getQueryParamsFromUrl } from "./locator/utils";
import { isLoading } from "./locator/loader";
// @ts-ignore
import google from "google";

searchButton.addEventListener("click", function () {
  $('#offset').val(0);    
  getNearestLocationsByString();
});

/*
useMyLocation.addEventListener("click", function () {
  getUsersLocation();
});
*/






window.addEventListener("popstate", function (e) {
  if (e.state && e.state.queryString) { 
    locationInput.value = e.state.queryString;
    getNearestLocationsByString();
   
  }
});

window.addEventListener("load", function () { 
  const params = getQueryParamsFromUrl();
  const queryString = params["q"] || defaultQuery;
  locationInput.value = decodeURI(queryString);
  getNearestLocationsByString();  
 
});

locationInput.addEventListener("keydown", function (e) { 
  if (e.key === "Enter") {
   getNearestLocationsByString();
  }
  
});


if (loadLocationsOnLoad) {
  getLocations(0,true);
  // getDepartments();
}



if (enableAutocomplete) {
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("location-input"),
    {
      options: {
        //types: ["(regions)"],
        componentRestrictions: {'country': "us"}
      },
    }
  );
  autocomplete.addListener("place_changed", () => {
    if (!isLoading) {
        getNearestLocationsByString();
      
    }
  });
}
