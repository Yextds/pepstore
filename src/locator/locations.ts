import {
  formatMiOrKm,
  formatNumber,
  formatPhone,
  getValueFromPath,
} from "./utils";
import {
  parseTimeZoneUtcOffset,
  formatOpenNowString,
} from "./time";
import { i18n } from "../i18n";
import {
  base_url,
  limit,
  locationInput,
  locationNoun,
  locationNounPlural,
  locationOption,
  locationOptions,
  radius,
  savedFilterId,
  entityTypes,
  liveAPIKey,
} from "./constants";
import { getRequest, startLoading, stopLoading} from "./loader";
import RtfConverter from "@yext/rtf-converter";
import { highlightLocation } from "./map";  

import { twbsPagination } from "twbs-pagination";  

export let currentLatitude = 0;
export let currentLongitude = 0;

function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}
export function locationJSONtoHTML(entityProfile, index, locationOptions) {

  const getValue = (opt: locationOption) => {
    let val = opt.value;
    if (opt.contentSource === "FIELD") {
      val = getValueFromPath(entityProfile, opt.value);
    }
    return opt.isRtf && !!val ? RtfConverter.toHTML(val) : val;
  };

  const cardTitleValue = getValue(locationOptions.cardTitle);
  const getDirectionsLabelValue = getValue(locationOptions.getDirectionsLabel);
  const viewDetailsLinkTextValue = getValue(
    locationOptions.viewDetailsLinkText
  );
  let cardTitleLinkUrlValue = getValue(locationOptions.cardTitleLinkUrl);
  const hoursValue = getValue(locationOptions.hours);
  const c_departments = getValue(locationOptions.c_departments);
  const addressValue = getValue(locationOptions.address);
  const phoneNumberValue = getValue(locationOptions.phoneNumber);
  let viewDetailsLinkUrlValue = getValue(locationOptions.viewDetailsLinkUrl);

  let html =
    '<div class="lp-param-results lp-subparam-cardTitle lp-subparam-cardTitleLinkUrl  ">';
    
  if (cardTitleLinkUrlValue && cardTitleValue) {
    if (cardTitleLinkUrlValue["url"]) {
      cardTitleLinkUrlValue = cardTitleLinkUrlValue["url"];
    }
    /*html += `<div class="name hover:underline hover:font-semibold text-ll-red ">
      <a href="${cardTitleLinkUrlValue}">
        ${cardTitleValue} 
      </a>
    </div>`;*/
  } else if (cardTitleValue) {
   /* html += `<div class="name hover:underline hover:font-semibold text-ll-red ">
      ${cardTitleValue}
    </div>`;*/
  }
  html += "</div>";
  
  let count_index = index;  
    
 html += '<h4 class="storelocation-name w-11/12 text-sm font-Futura uppercase font-black text-textblack mb-1 pr-5 pl-10 md:pl-6 lg:pl-8"> <a class="subrton" href=' + cardTitleLinkUrlValue + '>' + cardTitleValue + '</a></h4>';

        html += '<div class="address text-[12px] font-normal text-[#928f8c] leading-tight uppercase mb-1 pr-5 pl-10 md:pl-6 lg:pl-8">';
    html += addressValue.line1 + ', ' + addressValue.city + ', ' + addressValue.region + ', ' + addressValue.postalCode + ', ' + addressValue.countryCode+'<br/>';
    
    if (phoneNumberValue) {
    const formattedPhoneNumber = formatPhone(
      phoneNumberValue,
      addressValue.countryCode
    );
    if (formattedPhoneNumber) {
      html += '<div class="phone">' + formattedPhoneNumber + "</div>";
    }
  }
    
    html += '</div>';
     
     if (hoursValue) {
       const offset = getValueFromPath(entityProfile, "timeZoneUtcOffset");
       const parsedOffset = parseTimeZoneUtcOffset(offset);
       html += '<div class="lp-param-results lp-subparam-hours">';
        
        html +=
         '<div class="open-now-string">' +
         formatOpenNowString(hoursValue, parsedOffset) +
         "</div>"; 
        html += '<div class="storelocation-openCloseTime pr-5 pl-10 md:pl-6 lg:pl-8 pb-4 text-[#928f8c] text-[11px] leading-tight capitalize">';
        html += '<ul class="pt-3">';


        $.each(hoursValue, function(indexh, hour) {     
            let closed = indexh.toString().slice(0, 3);
            if (hour && !hour.isClosed) {

                html += '<li class="pb-1 flex gap-2"><strong>';
                html += indexh.toString().slice(0, 3);
                html += '&nbsp</strong><strong> : </strong>&nbsp';

                if (hour.openIntervals) {
                    $.each(hour.openIntervals, function(op, openInterval) {
                      // let intervals=tConvert(openInterval.start) + ' to ' + tConvert(openInterval.end);
                        let intervals=openInterval.start + ' to ' + openInterval.end;
                        intervals=intervals.replace('00:00 to 23:59','Open 24 Hours');
                        html +=intervals;
                        // html +=html.replace('00:00 To 23:59','Open 24 Hours');
                    });
                } else {
                    html += '';
                }
                html += '</li>';
            }
        });


        html += '</ul>';
        html += '</div>';

        html += "</div>";
    }



   /* const localeString = "en-US";
  html += i18n.addressForCountry({
    locale: localeString,
    profile: { address: addressValue },
    regionAbbr: false,
    derivedData: { address: addressValue },
  });
  */


  html += '<div class="lp-param-results lp-subparam-phoneNumber">';
  
  html += "</div>";

  const singleLineAddress =
    entityProfile.name +
    " " +
    addressValue.line1 +
    " " +
    (addressValue.line2 ? addressValue.line2 + " " : "") +
    addressValue.city +
    " " +
    addressValue.region +
    " " +
    addressValue.postalCode;

  html += `<div class="lp-param-results lp-subparam-getDirectionsLabel">
    <div class="link">
      <a target="_blank"
        href="https://www.google.com/maps/dir/?api=1&destination=${singleLineAddress}"
      >
        ${getDirectionsLabelValue}
      </a>
    </div>
  </div>`;
 
  
    /*
    html += '<div class="storelocation-categories inline-block w-full">';
    html += '<p class="uppercase flex justify-between items-center pt-[7px] pb-[5px] text-xs font-Futura font-normal border-t border-[#efeeeb]" >Departments available in store<a href="javascript:void(0);" class="inline-block icons_small right close text-[20px]">+</a></p>';
        if(c_departments.length > 0){
            html += '<ul class="storelocation-available-categories clear-both  flex flex-wrap"style="display:none;" >'; 
                $.each(c_departments, function (cd,value) {                                                         
                    $('.department-list-item').each(function () {                            
                          if (value == $(this).data("id")) {
                            html += '<li class="storelocation-category  float-left bg-[#e7e3dd] w-[30%] ml-[2%] uppercase text-[#878381] mb-[10px] pt-[8px] pb-[10px] text-[10px] text-center" >'+$(this).data("name")+'</li>'; 
                          }
                    });                                                         
                    
                });
            html += '</ul>';
        }
    html += '</div>';
    */
    
  html += '<div class="lp-param-results lp-subparam-availability">';
  html += "</div>";

  // if (viewDetailsLinkUrlValue && viewDetailsLinkTextValue) {
  //   // Url value is URL object and not url.
  //   if (viewDetailsLinkUrlValue["url"]) {
  //     viewDetailsLinkUrlValue = viewDetailsLinkUrlValue["url"];
  //   }
  //   html += `<div class="lp-param-results lp-subparam-viewDetailsLinkText lp-subparam-viewDetailsLinkUrl">
  //     <div class="lp-param lp-param-viewDetailsLabel link"><strong>
  //       <a href="${viewDetailsLinkUrlValue}">
  //         ${viewDetailsLinkTextValue}
  //       </a>
  //     </strong></div>
  //   </div>`;
  // }

  // Add center column
  html = `<div class="center-column">${html}</div>`;

  // Add left and right column
  /*if (entityProfile.__distance) {
    html = `<div class="left-column">
      ${index + 1}.
    </div>
    ${html}
    <div class="right-column"><div class="distance">
      ${formatMiOrKm(
        entityProfile.__distance.distanceMiles,
        entityProfile.__distance.distanceKilometers
      )}
    </div></div>`;
  }else{*/
      // let offset = Number($('#offset').val());  
      html = `<div class="left-column absolute top-4 left-2 lg:left-4 w-5 h-8 marker-no bg-no-repeat bg-center text-center leading-[24px] ">
      ${offset + index + 1}.
    </div>${html}`;
  /*}*/
  
 let sdactive = 'data-carousel-item=""';    
 if(index == 0){
    sdactive = 'data-carousel-item="active"'; 
 }  
 
  return `<div id="result-${index}" class="result border list-group-item w-full border border-[#efeeeb] mb-5 relative " ${sdactive} >${html}</div>`;
}

