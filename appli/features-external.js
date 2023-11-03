/**************************************
 *********** FUNCTIONS ****************
**************************************/

async function searchLinkedDataWithBNF(id,graphname_) {
    /**
   * Fonction qui recherche pour une ressource du graphe les ressources issues de D=data BNF qui sont liées
   * Input : ID de la ressource (numEntry)
   * Output : void. La fonction insère un élément HTML dans la page avec les informations issues de data BNF relative à l'entrée sélectionnée.
   */
    accepted_graphs = ['photographes']
    if (accepted_graphs.includes('photographes')) {

    

    // Recherche l'élément HTML où seront écrits les résultats
    var html = document.getElementById('bnfdata')
  
    // Requête SPARQL à éxécuter dans le triplestore soduco/local pour récupérer les liens sameAs vers des ressources de la BNF s'il y en a
    var query3 = prefixes+
        "SELECT DISTINCT * where { <http://rdf.geohistoricaldata.org/id/directories/entry/" + id + "> owl:sameAs ?uri." +
        " FILTER (regex(str(?uri),'bnf'))" +
        "}";
    var queryURL3 = endpointURL + "?query="+encodeURIComponent(query3)+"&?application/json"
  
    //2. Requête AJAX vers data BNF à partir des URI de la BNF liées aux ressources SODUCO
   $.ajax({
      url: queryURL3,
      Accept: "application/sparql-results+json",
      contentType:"application/sparql-results+json",
      dataType:"json",
      data:''
    }).done((promise) => {
      // If linked data with data.bnf.fr
      if (promise.results.bindings.length > 0){
        $.each(promise.results.bindings, function(i,bindings){
  
          var simple_uri = bindings.uri.value.replace('#about', '')
          // Requête éxécutée sur data BNF
          var query4 = "PREFIX skos: <http://www.w3.org/2004/02/skos/core#> "+
          "PREFIX foaf: <http://xmlns.com/foaf/0.1/> "+
          "PREFIX bnf-onto: <http://data.bnf.fr/ontology/bnf-onto/> "+
          
          'SELECT ?name (GROUP_CONCAT(DISTINCT?altname ; SEPARATOR=", ") as ?altname) ?act ?fy ?ly '+
          "WHERE {"+
          " <" + simple_uri + "> skos:prefLabel ?name. "+
          " <" + simple_uri + "> skos:altLabel ?altname. "+
          " OPTIONAL{<" + bindings.uri.value + ">  <http://rdaregistry.info/Elements/a/#P50113> ?act.} "+
          " OPTIONAL{<" + bindings.uri.value + "> 	bnf-onto:firstYear ?fy.} "+
          " OPTIONAL{<" + bindings.uri.value + "> bnf-onto:lastYear ?ly}. "+
          "}"
          var queryURL4 = "https://data.bnf.fr/sparql?query="+encodeURIComponent(query4)+"&format=application/json"
          
          //Requête AJAX qui exécute la requête SPARQL précédente dans le triplestore de la BNF
          $.ajax({
            url: queryURL4,
            Accept: "application/sparql-results+json",
            contentType:"application/sparql-results+json",
            dataType:"json",
            data:''
          }).done((promise) => {
            $.each(promise.results.bindings, function(i,bindings){
              //Ecriture des résultats
              html.innerHTML += '<h4 id="bnfdata" style="height:fit-content;">Ressources associées sur data.bnf.fr</h4>'
              html.innerHTML += '<p><a href="' + simple_uri + '" target="_blank"><b>' + bindings.name.value + '</b></a><p>'
              html.innerHTML += '<p>' + bindings.act.value + '</p>'
              const regex = /\([0-9]{4}-[0-9]{4}\)/g;
              var alt = bindings.altname.value.replace(regex,'')
              html.innerHTML += '<p><small>Aussi connu sous le(s) nom(s) suivant(s) : ' + alt.replace(/ ,/g,',') + '</small></p>'
            })
          });
          
        });
      // Else
      } else {
        html.innerHTML = '<p id="bnfdata" style="height:fit-content;"></p>'
        console.log('Pas de ressources externes associées.')
      }
    });
  }
};