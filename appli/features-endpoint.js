/*****************************************
 ********** INIT SPARQL QUERY *********
 ****************************************/

// Bases de la requête SPARQL construite par l'utilisateur par le biais du formulaire HTML
var select = 'SELECT distinct ?uri ?index ?person (GROUP_CONCAT(DISTINCT ?activity ; SEPARATOR=" et ") as ?activities) (GROUP_CONCAT(DISTINCT ?address ; SEPARATOR=" et ") as ?addresses) (GROUP_CONCAT(DISTINCT ?address_geocoding ; SEPARATOR=" et ") as ?addresses_geocoding) ?geom_wkt ?directoryName ?directoryDate '

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

var query;
var queryURL;
var compquery = '';

/*****************************************
 ********** INIT OTHER VARIABLES *********
 ****************************************/

var jsonData;      //GEOJSON retourné par la requête ajax
var extract;       //Objet L.geojson créé avec leaflet à partir du GEOJSON
var extractgroup;  //Couche de clusters créée à partir du geojson

/*****************************************
*********** INIT SLIDER  *****************
****************************************/
 
// Création de l'objet slider
var slidervar = document.getElementById('slider');

noUiSlider.create(slidervar, {
    connect: true,
    start: [ 1860, 1880 ], //Période proposée à l'utilisateur par défaut
    step:1,                //Pas de déplacement : 1 an
    behaviour: 'drag',
    range: {
        min: 1790,         //Année minimale proposée à l'utilisateur
        max: 1910          //Année maximale proposée à l'utilisateur
    },
    format: wNumb({
        decimals: 0
    }),
    tooltips: false,
    pips: {                // Choix des années repères sur l'axe X du slider
        mode: 'positions',
        values: [0, 25, 50, 75, 100],
        density: 10
    }
});

//CONNECT SLIDER WITH DATA
//Set default value on input number
inputNumberMin.setAttribute("value", 1860);
inputNumberMax.setAttribute("value", 1880);

// Inititialise les variables correspondant aux valeurs des champs du formulaire
let per = document.getElementById("per").value; //Valeur du champ "Raison sociale"
let act = document.getElementById("act").value; //Valeur du champ "Activité"
let spat = document.getElementById("spat").value; //Valeur du champ "Adresse"

// Initialise les variables correspondant aux objets DOM
//let html = document.getElementById("content");
//var divtimeline = document.getElementById('timeline-embed') // Frise chronologique

/*************************************************
 ******************* FUNCTIONS *******************
 *************************************************/

function createGeoJson(JSobject){
  /**
   * Fonction qui créée un GEOJSON dans la mémoire du navigateur à partir du JSON retourné par le triplestore
   * Input : SPARQL request result in application/json format
   * Output : Geojson
   * Source : https://github.com/dhlab-epfl/leaflet-sparql/blob/master/index.html
   */

  //Initialise la structure du geojson
  var geojson = {"type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }, "features": []}
  //Pour chaque feature du json retourné par la requête SPARQL :
  $.each(JSobject.results.bindings, function(i,bindings){

    //Init feature
    feature = {
      type:"Feature",
      geometry: $.geo.WKT.parse(bindings.geom_wkt.value.replace('<http://www.opengis.net/def/crs/OGC/1.3/CRS84> ','')),
      properties: {}
    };
    //Créée les propriétés
    $.each(JSobject.head.vars, function(j, property){
      feature.properties[property] = bindings[property].value;
    });
    //Ajoute la feature au GEOJSON
    geojson.features.push(feature);
  });
  // Si le geojson est vide, afficher une boite de dialogue avec un message
  if (geojson['features'].length == 0) {
    alert('Pas de données correspondant à cette recherche.')
  } else {
    //Sinon retourner le geojson
    return geojson
  }
};

/*************************************************
 ************** MAIN FUNCTIONS *******************
 *************************************************/

function requestData() {
  /* Fonction qui (1) transmet la requête SPARQL contenant les paramètres de recherche de l'utilisateur au triplestore
  *               (2) convertit le résultat en geojson
  *               (3) ajoute le résultat à la carte
  *               (4) gère le filtrage dynamique temporel des données chargées à l'étape précédente
  * Cette fonction est déclanchée
  */

  // Initialise les variables
  var extract; // L.geojson
  var extractgroup; //L.geojson markercluster
  var bb_filter; //Emprise spatiale sélectionnée par l'utilisateur
  
  // Ajout un gif de chargement tant que l'éxécution de la fonction n'est pas terminée
  divtimeline.setAttribute('style', 'height:0px;');
  message.innerHTML = '<p class="noentry">Chargement <img src="./img/loading_cut.gif"></p>';

  //Réinitialise la div des statistiques
  document.getElementById('statistiques').innerHTML = ''

  // Initialisation de la couche de points de type cluster qui sera affichée sur la carte
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

  //Récupère les valeurs du formulaire (Raison sociale, Activité, Adresse)
  per = document.getElementById("per").value.toLowerCase();
  act = document.getElementById("act").value.toLowerCase();
  spat = document.getElementById("spat").value.toLowerCase();

  //Complète la requête SPARQL avec les filtres récupérés dans les champs du formulaire (Raison sociale, Activité, Adresse)
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
  } else if (per.length > 0 && act.length > 0 && spat.length > 0) {
    compquery = "FILTER ( regex(lcase(?person),'" + per + "') && " + 
    "regex(lcase(?activity),'" + act + "') && " +
    "regex(lcase(?address),'" + spat + "')" +
    ")."
  } else if (per.length === 0 && act.length === 0 && spat.length === 0) {
    compquery = ''
  };
  // Filtre temporel
  periodfilter = 'FILTER ((?directoryDate >= '+ inputNumberMin.value +') && (?directoryDate <= ' + inputNumberMax.value + ')). '
  
  //Filtre spatial : Récupère les coordonnées de la zone dessinée par l'utilisateur pour filtrer spatiallement les résultats de la requête SPARQL
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
    bb_filter = ''
  }

  // Nom du graphe nommé
  var s = document.getElementById("selectgraphs");
  var graphname_ = s.options[s.selectedIndex].value;

  //Création de la requête SPARQL complète à envoyer au triplestore
  var completewhere = "WHERE { GRAPH <" + graphname_ + "> {"
  finalquery = prefixes + select + completewhere + where + compquery + periodfilter + bb_filter + '} }' +
  'GROUP BY ?uri ?index ?person ?geom_wkt ?directoryName ?directoryDate ' +
  'ORDER BY ASC(?directoryDate) ASC(?index)'
  console.log(finalquery)
  //La requête est transmise au serveur sous la forme d'une URL			
  queryURL = endpointURL + "?query="+encodeURIComponent(finalquery)+"&?application/json";

  function downloadGeoJSON() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", graphname_+".geojson");
    dlAnchorElem.click();
  };