// Renders each location the the result-list-inner html
export function renderLocations(locations, append, viewMore) {
  if (!append) {
    [].slice
      .call(document.querySelectorAll(".result-list-inner") || [])
      .forEach(function (el) {
        el.innerHTML = "";
      });
  }

  // Done separately because the el.innerHTML call overwrites the original html.
  // Need to wait until all innerHTML is set before attaching listeners.
  locations.forEach((location, index) => {
    [].slice
      .call(document.querySelectorAll(".result-list-inner") || [])
      .forEach(function (el) {
        el.innerHTML += locationJSONtoHTML(location, index, locationOptions);
      });
  });


  locations.forEach((_, index) => {
    document
      .getElementById("result-" + index)
      .addEventListener("mouseover", () => {
        highlightLocation(index, false, false);
      });
    document.getElementById("result-" + index).addEventListener("click", () => {
      highlightLocation(index, false, true);
    });
  });

  if (viewMore) {
    [].slice
      .call(document.querySelectorAll(".result-list-inner") || [])
      .forEach(function (el) {
        el.innerHTML +=
          '<div><div class="btn btn-link btn-block" ><button id="viewMoreBtn" > View More </button></div></div>';
      }); 
  }
}

function searchDetailMessageForCityAndRegion(total) {
  if (total === 0) {
    return '0 [locationType] found near <strong>"[city], [region]"</strong>';
  } else {
    return '[formattedVisible] of [formattedTotal] [locationType] near <strong>"[city], [region]"</strong>';
  }
}

