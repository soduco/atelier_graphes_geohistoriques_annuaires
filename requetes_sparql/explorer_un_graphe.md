# Quelques requêtes type pour explorer un graphe (ici le graphe des magasins de nouveautés)

## On cherche la ou les adresses de la société anonyme du GagnePetit en 1894

```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
select distinct ?e ?label ?fullAdd
where { 
    graph <http://rdf.geohistoricaldata.org/id/directories/nouveautes_test>
    {
     ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1894. 
    ?e locn:address ?add.
    ?add locn:fullAddress ?fullAdd.
    ?add prov:wasGeneratedBy <http://rdf.geohistoricaldata.org/id/directories/activity/0001>.
     Filter regex(?label, 'GagnePetit')
}}
```

## On cherche combien de magasins de nouveautés sont localisés boulevard Poissonnière en 1842

```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
select (count(?e) as ?nombre)
where { 
 graph <http://rdf.geohistoricaldata.org/id/directories/nouveautes_test>
    {
    ?e a ont:Entry.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn 1842. 
    ?e locn:address ?add.
    ?add locn:thoroughfare ?voie.
    Filter regex(?voie, "Poissonnière").
}}
```
## On cherche les magasins de nouveautés situés dans le quartier Richelieu entre 1835 et 1845

```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX gsp: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
select distinct ?label ?directory ?fullAdd
where { 
     graph <http://rdf.geohistoricaldata.org/id/directories/nouveautes_test>
    {
    ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn ?date. 
    ?e locn:address ?add.
    ?add locn:fullAddress ?fullAdd.
    ?add gsp:hasGeometry ?geom.
    ?geom gsp:asWKT ?wkt.
    FILTER(?date>1835 && ?date<1845).
    FILTER (geof:sfIntersects(?wkt, "<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Polygon((2.3351 48.8640, 2.3325 48.8700, 2.3328 48.8702, 2.3328 48.8707, 2.3400 48.8719, 2.3430 48.8715, 2.3409 48.8662, 2.3413 48.8661, 2.3418 48.8658, 2.3415 48.8654, 2.3407 48.8653, 2.3394 48.8629, 2.3351 48.8640))"^^gsp:wktLiteral))
    }} ORDER BY ?label ?directory
```

## On cherche quels magasins de nouveautés ont changé de rue entre 1850 et 1860

```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
select distinct ?label ?voie ?voieo 
where { 
     graph <http://rdf.geohistoricaldata.org/id/directories/nouveautes_test>
{
    ?e a ont:Entry.
    ?e rdfs:label ?label.
    ?e prov:wasDerivedFrom ?directory.
    ?directory pav:createdOn ?date. 
    ?e locn:address ?add.
    ?add locn:thoroughfare ?voie.
    ?e owl:sameAs ?o.
    ?o rdfs:label ?labelo.
    ?o prov:wasDerivedFrom ?directoryo.
    ?directoryo pav:createdOn ?dateo. 
    ?o locn:address ?addo.
    ?addo locn:thoroughfare ?voieo.
    Filter ((?date >= 1850) && (?dateo <= 1860) && (?date<?dateo)).
    Filter (!sameTerm(?voie, ?voieo))
    }}
```

## On cherche quels magasins de nouveauté ont changé de nom (et donc potentiellement de propriétaire)

```sparql
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX ont: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
select distinct ?e ?label ?labelo ?o
where { 
     graph <http://rdf.geohistoricaldata.org/id/directories/nouveautes_test>
{
	?e a ont:Entry.
	?e rdfs:label ?label.
    	?e locn:address ?add.
	?add locn:fullAddress ?fadd.
	?e owl:sameAs ?o.
	?o rdfs:label ?labelo.
	?o locn:address ?addo.
    	?addo locn:fullAddress ?faddo.
 	Filter (!sameTerm(?label, ?labelo) && sameTerm(?fadd, ?faddo) )
    }} order by ?label
```