/**************************************
 **************** MAIN ****************
 **************************************/

//Initialisation de la requête AJAX
$.ajax({
  url: queryURL,
  Accept: "application/sparql-results+json",
  contentType:"application/sparql-results+json",
  crossdomain:true,
  dataType:"json",
  data:''
}).done((promise) => {
  // Création d'un geojson à partir du json retourné par le triplestore
  jsonData = createGeoJson(promise)

  var downloadbtn = document.getElementById("downloadbutton")
  downloadbtn.classList.remove("w3-disabled");
  downloadbtn.disabled = false;
  
  var s = document.getElementById("selectgraphs");
  var graphname_ = s.options[s.selectedIndex].value;
  
  // Création d'un objet L.geoJSON dans leaflet
  extract = '';
  extract = L.geoJSON(jsonData,{
    onEachFeature: onEachFeature,
    pointToLayer:pointToLayerExtract,
    filter: function(feature, layer) {
        return (feature.properties.directoryDate <= 1860) && (feature.properties.directoryDate >= 1880);
        }
  });

  //Si des données sont déjà chargées dans la carte, les supprimer
  extractgroup.removeLayer(extract);
  //Ajouter les nouvelles données dans la couche de clusters
  extract.addTo(extractgroup);
  // Ajouter la couche des clusters mises à jour à la carte
  extractgroup.addTo(map);

  //////////////////// EVENTS ///////////////////////////

  // Au clic sur un cluster, afficher une pop-up qui liste les informations principales de chaque point
  extractgroup.on('clusterclick', function(a){
    if(a.layer._zoom == 18){
    popUpText = '<table id="popuptable">'+
                  '<tr>'+
                    '<th>Raison sociale</th>'+
                    '<th>Source</th>'+
                    '<th>Année</th>'
                  '</tr>';
    
    //Création d'une pop-up pour les clusters (points situés aux mêmes coordonnées)
    for (feat in a.layer._markers){
        var line = '<u onclick=openPopUp(' + a.layer._markers[feat]._leaflet_id + ','+ a.layer._leaflet_id +');createlinkDataSoduco("'+ a.layer._markers[feat].feature.properties['index'] +'")>' + a.layer._markers[feat].feature.properties['person'] + '</u>';
        popUpText+= "<tr><td>"+line+"</td>"+
                    "<td>"+a.layer._markers[feat].feature.properties['directoryName']+"</td>"+
                    "<td>"+a.layer._markers[feat].feature.properties['directoryDate']+"</td></tr>"
      }
    popUpText +='</table>';
    var popup = L.popup().setLatLng([a.layer._cLatLng.lat, a.layer._cLatLng.lng]).setContent(popUpText).openOn(map); 
  }
  })

  // Filtrer temporellement les données qui viennent d'être ajoutées à la carte 
  // si le slider temporel est mis à jour
  // Permet de ne pas requêter le serveur si on veut faire varier l'affichage selon les dates dans la période sélectionnée précédement
  document.getElementById('loadedperiod').innerHTML = '<p style="text-align: center; height: fit-content;">❓ Le filtre temporel permet de faire varier l\'affichage des points préalablement chargés sur la carte sans lancer une nouvelle recherche.</br>Données chargées pour la période <b>' + inputNumberMin.value + '</b>-<b>' + inputNumberMax.value + '</b>.</p>'
  message.innerHTML = ''

  inputNumberMin.addEventListener('change', function(){
      slidervar.noUiSlider.set([this.value, null]);
  });
  inputNumberMax.addEventListener('change', function(){
      slidervar.noUiSlider.set([null, this.value]);
  });
  
  slidervar.noUiSlider.on('update', function( values, handle ) {
      if (handle==0){
          document.getElementById('input-number-min').value = values[0];
      } else {
          document.getElementById('input-number-max').value =  values[1];
      }
      rangeMin = document.getElementById('input-number-min').value;
      rangeMax = document.getElementById('input-number-max').value;

      extractgroup.removeLayer(extract);
      extract = new L.geoJson(jsonData,{
          onEachFeature: onEachFeature,
          filter:
              function(feature, layer) {
                return ((feature.properties.directoryDate <= rangeMax) && (feature.properties.directoryDate >= rangeMin))
              },
          pointToLayer: pointToLayerExtract
      })
      extract.addTo(extractgroup);
      
    });
});
}; 