function searchDetailMessageForArea(total) {
  if (total == 0) {
    return '0 [locationType] found near <strong>"[location]"</strong>';
  } else {
    return '[formattedVisible] of [formattedTotal] [locationType] near <strong>"[location]"</strong>';
  }
}

 function searchDetailMessageNoGeo(total) {
  if (total === 0) {
    return "0 [locationType]";
  } else {
      
    return "[formattedVisible] of [formattedTotal] [locationType]";
  }
}

// Renders details of the search
export function renderSearchDetail(geo, visible, total, queryString) {
  // x of y locations near "New York, NY"
  // x  locations near "New York, NY"
  // x  locations near "New York, NY"

  let locationType = locationNoun;
  if (total === 0 || total > 1) {
    locationType = locationNounPlural;
  }

  let formattedVisible = formatNumber(visible);
  
  // let offset = $('#offset').val();  
  let start = Number(offset) + 1; 
  let to_total = Number(offset) + Number(visible);  
  formattedVisible = formatNumber(start)+' to '+formatNumber(to_total);
  
  let formattedTotal = formatNumber(total);
  let searchDetailMessage;
  if (geo) {
    if (geo.address.city !== "") {
      searchDetailMessage = searchDetailMessageForCityAndRegion(total);
      searchDetailMessage = searchDetailMessage.replace(
        "[city]",
        geo.address.city
      );
      searchDetailMessage = searchDetailMessage.replace(
        "[region]",
        geo.address.region
      );
    } else {
      let location = "";
      if (geo.address.region) {
        location = geo.address.region;
      } else if (geo.address.country && queryString) {
        location = queryString;
      } else if (geo.address.country) {
        location = geo.address.country;
      }
      if (location !== "") {
        searchDetailMessage = searchDetailMessageForArea(total);
        searchDetailMessage = searchDetailMessage.replace(
          "[location]",
          location
        );
      }
    }
  } else {
    searchDetailMessage = searchDetailMessageNoGeo(total);
  }

  searchDetailMessage = searchDetailMessage.replace(
    "[locationType]",
    locationType
  );
  searchDetailMessage = searchDetailMessage.replace(
    "[formattedVisible]",
    formattedVisible
  );
  searchDetailMessage = searchDetailMessage.replace(
    "[formattedTotal]",
    formattedTotal
  );
  
  // searchDetailMessage = formattedVisible+' results';

  [].slice
  .call(document.querySelectorAll(".search-center") || [])
  .forEach(function (el) {
    el.innerHTML = "";
   });
  [].slice
    .call(document.querySelectorAll(".search-center") || [])
    .forEach(function (el) {
      el.innerHTML = searchDetailMessage;
    });
}

