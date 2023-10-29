## Visualiser les entrées d'un graphe nommé donné

```sparql
PREFIX dir: <http://rdf.geohistoricaldata.org/def/directory#>
SELECT * WHERE { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans>
    { ?s ?p ?o .}
} limit 100 
```

## Exporter les données d'un graphe nommé donné
```sparql
PREFIX dir: <http://rdf.geohistoricaldata.org/def/directory#>
CONSTRUCT {?s ?p ?o} 
WHERE { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans>
    { ?s ?p ?o .}
} 
```

## Exporter les liens sameAs: les importer dans un repository (case à cocher Disable sameAs désactivée), exécuter la requête ci-dessous et exporter le résultat en CSV pour le pousser dans la base de données

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#> 
select distinct ?entry_id1 ?entry_id2 ?named_graph
where {?s owl:sameAs ?p.
	FILTER (?s != ?p).
    BIND(STRAFTER(STR(?s), 'http://rdf.geohistoricaldata.org/id/directories/entry/') AS ?entry_id1).
    BIND(STRAFTER(STR(?p), 'http://rdf.geohistoricaldata.org/id/directories/entry/') AS ?entry_id2).
    BIND('nouveautes_test' AS ?named_graph).}
```


## Compter le nombre d'uri distinctes dans un répertoire
```sparql
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rda: <http://rdaregistry.info/Elements/a/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX owl: <http://www.w3.org/2002/07/owl#> 
PREFIX fn: <http://www.w3.org/2005/xpath-functions#> 
PREFIX prov: <http://www.w3.org/ns/prov#> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX pav: <http://purl.org/pav/> 
PREFIX locn: <http://www.w3.org/ns/locn#> 
PREFIX gsp: <http://www.opengis.net/ont/geosparql#> 
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select (count (?uri) as ?c)
where {
    ?uri a adb:Entry
}
```

## Construct pour exporter un graphe nommé en local
```sparql
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rda: <http://rdaregistry.info/Elements/a/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX owl: <http://www.w3.org/2002/07/owl#> 
PREFIX fn: <http://www.w3.org/2005/xpath-functions#> 
PREFIX prov: <http://www.w3.org/ns/prov#> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX pav: <http://purl.org/pav/> 
PREFIX locn: <http://www.w3.org/ns/locn#> 
PREFIX gsp: <http://www.opengis.net/ont/geosparql#> 
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dcterms: <http://purl.org/dc/terms/>

construct {
    ?uri rdf:type adb:Entry.
    ?uri adb:numEntry ?numEntry.
    ?uri adb:indexExt ?index.
    ?uri rdfs:label ?label.
    ?uri rda:P50104 ?activity.
    ?uri locn:fullAddress ?fullAddress.
    ?uri locn:locatorDesignator ?numVoie.
    ?uri locn:thoroughfare ?voie.
    ?uri prov:wasDerivedFrom ?directory.
    ?uri dcterms:issued ?directoryDate.
} 
where { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/photographes> {
    ?uri rdf:type adb:Entry.
    ?uri adb:numEntry ?numEntry.
    ?uri adb:indexExt ?index.
    ?uri rdfs:label ?label.
    ?uri rda:P50104 ?activity.
    ?uri locn:fullAddress ?fullAddress.
    ?uri locn:locatorDesignator ?numVoie.
        OPTIONAL{?uri locn:thoroughfare ?voie.}
    ?uri prov:wasDerivedFrom ?directory.
    ?uri dcterms:issued ?directoryDate.
    }
} 
order by ?index
```

## Compter le nombre de lien sameAS pour lesquels uri1 != uri2

```sparql
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rda: <http://rdaregistry.info/Elements/a/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX owl: <http://www.w3.org/2002/07/owl#> 
PREFIX fn: <http://www.w3.org/2005/xpath-functions#> 
PREFIX prov: <http://www.w3.org/ns/prov#> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX pav: <http://purl.org/pav/> 
PREFIX locn: <http://www.w3.org/ns/locn#> 
PREFIX gsp: <http://www.opengis.net/ont/geosparql#> 
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select (count(distinct *) as ?count)
where {?s owl:sameAs ?p.
	FILTER (?s != ?p)}
```

## Récupérer les géométries
```sparql
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX gsp: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
SELECT distinct ?uri ?index ?person ?address_geocoding ?geom_wkt ?geom_wkb
FROM <http://rdf.geohistoricaldata.org/id/directories/graveurs_de_cartes>
WHERE { ?uri a adb:Entry.
    ?uri adb:numEntry ?index.
    ?uri rdfs:label ?person.
    ?uri locn:address ?add1.
    ?add1 locn:fullAddress ?address_geocoding.
    ?add1 prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0002>.
    ?add1 gsp:hasGeometry ?geom.
    ?geom gsp:asWKT ?geom_wkt.
    ?geom adb:asWKB ?geom_wkb.
}
```

## Requête utilisée pour créer le geojson
```sparql
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX owl: <http://www.w3.org/2002/07/owl#> 
PREFIX fn: <http://www.w3.org/2005/xpath-functions#> 
PREFIX prov: <http://www.w3.org/ns/prov#> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
PREFIX pav: <http://purl.org/pav/> 
PREFIX locn: <http://www.w3.org/ns/locn#> 
PREFIX gsp: <http://www.opengis.net/ont/geosparql#> 
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX rda: <http://rdaregistry.info/Elements/a/>
SELECT distinct ?uri ?index ?person ?activity ?address ?address_geocoding ?geom_wkt ?directoryName ?directoryDate 
FROM  <http://rdf.geohistoricaldata.org/id/directories/photographes> 
WHERE { ?uri a adb:Entry.
    ?uri adb:numEntry ?index.
    ?uri rdfs:label ?person.
    ?uri prov:wasDerivedFrom ?directory.
    ?directory rdfs:label ?directoryName.
    ?directory pav:createdOn ?directoryDate.
    ?uri locn:address ?add1. 
    ?add1 locn:fullAddress ?address_geocoding. 
    ?add1 prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0002>. 
    ?add1 gsp:hasGeometry ?geom. 
    ?geom gsp:asWKT ?geom_wkt.
    ?uri locn:address ?add2. 
    ?add2 locn:fullAddress ?address. 
    ?add2 prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0001>. 
    ?uri rda:P50104 ?activity.
    FILTER ((?directoryDate >= 1800) && (?directoryDate <= 1900)). 
} 
```
