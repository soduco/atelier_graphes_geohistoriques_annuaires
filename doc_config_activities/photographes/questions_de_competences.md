# CQ1: Quelle est l’adresse du photographe Gallino en 1862 ?

Réponse attendue: 11 rue Sucher
```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
select * where { graph <http://rdf.geohistoricaldata.org/id/directories/photographes> {
    ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1862. 
    ?e locn:address ?add.
    ?add locn:fullAddress ?fullAdd.
    ?add prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0001>.
    Filter regex(lcase(?label), "gallino").
}
}
```
# CQ2: Combien y a-t-il de "photographes" localisés rue de Rivoli en 1856 ? 
Réponse attendue: 14
```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
select (count(distinct ?index) as ?nombre) where {graph <http://rdf.geohistoricaldata.org/id/directories/photographes> {
    ?e a ont:Entry.
    ?e ont:numEntry ?index.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1856. 
    ?e locn:address ?add.
    ?add locn:thoroughfare ?voie.
    ?add prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0001>.
  Filter regex(lcase(?voie), "rivoli").
}
}
```
# CQ3: Quels sont les photographes situés dans le rectangle englobant (Xmax=2.3385 Ymax= 48.8663 Xmin = 2.3360 Ymin= 48.8625) en 1875 ? 

Réponse attendue: Barrès, Baur Vve, Bureau S, Coutellier, Derepas, Pignolet, Prudent
```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX gsp: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
select ?label where { graph <http://rdf.geohistoricaldata.org/id/directories/photographes> {
    ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1875. 
    ?e locn:address ?add.
    ?add gsp:hasGeometry ?geom.
    ?geom gsp:asWKT ?wkt.
    FILTER (geof:sfIntersects(?wkt, "<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Polygon((2.3360 48.8625,2.3360 48.8663,2.3385 48.8663,2.3385 48.8625,2.3360 48.8625))"^^gsp:wktLiteral))
}
}
```

# CQ4: Quels photographes ont potentiellement déménagé entre 1860 et 1870?

```
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
select distinct ?label ?voie ?labelo ?voieo where { graph <http://rdf.geohistoricaldata.org/id/directories/photographes> {
	?e a ont:Entry.
	?e rdfs:label ?label.
    	?e prov:wasDerivedFrom ?directory.
    	?directory pav:createdOn ?date. 
    	?e locn:address ?add.
    	?add locn:thoroughfare ?voie.
	?e owl:sameAs ?o.
	?o rdfs:label ?labelo.
	?o locn:address ?addo.
    	?addo locn:thoroughfare ?voieo.
    	Filter ((?date > 1860) && (?date < 1870)).
 	Filter (!sameTerm(?voie, ?voieo))
  }}
```

# CQ5: Quels ateliers de photographes ont été repris par un autre photographe que son propriétaire initial?

```
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
select distinct ?label ?fadd ?labelo ?faddo where { 
	?e a ont:Entry.
	?e rdfs:label ?label.
        ?e locn:address ?add.
        ?add locn:fullAddress ?fadd.
	?e owl:sameAs ?o.
	?o rdfs:label ?labelo.
	?o locn:address ?addo.
        ?addo locn:fullAddress ?faddo.
 	Filter (!sameTerm(?label, ?labelo) && sameTerm(?fadd, ?faddo) )
}
```