export function getNearestLocationsByString() {
  const queryString = locationInput.value;
  
    var request_url = base_url + "entities";
    // var request_url = base_url + "entities"; 
    request_url += "?radius=" + radius;
    request_url += "&location=United Kingdom";
    request_url += '&sortBy=[{"name":"ASCENDING"}]';
    // console.log(request_url);
  
    if (queryString.trim() !== "") {
      
        let filterParameters = {};
        let filterAnd = {};
        let filterOr = {};
        let filter = '';
        
        if (queryString) {
            
            filterOr = {"$or": [
                  {"address.line1": {"$contains": queryString}},
                  {"address.city": {"$contains": queryString}},
                  {"address.region": {"$contains": queryString}},
                  {"address.countryCode": {"$contains": queryString}},
                  {"address.postalCode": {"$contains": queryString}},   
                  {"name": {"$contains": queryString}}
                ]
            }; 

        }
        
        var ce_departments = [];
        $('.checkbox_departments').each(function () {                            
              if ($(this).is(":checked")) {
                ce_departments.push($(this).val());
              }
        });
        
        if(ce_departments.length > 0){
            
            filterAnd = {"$and":[{"c_departments":{"$in": ce_departments}}]};           
            filterParameters = {...filterOr,...filterAnd};
                
            var filterpar = JSON.stringify(filterParameters);
            filter = encodeURI(filterpar);
            
        }else{
                                    
            filterParameters = {...filterOr};               
            var filterpar = JSON.stringify(filterParameters);
            filter = encodeURI(filterpar);
            
        }
        
        if(filter){
            request_url += "&filter=" + filter;
        }
    
    // Uncommon below to limit the number of results to display from the API request
    request_url += "&limit=" + limit;
    getRequest(request_url, queryString,);
  }
  var url = window.location.href;  
  var myStorage = window.sessionStorage;
  sessionStorage.setItem('query', url);
}



// Get locations by lat lng (automatically fired if the user grants acceess)
function getNearestLatLng(position) {
  [].slice
    .call(document.querySelectorAll(".error-text") || [])
    .forEach(function (el) {
      el.textContent = "";
    });
  
  // currentLatitude = position.coords.latitude;
  // currentLongitude = position.coords.longitude;
  
  currentLatitude = 55.7936561;
  currentLongitude = -4.8673877;
  
  let request_url = base_url + "entities/geosearch";
  request_url += "?radius=" + radius;
  request_url +=
    "&location=" + currentLatitude + ", " + currentLongitude;
    
    let filterParameters = {};
        let filterAnd = {};
        let filterOr = {};
        
        const queryString = locationInput.value;
         
        if (queryString) {
            
            filterOr = {"$or": [
                  {"name": {"$contains": queryString}},
                  {"address.line1": {"$contains": queryString}},
                  {"address.city": {"$contains": queryString}},
                  {"address.region": {"$contains": queryString}},
                  {"address.countryCode": {"$contains": queryString}},
                  {"address.postalCode": {"$contains": queryString}}
                ]
            }; 
            
        }
        
        var ce_departments = [];
        $('.checkbox_departments').each(function () {                            
              if ($(this).is(":checked")) {
                ce_departments.push($(this).val());
              }
        });
        
        if(ce_departments.length > 0){          
            filterAnd = {"$and":[{"c_departments":{"$in": ce_departments}}]};
                
        }
        
        filterParameters = {...filterOr,...filterAnd};
        var filterpar = JSON.stringify(filterParameters);
        var filter = encodeURI(filterpar);
        
        if(filter){
            // filter = filter.replaceAll('&', '%26');
            request_url += "&filter=" + filter;
        }
    
  // request_url += "&limit=" + limit;
  getRequest(request_url, null);
}

