// Air Quality Data from AiREAS: http://www.aireas.com/
//TODO: Does it make sense this file located in the "models" folder? 

// modules
const fetch = require("node-fetch");
const request = require('request');
const cron = require('node-cron');
const moment = require('moment');

//const abLocURL = 'http://data.aireas.com/api/v2/locations/'

// URLs for all airboxes 
const ab1 = "http://data.aireas.com/api/v2/airboxes/1"; //Eijerven 41
const ab2 = "http://data.aireas.com/api/v2/airboxes/2"; //Lijmbeekstraat 190
const ab3 = "http://data.aireas.com/api/v2/airboxes/3"; //Kerkstraat 46
const ab4 = "http://data.aireas.com/api/v2/airboxes/4"; //Von Weberstraat-Limburglaan 161
const ab5 = "http://data.aireas.com/api/v2/airboxes/5"; //Falstaff 8
const ab6 = "http://data.aireas.com/api/v2/airboxes/6"; //Grote Beerlaan 15
const ab7 = "http://data.aireas.com/api/v2/airboxes/7"; //Botenlaan 135
const ab8 = "http://data.aireas.com/api/v2/airboxes/8"; //Leenderweg 259
const ab9 = "http://data.aireas.com/api/v2/airboxes/9"; //Maasteikstraat 7
//const ab10 = "http://data.aireas.com/api/v2/airboxes/10"; //Breda
const ab11 = "http://data.aireas.com/api/v2/airboxes/11"; //Leostraat 17
const ab12 = "http://data.aireas.com/api/v2/airboxes/12"; //Jan Hollanderstraat 70
const ab13 = "http://data.aireas.com/api/v2/airboxes/13"; //Sliffertsestraat 12
const ab14 = "http://data.aireas.com/api/v2/airboxes/14"; //Twickel 30
//const ab15 = "http://data.aireas.com/api/v2/airboxes/15"; //Helmond
const ab16 = "http://data.aireas.com/api/v2/airboxes/16"; //Beukenlaan 62
const ab17 = "http://data.aireas.com/api/v2/airboxes/17"; //Amstelstraat 154
//const ab18 = "http://data.aireas.com/api/v2/airboxes/18"; //Breda
const ab19 = "http://data.aireas.com/api/v2/airboxes/19"; //Finisterelaan 45
const ab20 = "http://data.aireas.com/api/v2/airboxes/20"; //Sperwerlaan 4A
const ab21 = "http://data.aireas.com/api/v2/airboxes/21"; //Donk 24
const ab22 = "http://data.aireas.com/api/v2/airboxes/22"; //Hofstraat 161
const ab23 = "http://data.aireas.com/api/v2/airboxes/23"; //Jeroen Boschlaan 170
const ab24 = "http://data.aireas.com/api/v2/airboxes/24"; //Van Vollenhovenstraat 36
const ab25 = "http://data.aireas.com/api/v2/airboxes/25"; //Mauritsstraat 36
const ab26 = "http://data.aireas.com/api/v2/airboxes/26"; //Vestdijk 52
const ab27 = "http://data.aireas.com/api/v2/airboxes/27"; //Sint Adrianusstraat 30
const ab28 = "http://data.aireas.com/api/v2/airboxes/28"; //Rijckwaartstraat 6
const ab29 = "http://data.aireas.com/api/v2/airboxes/29"; //Ds. Th. Fliednerstraat 1
const ab30 = "http://data.aireas.com/api/v2/airboxes/30"; //Spijndhof
//const ab31 = "http://data.aireas.com/api/v2/airboxes/31"; //Waalre
const ab32 = "http://data.aireas.com/api/v2/airboxes/32"; //Vesaliuslaan 50
//const ab33 = "http://data.aireas.com/api/v2/airboxes/33"; //No data

const ab34 = "http://data.aireas.com/api/v2/airboxes/34"; //Mauritsstraat 26
const ab35 = "http://data.aireas.com/api/v2/airboxes/35"; //Boschdijk 393
const ab36 = "http://data.aireas.com/api/v2/airboxes/36"; //Hudsonlaan 694
const ab37 = "http://data.aireas.com/api/v2/airboxes/37"; //Genovevalaan
//const ab38 = "http://data.aireas.com/api/v2/airboxes/38"; //Breda
const ab39 = "http://data.aireas.com/api/v2/airboxes/39"; //Noord Brabantlaan 36
//const ab40 = "http://data.aireas.com/api/v2/airboxes/40"; // No location ID

const airboxURLs = [ab1, ab2, ab3, ab4, ab5, ab7, ab8, ab9, ab11, ab12, ab13, ab14, ab16, ab17, ab19, ab20, ab21, ab22, ab23, ab24, ab25, ab26, ab27, ab28, ab29, ab30, ab32, ab34, ab35, ab36, ab37, ab39];

// Receive data from each URL and restructure the format, which enables to visualize by using DS and Leaflet 
const abJson = function() {
  return new Promise(function(resolve, reject){
    let airboxes;
    async function aq() {
      airboxes = {
      "type": "FeatureCollection",
      "features": []
      };

      for (const url of airboxURLs) {
        const airboxData = await fetch(url).then((response)=> {
            return response.json();
        }).catch((error) => {
          console.error(error);
        });
        //console.log('airboxData' + airboxData);

        //const locationData = await fetch(abLocURL + airboxData.location.$oid).then((response)=> { //need  abLocURL??
        
        if (airboxData != undefined) {
          const locationData = await fetch(airboxData.location.$oid).then((response)=> {
              return response.json();
          }).catch((error) => {
            console.error(error);
          });
          console.log(locationData);


          let aqData = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [ //add coordinates
                locationData.gps.lon, 
                locationData.gps.lat,
              ]
            },
            "properties": { //add properties
              "Updated" : moment(airboxData.last_measurement.calibrated.when.$date).format('lll'),
              "AirboxId": airboxData._id,
              "Location": locationData.street,
              "PM1": airboxData.last_measurement.calibrated.readings.PM1,
              "PM25": airboxData.last_measurement.calibrated.readings.PM25,
              "PM10" : airboxData.last_measurement.calibrated.readings.PM10,
              "UFP": airboxData.last_measurement.calibrated.readings.UFP,
              "Ozone": airboxData.last_measurement.calibrated.readings.Ozon,
              "NO2": airboxData.last_measurement.calibrated.readings.NO2
            }
          };
          airboxes.features.push(aqData);
        }
        //return airboxes;
      } 
    }
    aq().then(()=> {
      exports.airboxes = airboxes;
      let dataLoaded = true;
      exports.dataLoaded = dataLoaded;
      resolve();
    });
    reject();
  });
};

exports.abJson = abJson();

//TODO: Check how this actually working...
cron.schedule('0 0 */1 * * *', () => { // execute every one hour
    abJson();
    //console.log("'* * * * * *'every second");
});



