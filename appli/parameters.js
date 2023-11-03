/***********************************************************************
 * Adresse du répertoire GraphDB où se trouve le graphe géo-historique *
 * *********************************************************************/
// URL du triplestore du projet ANR SODUCO
var endpointURL = "https://dir.geohistoricaldata.org/sparql/"

// A remplacer par l'URL de votre triplestore si vous travaillez en local. Par exemple :
//var endpointURL = "http://HPE2101P101:7200/repositories/mon-triplestore-local"

/***********************************************************************
 * Prefixes des vocabulaires utilisés dans le graphe de connaissances  *
 * *********************************************************************/
const prefixes = "PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#> "+
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
"PREFIX skos: <http://www.w3.org/2004/02/skos/core#>"+
"PREFIX foaf: <http://xmlns.com/foaf/0.1/>"