// Gets a list of locations. Only renders if it's a complete list. This avoids a dumb looking map for accounts with a ton of locations.

export let offset =0;
export function getLocations(offset=0,pagination=false) {

  let request_url =
    base_url +
    "entities" +
    "?limit=" +
    limit +
    "&offset="+
    offset+
    '&sortBy=[{"name":"ASCENDING"}]';

    
        let filterParameters = {};
        let filterAnd = {};
        let filterOr = {};
        
        const queryString = locationInput.value;
         
        if (queryString) {
            
            filterOr = {"$or": [
                  {"address.line1": {"$contains": queryString}},
                  {"address.city": {"$contains": queryString}},
                  {"address.region": {"$contains": queryString}},
                  {"address.countryCode": {"$contains": queryString}},
                  {"address.postalCode": {"$contains": queryString}},   
                  {"name": {"$contains": queryString}}
                ]
            }; 
            
        }
        
        var ce_departments = [];
        $('.checkbox_departments').each(function () {                            
              if ($(this).is(":checked")) {
                ce_departments.push($(this).val());
              }
        });
        
        if(ce_departments.length > 0){          
            filterAnd = {"$and":[{"c_departments":{"$in": ce_departments}}]};
                
        }
        
        filterParameters = {...filterOr,...filterAnd};
        var filterpar = JSON.stringify(filterParameters);
        var filter = encodeURI(filterpar);
        
        if(filter){
            // filter = filter.replaceAll('&', '%26');
            request_url += "&filter=" + filter;
        }
      getRequest(request_url, null,pagination);
}
export function paginate(
    totalItems: number,
    currentPage: number = 1,
    pageSize: number = 10,
    maxPages: number = 10
) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= maxPages) {
        // total pages less than max so show all pages
        startPage = 1;
        endPage = totalPages;
    } else {
        // total pages more than max so calculate start and end pages
        let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
        let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            // current page near the start
            startPage = 1;
            endPage = maxPages;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
            // current page near the end
            startPage = totalPages - maxPages + 1;
            endPage = totalPages;
        } else {
            // current page somewhere in the middle
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
        totalItems: totalItems,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        startPage: startPage,
        endPage: endPage,
        startIndex: startIndex,
        endIndex: endIndex,
        pages: pages
    };
}

 function appendpaginationlinks(pagesLinks){

    console.log('pagesLinks',pagesLinks)
    const pages = pagesLinks.pages;
    const totalPages = pagesLinks.totalPages;
    const currentPage = pagesLinks.currentPage;

    var pagehtml="<div class=flex-inline>";
    pagehtml+="<ul class='pagination  relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>";

    // if(currentPage>1){
    //   pagehtml+='<li><a href="#" class="page-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-3" data-id="1">First</a></li>';
    // }

    if(currentPage>1){
      pagehtml+='<li><a href="#" class="page-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-3" data-id="1">First</a></li>';
      pagehtml+='<li><a href="#" class="page-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-3" data-id='+(currentPage-1)+'><</a></li>';
    }

    pages.forEach((e)=>{

      var isActive = "";
      if(e == currentPage){
        isActive = "active";
      }
      pagehtml+='<li><a href="#" class="'+isActive+' page-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-3" data-id='+e+'>'+e+'</a></li>';
    })

    if(totalPages !== currentPage){
      pagehtml+='<li><a href="#" class="page-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-3" data-id='+(currentPage+1)+'>></a></li>';
      pagehtml+='<li><a href="#" class="page-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-3" data-id='+totalPages+'>Last</a></li>';
    }
    
    pagehtml+="</ul></div>";

    $(".custom-pagination-links").empty();
    $('.custom-pagination-links').append(pagehtml);
  }

