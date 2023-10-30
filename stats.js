function totalNumEntries(graphname_){
    var totalEntries;
    var statsdiv = document.getElementById('totalstats')

    //SPARQL request to get total number of entries
    var query = "PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#> "+
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "+
    "PREFIX owl: <http://www.w3.org/2002/07/owl#> "+
    "PREFIX fn: <http://www.w3.org/2005/xpath-functions#> "+
    "PREFIX prov: <http://www.w3.org/ns/prov#> "+
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> "+
    "PREFIX pav: <http://purl.org/pav/> "+
    "PREFIX locn: <http://www.w3.org/ns/locn#> "+
    "PREFIX gsp: <http://www.opengis.net/ont/geosparql#> "+
    'SELECT (count(distinct ?index) as ?count) '+
    "WHERE { "+
      "GRAPH <" +  graphname_ + "> {" +
      "?uri a adb:Entry."+
      "?uri adb:numEntry ?index.}}"
  var queryURL = repertoireGraphDB + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";
  console.log(query)

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    console.log(promise)
    totalEntries = promise.results.bindings[0].count.value
    statsdiv.innerHTML += '<p style="text-align:center;">Nombre d\'entrées<br><span style="color:purple;font-size: medium">' +  totalEntries + '<span></p>'
})
                            
};

function totalNumRessources(graphname_){
    var totalRessources;
    var statsdiv = document.getElementById('totalstats')

    //SPARQL request to get total number of entries
    var query = "PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#> "+
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "+
    "PREFIX owl: <http://www.w3.org/2002/07/owl#> "+
    "PREFIX fn: <http://www.w3.org/2005/xpath-functions#> "+
    "PREFIX prov: <http://www.w3.org/ns/prov#> "+
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> "+
    "PREFIX pav: <http://purl.org/pav/> "+
    "PREFIX locn: <http://www.w3.org/ns/locn#> "+
    "PREFIX gsp: <http://www.opengis.net/ont/geosparql#> "+
    'SELECT (count(distinct ?uri) as ?count) '+
    "WHERE { "+
      "GRAPH <" +  graphname_ + "> {" +
      "?uri a adb:Entry."+
      "?uri adb:numEntry ?index.}}"
  var queryURL = repertoireGraphDB + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";
  console.log(query)

  $.ajax({
    url: queryURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    dataType:"json",
    data:''
  }).done((promise) => {
    totalRessources = promise.results.bindings[0].count.value
    statsdiv.innerHTML += '<p style="text-align:center;">Nombre de ressources RDF<br><span style="color:purple;font-size: medium">' +  totalRessources + '<span></p>'
  })
                            
};

function statsCountByYear(graphname_){
    //SPARQL request
    var query = "PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#> "+
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "+
    "PREFIX owl: <http://www.w3.org/2002/07/owl#> "+
    "PREFIX fn: <http://www.w3.org/2005/xpath-functions#> "+
    "PREFIX prov: <http://www.w3.org/ns/prov#> "+
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> "+
    "PREFIX pav: <http://purl.org/pav/> "+
    "PREFIX locn: <http://www.w3.org/ns/locn#> "+
    "PREFIX gsp: <http://www.opengis.net/ont/geosparql#> "+
    'SELECT (count(distinct ?index) as ?count) ?directoryDate '+
    "WHERE { "+
      "GRAPH <" +  graphname_ + "> {" +
      "?uri a adb:Entry."+
      "?uri adb:numEntry ?index."+
      "?uri prov:wasDerivedFrom ?directory."+
      "?directory pav:createdOn ?directoryDate."+
      "} } GROUP BY ?directoryDate"+
      " ORDER BY ASC(?directoryDate)"
  var queryURL = repertoireGraphDB + "?query="+encodeURIComponent(query)+"&?outputFormat=rawResponse";
  console.log(query)

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
};//FUNCTION END

function getStats(){
    var s = document.getElementById("selectgraphs");
    var graphlabel_ = s.options[s.selectedIndex].text;
    var graphname_ = s.options[s.selectedIndex].value;
    var statsdiv = document.getElementById("statistiques")
    statsdiv.innerHTML = ''
    statsdiv.innerHTML += '<h3 style="margin:10px;">Statistiques du jeu de données ' + '"'+ graphlabel_ + '"' + '</h3>'+
    '<div id="totalstats"></div>'+
    '<div id="barplot"></div>'
    totalNumEntries(graphname_)
    totalNumRessources(graphname_)
    statsCountByYear(graphname_)
}