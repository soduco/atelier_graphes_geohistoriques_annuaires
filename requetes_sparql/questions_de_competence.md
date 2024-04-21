# CQ1: Quelle est l’adresse du photographe Dubois en 1861 ?

Réponse attendue: 25 boulevard de Sébastopol
```
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
select * where { 
    ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1861. 
    ?e locn:address ?add.
    ?add locn:fullAddress ?fullAdd.
    Filter regex(?label, "Dubois").
}
```
# CQ2: Combien y a-t-il de "photographes" localisés rue de Rivoli en 1882 ? 
Réponse attendue: 11
```
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
select (count(?e) as ?nombre) where { 
    ?e a ont:Entry.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1882. 
    ?e locn:address ?add.
    ?add locn:thoroughfare ?voie.
    Filter regex(?voie, "Rivoli").
}
```
# CQ3: Quels sont les photographes situés dans le rectangle englobant (Xmax=2.3385 Ymax= 48.8663 Xmin = 2.3360 Ymin= 48.8625) en 1875 ? 

Réponse attendue: derepas, reignier (e.), barrès, bureau (s.), vantier, coutellier, gatel
```
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX gsp: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
select ?label where { 
    ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1875. 
    ?e locn:address ?add.
    ?add gsp:hasGeometry ?geom.
    ?geom gsp:asWKT ?wkt.
    FILTER (geof:sfIntersects(?wkt, "<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Polygon((2.3360 48.8625,2.3360 48.8663,2.3385 48.8663,2.3385 48.8625,2.3360 48.8625))"^^gsp:wktLiteral))
}

```

# CQ4: Quels photographes ont déménagé entre 1860 et 1870?

```
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
select distinct ?label ?voie ?labelo ?voieo where { 
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
}
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
