/************************************
 ********** FUNCTIONS ***************
 ************************************/

function totalNumEntries(graphname_){
  /** 
   * Fonction qui compte le nombre d'entrées d'annuaires distinctes comprises dans le graphe de connaissances
   * Input : ID du graphe nommé sélectionné
   * Output : Insertion d'un élément HTML donnant le nombre d'entrées'
   */
  var totalEntries;
  var statsdiv = document.getElementById('totalstatsE')

  //SPARQL
  var query = prefixes +
  'SELECT (count(distinct ?index) as ?count) '+
  "WHERE { "+
    "GRAPH <" +  graphname_ + "> {" +
    "?uri a adb:Entry."+
    "?uri adb:numEntry ?index.}}"
  var queryURL = endpointURL + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    totalEntries = promise.results.bindings[0].count.value
    statsdiv.innerHTML += '<p style="text-align:center;">Nombre d\'entrées d\'annuaires<br><span style="color:purple;font-size: medium">' +  totalEntries + '<span></p>'
  })                          
};

function totalNumRessources(graphname_){
  /** 
 * Fonction qui compte le nombre de ressources RDF distinctes créées à partir des entrées d'annuaires comprises dans le graphe de connaissances
 * Input : ID du graphe nommé sélectionné
 * Output : Insertion d'un élément HTML donnant le nombre de ressources
 */
  var totalRessources;
  var statsdiv = document.getElementById('totalstatsR')

  //SPARQL
  var query = prefixes+
  'SELECT (count(distinct ?uri) as ?count) '+
  "WHERE { "+
    "GRAPH <" +  graphname_ + "> {" +
    "?uri a adb:Entry.}}"
  var queryURL = endpointURL + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    totalRessources = promise.results.bindings[0].count.value
    statsdiv.innerHTML += '<p style="text-align:center;">Nombre de ressources RDF <br><span style="color:purple;font-size: medium">' +  totalRessources + '<span></p>'
  })
                            
};

function numTriples(graphname_){
  /** 
   * Fonction qui compte le nombre de triplets RDF dans le graphe de connaissances
   * Input : ID du graphe nommé sélectionné
   * Output : Insertion d'un élément HTML donnant le nombre de triplets
   */
  var countTriples;
  var statsdiv = document.getElementById('totalstatsT')

  //SPARQL request to get total number of entries
  var query = prefixes+
  'SELECT (count(distinct *) as ?count) '+
  "WHERE { "+
    "GRAPH <" +  graphname_ + "> {" +
    "?s ?p ?o}}"
  var queryURL = endpointURL + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    countTriples = promise.results.bindings[0].count.value
    statsdiv.innerHTML += '<p style="text-align:center;">Nombre de triplets RDF <br><span style="color:purple;font-size: medium">' +  countTriples + '<span></p>'
  })                      
};

function numSameAS(graphname_){
    /** 
   * Fonction qui compte le nombre de liens sameAs dans le graphe (où le lien relie forcément deux ressources différentes)
   * Input : ID du graphe nommé sélectionné
   * Output : Insertion d'un élément HTML donnant le nombre de liens
   */
  var countSameAS;
  var statsdiv = document.getElementById('totalstatsSameAs')

  //SPARQL request to get total number of sameAs link where ?s != ?p
  var query = prefixes+
  'SELECT (count(distinct *) as ?count) '+
  "WHERE { "+
    "GRAPH <" +  graphname_ + "> {" +
    "?e1 a adb:Entry."+
    "?e2 a adb:Entry."+
    "?e1 owl:sameAs ?e2."+
  "FILTER (?e1 != ?e2)"+
  "}}"
  var queryURL = endpointURL + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    countSameAS = promise.results.bindings[0].count.value
    statsdiv.innerHTML += '<p style="text-align:center;">Nombre de liens sameAs entre des ressources différentes<br><span style="color:purple;font-size: medium">' +  countSameAS + '<span></p>'
  })                     
};

function statsCountByYear(graphname_){
   /** 
   * Fonction qui construit un histogramme Plotly représentant le nombre d'entrées d'annuaires contenu dans le graphe par année
   * Input : ID du graphe nommé sélectionné
   * Output : Insertion d'un élément HTML contenant l'histogramme
   */

  //SPARQL
  var query = prefixes +
  'SELECT (count(distinct ?index) as ?count) ?directoryDate '+
  "WHERE { "+
    "GRAPH <" +  graphname_ + "> {" +
    "?uri a adb:Entry."+
    "?uri adb:numEntry ?index."+
    "?uri prov:wasDerivedFrom ?directory."+
    "?directory pav:createdOn ?directoryDate."+
    "} } GROUP BY ?directoryDate"+
    " ORDER BY ASC(?directoryDate)"
  var queryURL = endpointURL + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";

  var json = []

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    $.each(promise.results.bindings, function(i,bindings){
  
      //Init feature
      var feature = {
        "date": bindings.directoryDate.value,
        "count": bindings.count.value}
      json.push(feature);
      });
      
    }).done((promise) => {
        const dates = json.map(item => item.date);
        const counts = json.map(item => item.count);

        const data = [{
            x: dates,
            y: counts,
            type: 'bar',
            marker: {color: 'purple'},
        }];

        const layout = {
            title: {text:'Nombre d\'entrées d\'annuaires extraites par année',
                    font:{
                        family:'Verdana',
                        size:15,
                        color:'black'
                    }
            },
            xaxis: {
                title: 'Année'
            },
            yaxis: {
                title: 'Effectif'
            }
        };

        Plotly.newPlot('barplot', data, layout);
    }); // AJAX END
    
};


/****************************************
 ********** MAIN FUNCTION ***************
 ***************************************/

function getStats(){
  // Informations sur le graphe sélectionné par l'utilisateur
  var s = document.getElementById("selectgraphs");
  var graphlabel_ = s.options[s.selectedIndex].text;
  var graphname_ = s.options[s.selectedIndex].value;

  // Création des objets HTML où sont écrits les résultats des fonctions statistiques
  var statsdiv = document.getElementById("statistiques")
  statsdiv.innerHTML = ''
  statsdiv.innerHTML += '<h3 style="margin:10px;">Statistiques du jeu de données ' + '"'+ graphlabel_ + '"' + '</h3>'+
  '<div id="totalstats">'+
      '<div id="totalstatsE"></div>'+
      '<div id="totalstatsR"></div>'+
      '<div id="totalstatsT"></div>'+
      '<div id="totalstatsSameAs"></div>'+
  '</div>'+
  '<div id="barplot"></div>'
  
  //Exécution des fonctions statistiques
  totalNumEntries(graphname_)
  totalNumRessources(graphname_)
  numTriples(graphname_)
  numSameAS(graphname_)
  statsCountByYear(graphname_)
  window.scrollTo(0, document.body.scrollHeight);
}