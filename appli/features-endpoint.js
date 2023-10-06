/***************
 * INIT DATA ***
 **************/

//Requête SPARQL pour récupérer les données sur les monuments historiques de Paris
var select = "PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#> "+
"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "+
"PREFIX owl: <http://www.w3.org/2002/07/owl#> "+
"PREFIX fn: <http://www.w3.org/2005/xpath-functions#> "+
"PREFIX prov: <http://www.w3.org/ns/prov#> "+
"PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> "+
"PREFIX pav: <http://purl.org/pav/> "+
"PREFIX locn: <http://www.w3.org/ns/locn#> "+
"PREFIX gsp: <http://www.opengis.net/ont/geosparql#> "+
"PREFIX geof: <http://www.opengis.net/def/function/geosparql/>"+
"PREFIX rda: <http://rdaregistry.info/Elements/a/>"+
'SELECT distinct ?uri ?index ?person (GROUP_CONCAT(DISTINCT ?activity ; SEPARATOR=" et ") as ?activities) (GROUP_CONCAT(DISTINCT ?address ; SEPARATOR=" et ") as ?addresses) (GROUP_CONCAT(DISTINCT ?address_geocoding ; SEPARATOR=" et ") as ?addresses_geocoding) ?geom_wkt ?directoryName ?directoryDate '

var where =
"?uri a adb:Entry."+
"?uri adb:numEntry ?index."+
"?uri rdfs:label ?person."+
"?uri prov:wasDerivedFrom ?directory."+
"?directory rdfs:label ?directoryName."+
"?directory pav:createdOn ?directoryDate."+
"?uri locn:address ?add1."+
" ?add1 locn:fullAddress ?address_geocoding."+
" ?add1 prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0002>."+
" ?add1 gsp:hasGeometry ?geom."+
" ?geom gsp:asWKT ?geom_wkt."+
"?uri locn:address ?add2."+
" ?add2 locn:fullAddress ?address."+
" ?add2 prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0001>."+
"?uri rda:P50104 ?activity."

var query = select + where
var queryURL = repertoireGraphDB + "?query="+encodeURIComponent(query+'}')+"&?outputFormat=rawResponse";

let compquery = ''

/******************
 ***** Init var ***
 *****************/

var myVar;
var extract;
var extractgroup;

/*****************************************
**************** Slider  *****************
****************************************/
 
var slidervar = document.getElementById('slider');
noUiSlider.create(slidervar, {
    connect: true,
    start: [ 1860, 1880 ], //Start period
    step:1,                //1 year
    behaviour: 'drag',
    range: {
        min: 1790,         //Min year
        max: 1910          //Max year
    },
    format: wNumb({
        decimals: 0
    }),
    tooltips: false,
    pips: {
        mode: 'positions',
        values: [0, 25, 50, 75, 100],
        density: 10
    }
});

//CONNECT SLIDER WITH DATA
//Set default value on input number
inputNumberMin.setAttribute("value", 1860);
inputNumberMax.setAttribute("value", 1880);

/**FORM */

let per = document.getElementById("per").value;
let act = document.getElementById("act").value;
let spat = document.getElementById("spat").value;
let html = document.getElementById("content");
let coordp;

/***************
 * FUNCTIONS ***
 **************/
