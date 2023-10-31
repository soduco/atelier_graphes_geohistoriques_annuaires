/*********************************
 ******* INIT DOM OBJECTS ********
 *********************************/

var divtimeline = document.getElementById('timeline-embed')
var divmessage = document.getElementById('message')

var inputNumberMin = document.getElementById('input-number-min');
var inputNumberMax = document.getElementById('input-number-max');

/*********************************
 *********** FUNCTIONS ***********
 *********************************/

function createlinkDataSoduco(uri_){
  /**
   * Fonction qui créée un JSON pour Timeline JSON
   * Input :  URI d'une entrée géocodée sur la carte et sélectionnée par l'utilisateur
   * Output : JSON pour Timeline JS contenant toutes les entrées liées à l'entrées sélectionnées
   */

  //Récupération des informations du graphe nommé choisi par l'utilisateur
  var s = document.getElementById("selectgraphs");
  var graphname_ = s.options[s.selectedIndex].value;

  // Requête SPARQL qui récupère, pour l'uri fourni, l'ensemble des entrées d'annuaires liées à elle dans le graphe de connaissances
  var query2 = prefixes +
  'SELECT distinct ?uri ?index ?person (GROUP_CONCAT(DISTINCT ?activity ; SEPARATOR=" |||et||| ") as ?activities) ?address ?directoryName ?directoryDate '+
  "WHERE { "+
    "GRAPH <" +  graphname_ + "> {" +
    "<http://rdf.geohistoricaldata.org/id/directories/entry/" + uri_ + "> owl:sameAs ?uri."+
    "?uri a adb:Entry."+
    "?uri adb:numEntry ?index."+
    "?uri rdfs:label ?person."+
    "?uri prov:wasDerivedFrom ?directory."+
    "?directory rdfs:label ?directoryName."+
    "?directory pav:createdOn ?directoryDate."+
    "?uri locn:address ?add2."+
    "?add2 locn:fullAddress ?address."+
    "?add2 prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0001>."+
    "OPTIONAL{?uri <http://rdaregistry.info/Elements/a/P50104> ?activity.}"+
    "} }" +
  "GROUP BY ?uri ?index ?person ?address ?directoryName ?directoryDate "+
  "ORDER BY ASC(?index) ASC(?directoryDate)"
  var queryURL2 = endpointURL + "?query="+encodeURIComponent(query2)+"&?outputFormat=rawResponse";

  // Initialisation du JSON résultat
  var timelinejson = {"title": {"text":{"headline":'Données liées'}}, "events": []}

  //Options d'ititialisation de la frise chronologique
  var options = {
    scale_factor:1,
    language:'fr',
    start_at_slide:1,
    hash_bookmark: false,
    initial_zoom: 0
  }

  //Requête AJAX => exécution de la requête SPARQL
  $.ajax({
    url: queryURL2,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    //Pour chaque objet du JSON retourné par le triplestore
    $.each(promise.results.bindings, function(i,bindings){

      //Init feature
      var feature = {
        "start_date": {
              "year":bindings.directoryDate.value,
              "month":"1",
              "day":"1",
              "display_date":bindings.directoryDate.value
          },
        "end_date": {
              "year":bindings.directoryDate.value,
              "month":"12",
              "day":"31",
              "display_date":bindings.directoryDate.value,
          },
        "text": {
          "headline": bindings.person.value,
          "text": '<p>' + bindings.activities.value + '</br>' + bindings.address.value + '<br/>Source : ' + bindings.directoryName.value + ' - ' + bindings.index.value + "<br/>Nombre d'entités liées : " + promise.results.bindings.length.toString() + '</p>'
        },
        "group":bindings.address.value,
        "background":{"color":"#1c244b"},
        "unique_id":bindings.activities.uri
      }
      //Ajout de l'objet au JSON résultat
      timelinejson.events.push(feature);
    });
        
  }).done((promise) => {
    // Création de la frise chronologique dans le DOM
    if (timelinejson.events.length > 1){
      divtimeline.setAttribute('style', 'height:800px;');
      window.timeline = new TL.Timeline('timeline-embed', timelinejson, options);
      message.innerHTML = '';
      window.scrollTo(0, document.body.scrollHeight);
    } else {
      divtimeline.setAttribute('style', 'height:0px;');
      message.innerHTML = '<p class="noentry">Aucune entrée liée.</p>';
    }
  });
};