export function renderPaginationLinks(pagesLinks,count=0) {
   
    appendpaginationlinks(pagesLinks);

    setTimeout(()=>{

      $(document).on('click', '.page-btn', function() {        
        const dataId = $(this).attr('data-id');
        const newOffset = (limit * Number(dataId)) - (limit);
        offset = newOffset;
        getLocations(newOffset,false);
        const pagLinks = paginate(count,parseInt(dataId),limit,5);
        appendpaginationlinks(pagLinks);
      });

    },1000);
    
}


// console.log( $(".custom-pagination-links").length )
// $(".custom-pagination-links").on('load',function(){
//   console.log('happy if worked')
// });
   
// $('.page-btn')
  //  $('.page-btn').click(function(){
  //   alert($('.page-btn').attr("data-id"));
  // }


//    offset=offset+10;
//   let request_url =
//     base_url +
//     "entities" +
//     "?limit=" +
//     limit +
//     "&offset="+
//     offset+
//     '&sortBy=[{"name":"ASCENDING"}]';
    
//         let filterParameters = {};
//         let filterAnd = {};
//         let filterOr = {};
        
//         const queryString = locationInput.value;
         
//         if (queryString) {
            
//             filterOr = {"$or": [
//                   {"address.line1": {"$contains": queryString}},
//                   {"address.city": {"$contains": queryString}},
//                   {"address.region": {"$contains": queryString}},
//                   {"address.countryCode": {"$contains": queryString}},
//                   {"address.postalCode": {"$contains": queryString}},   
//                   {"name": {"$contains": queryString}}
//                 ]
//             }; 
            
//         }
        
//         var ce_departments = [];
//         $('.checkbox_departments').each(function () {                            
//               if ($(this).is(":checked")) {
//                 ce_departments.push($(this).val());
//               }
//         });
        
//         if(ce_departments.length > 0){          
//             filterAnd = {"$and":[{"c_departments":{"$in": ce_departments}}]};
                
//         }
        
//         filterParameters = {...filterOr,...filterAnd};
//         var filterpar = JSON.stringify(filterParameters);
//         var filter = encodeURI(filterpar);
        
//         if(filter){
//             // filter = filter.replaceAll('&', '%26');
//             request_url += "&filter=" + filter;
//         }
        
//   getRequest(request_url, null);
// })
//   $('.viewlessBtnDiv').click(function(){
//   offset=offset-10;
//   let request_url =
//     base_url +
//     "entities" +
//     "?limit=" +
//     limit +
//     "&offset="+
//     offset+
//     '&sortBy=[{"name":"ASCENDING"}]';
    
//         let filterParameters = {};
//         let filterAnd = {};
//         let filterOr = {};
        
//         const queryString = locationInput.value;
         
//         if (queryString) {
            
//             filterOr = {"$or": [
//                   {"address.line1": {"$contains": queryString}},
//                   {"address.city": {"$contains": queryString}},
//                   {"address.region": {"$contains": queryString}},
//                   {"address.countryCode": {"$contains": queryString}},
//                   {"address.postalCode": {"$contains": queryString}},   
//                   {"name": {"$contains": queryString}}
//                 ]
//             }; 
            
//         }
        
//         var ce_departments = [];
//         $('.checkbox_departments').each(function () {                            
//               if ($(this).is(":checked")) {
//                 ce_departments.push($(this).val());
//               }
//         });
        
//         if(ce_departments.length > 0){          
//             filterAnd = {"$and":[{"c_departments":{"$in": ce_departments}}]};
                
//         }
        
//         filterParameters = {...filterOr,...filterAnd};
//         var filterpar = JSON.stringify(filterParameters);
//         var filter = encodeURI(filterpar);
        
//         if(filter){
//             // filter = filter.replaceAll('&', '%26');
//             request_url += "&filter=" + filter;
//         }
     
//   getRequest(request_url, null);
 
// })

// getLocations();


export function getUsersLocation() {
  if (navigator.geolocation) {
    startLoading();
    const error = (error) => {
      [].slice
        .call(document.querySelectorAll(".error-text") || [])
        .forEach(function (el) {
          el.textContent =
            "Unable to determine your location. Please try entering a location in the search bar.";
        });
      stopLoading();
    };
    navigator.geolocation.getCurrentPosition(getNearestLatLng, error, {
      timeout: 10000,
    });
  }
}