function createGeoJson(JSobject){
  /**
   * Input : SPARQL request application/json result (js object)
   * Output : Geojson
   * Source : https://github.com/dhlab-epfl/leaflet-sparql/blob/master/index.html
   */
  //Init geojson
  var geojson = {"type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }, "features": []}
  //Iter on features
  $.each(JSobject.results.bindings, function(i,bindings){

    //Init feature
    feature = {
      type:"Feature",
      geometry: $.geo.WKT.parse(bindings.geom_wkt.value.replace('<http://www.opengis.net/def/crs/OGC/1.3/CRS84> ','')),
      properties: {}
    };
    //Fill properties
    $.each(JSobject.head.vars, function(j, property){
      feature.properties[property] = bindings[property].value;
    });
    geojson.features.push(feature);
  });
  if (geojson['features'].length == 0) {
    alert('Pas de données correspondant à cette recherche.')
  } else {
    //console.log(geojson['features'].length)
    return geojson
  }
};

var divtimeline = document.getElementById('timeline-embed')

function requestData() {

  divtimeline.setAttribute('style', 'height:0px;');
  message.innerHTML = '<p class="noentry">Chargement <img src="./img/loading_cut.gif"></p>';
  
  var bb_filter
  // Deal with bbox on the map
  var tempJson = drawnItems.toGeoJSON();
  
  if (drawnItems.getLayers().length > 0) {
    
    var objects = tempJson.features[0].geometry.coordinates[0];
    var coords_str = ""
    for (var i = 0; i < objects.length; i++){
      if (i < objects.length-1) {
        coords_str += objects[i][0] + ' ' + objects[i][1] + ','
      } else {
        coords_str += objects[i][0] + ' ' + objects[i][1]
      }
    }
    bb_filter = 'FILTER (geof:sfIntersects(?geom_wkt, "<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Polygon((' + coords_str + '))"^^gsp:wktLiteral)).'
  } else {
    //console.log("Pas d'emprise dessinée sur la carte")
    bb_filter = ''
  }
  var extractgroup;
  var extract;
  
  if (createclusters == true){
    extractgroup = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      removeOutsideVisibleBounds:false,
      zoomToBoundsOnClick: true,
      maxClusterRadius:1,
      chunkedLoading:true,
      iconCreateFunction: function(cluster) {
        return L.divIcon({ html: '', className:'clusters', iconSize: L.point(12.5,12.5)}) //L.featureGroup();
        },
      spiderLegPolylineOptions:{ weight: 2, color: '#222', opacity: 0.9 }
    });
  } else {
    extractgroup = L.featureGroup();
  }
  
  //Get value in form fields
  per = document.getElementById("per").value.toLowerCase();
  act = document.getElementById("act").value.toLowerCase();
  spat = document.getElementById("spat").value.toLowerCase();
  //Complete SPARQL query
  /// Empty inputs
  if (per.length > 0 && act.length == 0 && spat.length == 0) {
    compquery = "FILTER ( regex(lcase(?person),'" + per + "')). "
  } else if (per.length == 0 && act.length > 0 && spat.length == 0) {
    compquery = "FILTER ( regex(lcase(?activity),'" + act + "')). "
  } else if (per.length == 0 && act.length == 0 && spat.length > 0) {
    compquery = "FILTER ( regex(lcase(?address),'" + spat + "')). "
    // Two
  } else if (per.length > 0 && act.length > 0 && spat.length == 0) {
    compquery = "FILTER ( regex(lcase(?person),'" + per + "') && " + 
    "regex(lcase(?activity),'" + act + "')" +
    ")."
  } else if (per.length == 0 && act.length > 0 && spat.length > 0) {
    compquery = "FILTER ( regex(lcase(?activity),'" + act + "') && " + 
    "regex(lcase(?address),'" + spat + "')" +
    ")."
  } else if (per.length > 0 && act.length == 0 && spat.length > 0) {
    compquery = "FILTER ( regex(lcase(?person),'" + per + "') && " + 
    "regex(lcase(?address),'" + spat + "')" +
    ")."
    // ALL
  } else if (per.length > 0 && act.length > 0 && spat.length > 0) {
    compquery = "FILTER ( regex(lcase(?person),'" + per + "') && " + 
    "regex(lcase(?activity),'" + act + "') && " +
    "regex(lcase(?address),'" + spat + "')" +
    ")."
  } else if (per.length === 0 && act.length === 0 && spat.length === 0) {
    compquery = ''
  };
  periodfilter = 'FILTER ((?directoryDate >= '+ inputNumberMin.value +') && (?directoryDate <= ' + inputNumberMax.value + ')). '
  //Create the final query
  var s = document.getElementById("selectgraphs");
  var graphname_ = s.options[s.selectedIndex].value;
  var completewhere = "WHERE { GRAPH <" + graphname_ + "> {"
  //var from = 'FROM  <' + graphname_ + '> '
  finalquery = select + completewhere + where + compquery + periodfilter + bb_filter + '} }' +
  'GROUP BY ?uri ?index ?person ?geom_wkt ?directoryName ?directoryDate ' +
  'ORDER BY ASC(?directoryDate) ASC(?index)'
  console.log(finalquery)
  //Create the query URL				
  queryURL = repertoireGraphDB + "?query="+encodeURIComponent(finalquery)+"&?application/json";

