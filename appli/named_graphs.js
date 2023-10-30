/********* QUERY *******/
var querynamedgraph = "PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> " +
"PREFIX dcat: <http://www.w3.org/ns/dcat#> "+
"PREFIX dcterms: <http://purl.org/dc/terms/> "+
"SELECT ?title ?ng "+
"WHERE { "+
"?s a dcat:Dataset. "+ 
"?s dcterms:title ?title. "+ 
"?s sd:namedGraph ?ng. "+ 
"} " +
"ORDER BY ?title"

var queryNGURL = repertoireGraphDB + "?query="+encodeURIComponent(querynamedgraph)+"&?outputFormat=rawResponse";

/****** TOOLS *******/
var selectlist = document.getElementById('selectgraphs')

function createNamedGraphJson(JSobject){
    /**
     * Input : SPARQL request application/json result (js object)
     * Output : Geojson
     * Source : https://github.com/dhlab-epfl/leaflet-sparql/blob/master/index.html
     */
    
    //Init geojson
    var namedgraphjson = {"features": []}
    //Iter on features
    $.each(JSobject.results.bindings, function(i,bindings){
        //Init feature
        feature = {
        };
        feature["title"] = bindings["title"].value;
        feature["from"] = bindings["ng"].value;

        var option = document.createElement("option");
        option.text = feature["title"];
        option.value = feature["from"];

        selectlist.add(option, selectlist[-1])

        namedgraphjson.features.push(feature);
    });
    if (namedgraphjson['features'].length == 0) {
      alert('Aucun graphe nommé dans la liste')
    } else {
      console.log(namedgraphjson)
    }
  };
  
/*********** AJAX *********/
var urigraph
window.onload = function(e){ 
    $.ajax({
        url: queryNGURL,
        Accept: "application/sparql-results+json",
        contentType:"application/sparql-results+json",
        crossdomain:true,
        dataType:"json",
        data:''
        }).done((promise) => {
        namedgraphs = createNamedGraphJson(promise)
    });
    var selectlist = document.getElementById('selectgraphs')
    urigraph = selectlist[selectlist.selectedIndex].value;
}