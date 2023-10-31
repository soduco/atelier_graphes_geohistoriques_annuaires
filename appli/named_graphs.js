/*****************************************
 *************  SPARQL QUERY *************
 ****************************************/

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

var queryNGURL = endpointURL + "?query="+encodeURIComponent(querynamedgraph)+"&?outputFormat=rawResponse";

/*******************************************
 ************* INIT DOM OBJECT *************
 *******************************************/

var selectlist = document.getElementById('selectgraphs')

/*******************************************
 ******************* FUNCTION **************
 *******************************************/
function createNamedGraphJson(JSobject){
  /**
   * Fonction qui récupère la liste des graphes nommés contenus dans le triplestore et rempli la liste déroulante de la section dataset de l'aplication
   * Input : Résultat de la requête AJAX qui éxécute la requête SPARQL récupère la liste des graphes nommés
   * Output : JSON des graphes nommés
   */
  
  //Initialiser l'objet json
  var namedgraphjson = {"features": []}
  //Itère sur chaque feature
  $.each(JSobject.results.bindings, function(i,bindings){
    //Initialise un objet json
    feature = {
    };
    //Complète la valeur de ses propriétés
    feature["title"] = bindings["title"].value;
    feature["from"] = bindings["ng"].value;

    //A partir des propriétés du JSON, création d'un objet DOM dans l'objet HTML <select> 
    var option = document.createElement("option");
    option.text = feature["title"];
    option.value = feature["from"];
    
    // Sélectionner un graphe par défault dans la liste des graphes
    selectlist.add(option, selectlist[-1])

    // Ajouter l'objet json dans le json résultat
    namedgraphjson.features.push(feature);
  });
  if (namedgraphjson['features'].length == 0) {
    // Si aucun graphe nommé n'est trouvé, afficher une boîte de dialogue
    alert('Aucun graphe nommé dans la liste')
  } else {
    // Sinon, afficher la liste des graphes dans la console
    console.log(namedgraphjson)
  }
};

/*******************************************
 ****************** MAIN  ******************
 *******************************************/

//Variables;
var urigraph;

// Au chargement de la page
window.onload = function(e){
  $.ajax({
    // Exécuter la requête SPARQL
    url: queryNGURL,
    Accept: "application/sparql-results+json",
    contentType:"application/sparql-results+json",
    crossdomain:true,
    dataType:"json",
    data:''
    }).done((promise) => {
    //Création du JSON et des objets <option> de l'objet HTML <select>
    namedgraphs = createNamedGraphJson(promise)
  });
  //Sélection d'un élément du json par défault
  var selectlist = document.getElementById('selectgraphs')
  urigraph = selectlist[selectlist.selectedIndex].value;
}