/*******************
 ***** MAIN ********
 ******************/

//Initial ajax request
$.ajax({
  url: queryURL,
  Accept: "application/sparql-results+json",
  contentType:"application/sparql-results+json",
  crossdomain:true,
  dataType:"json",
  data:''
}).done((promise) => {
  // Create GeoJSON with Graph DB data
  myVar = createGeoJson(promise)
  console.log(myVar)
  // Create Geojson layer for Leaflet
  extract = '';
  extract = L.geoJSON(myVar,{
    onEachFeature: onEachFeature,
    pointToLayer:pointToLayerExtract,
    filter: function(feature, layer) {
        return (feature.properties.directoryDate <= 1860) && (feature.properties.directoryDate >= 1880);
        }
  });

  //Create Feature group
  extractgroup.removeLayer(extract);
  extract.addTo(extractgroup);
  extractgroup.addTo(map);

  extractgroup.on('clusterclick', function(a){
    if(a.layer._zoom == 18){
    popUpText = '<table id="popuptable">'+
                  '<tr>'+
                    '<th>Raison sociale</th>'+
                    '<th>Source</th>'+
                    '<th>Année</th>'
                  '</tr>';
    //there are many markers inside "a". to be exact: a.layer._childCount much ;-)
    //let's work with the data:
    for (feat in a.layer._markers){
        var line = '<u onclick=openPopUp(' + a.layer._markers[feat]._leaflet_id + ','+ a.layer._leaflet_id +');createlinkDataSoduco('+ a.layer._markers[feat].feature.properties['index'] +')>' + a.layer._markers[feat].feature.properties['person'] + '</u>';
        popUpText+= "<tr><td>"+line+"</td>"+
                    "<td>"+a.layer._markers[feat].feature.properties['directoryName']+"</td>"+
                    "<td>"+a.layer._markers[feat].feature.properties['directoryDate']+"</td></tr>"
      }
    popUpText +='</table>';
    //as we have the content, we should add the popup to the map add the coordinate that is inherent in the cluster:
    var popup = L.popup().setLatLng([a.layer._cLatLng.lat, a.layer._cLatLng.lng]).setContent(popUpText).openOn(map); 
  }
  })

  document.getElementById('loadedperiod').innerHTML = '<p style="text-align: center; height: fit-content;">❓ Le filtre temporel permet de faire varier l\'affichage des points préalablement chargés sur la carte sans lancer une nouvelle recherche.</br>Données chargées pour la période <b>' + inputNumberMin.value + '</b>-<b>' + inputNumberMax.value + '</b>.</p>'
  message.innerHTML = ''

  inputNumberMin.addEventListener('change', function(){
      slidervar.noUiSlider.set([this.value, null]);
  });
  inputNumberMax.addEventListener('change', function(){
      slidervar.noUiSlider.set([null, this.value]);
  });
  
  //Update values on change
  slidervar.noUiSlider.on('update', function( values, handle ) {
      /**** Slider update */
      //console.log(handle);
      if (handle==0){
          document.getElementById('input-number-min').value = values[0];
      } else {
          document.getElementById('input-number-max').value =  values[1];
      }
      rangeMin = document.getElementById('input-number-min').value;
      rangeMax = document.getElementById('input-number-max').value;

      /**** Extraction layer */
      extractgroup.removeLayer(extract);
      //Repopulate it with filtered features
      extract = new L.geoJson(myVar,{
          onEachFeature: onEachFeature,
          filter:
              function(feature, layer) {
                return ((feature.properties.directoryDate <= rangeMax) && (feature.properties.directoryDate >= rangeMin))
              },
          pointToLayer: pointToLayerExtract
      })
      //and back again into the cluster group
      extract.addTo(extractgroup);
      
});
});
}; 
