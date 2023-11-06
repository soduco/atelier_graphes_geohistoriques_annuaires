# Vétérinaires

## Etat de l'art
### Articles
* Hubscher Ronald. <i>L'invention d'une profession : les vétérinaires au XIXe siècle.</i> In: Revue d’histoire moderne et contemporaine, tome 43 N°4, Octobre-décembre 1996. Médicalisation et professions de santé XVIe-XXe siècles. pp. 686-708. DOI : https://doi.org/10.3406/rhmc.1996.1846. URL : www.persee.fr/doc/rhmc_0048-8003_1996_num_43_4_1846
* Berdah, Delphine. « Entre scientifisation et travail de frontières : les transformations des savoirs vétérinaires en France, XVIIIe-XIXe siècles », Revue d’histoire moderne & contemporaine, vol. 59-4, no. 4, 2012, pp. 51-96. DOI : https://doi-org.univ-eiffel.idm.oclc.org/10.3917/rhmc.594.0051
* Lamure Jean-Christophe, Quand Napoléon Ier s'intéressait aux vétérinaires, Février 2011. 250ème anniversaire de la création des Ecoles Vétérinaires. URL : https://www.veterinaire.fr/system/files/files/2021-12/295_Napoleon_et_les_Veterinaires_-_Dr_J.C._Lamure.pdf

### Données complémentaires
* Liste des étudiants diplômes de l'ENV de Maisons-ALfort (1766-1940). URL : https://www.vet-alfort.fr/annuaire?cm=0&dir=asc&order=i.name&search=bourdon#tlb
* Registres détaillés des élèves inscrits de l'ENV de Maisons-ALfort (1766-1940). Archives Départementales du Val-de-Marne. URL : https://archives.valdemarne.fr/recherches/archives-en-ligne/ecole-veterinaire-de-maisons-alfort-enva?arko_default_63033cc7c654f--ficheFocus=

## Choix des mots-clés
Avant la création des écoles vétérinaires, plusieurs professions pratiquent des soins aux animaux : 
- forgerons
- hongreurs
- barbiers
- accoucheurs
- guérisseurs
- maréchal, maréchal ferrant, maréchal-expert (concurrence importance/proximité initiale forte)
- écuyer, écuyer-hippiatre
<i>Mots clés non-conservés pour le filtrage car trop divers (à l'exception des maréchaux-experts, plus spécialisés dans les soins des chevaux)</i>.

Plusieurs dénominations sucessives/parallèles associées à l'évolution de la profession et aux différents types de formations suivies:
- privilégié à l'art vétérinaire
- artiste-vétérinaire
- maréchal-vétérinaire
- médecin-vétérinaire
- vétérinaire

## Filtrage des entrées

```sql
SELECT ...
WHERE (
    (-- Contient
    act ILIKE '%vétérinaire%' OR
    act ILIKE '%veterinaire%' OR
    act ILIKE '%vetérinaire%' OR
    act ILIKE '%véterinaire%' OR
    act ILIKE '%veteri%' OR
    act ILIKE '%vetéri%' OR
    act ILIKE '%véteri%' OR
    act ILIKE '%vétéri%' OR
    (act ILIKE '%marech%' AND act ILIKE '%expert%') OR
    (act ILIKE '%maréch%' AND act ILIKE '%expert%')
    ) AND 
    -- Ne contient pas
    (act NOT ILIKE '%paveteri%')
)
```

## Liage

### Paramétrage Silk single-machine
#### Transformations sur les chaînes de caractères : 
    - lowerCase : minuscules
    - alphaReduce : supprime les caractères spéciaux
    - normalizeChars : remplace les caractères accentués par des caractères non accentués

#### Critères de comparaison
<table>
  <tr>
    <th>Clé</th>
    <th>Propriété 1</th>
    <th>Distance</th>
    <th>Propriété 2</th>
    <th>Distance</th>
    <th>Seuil de confiance global</th>
  </tr>
  <tr>
    <td><b>Label / Activity<b></td>
    <td>Label</td>
    <td>levenshtein(0.2)</td>
    <td>Activity</td>
    <td>tokenwiseDistance(0.4)</td>
    <td>10%</td>
  </tr>
  <tr>
    <td><b>Label / Address<b></td>
    <td>Label</td>
    <td>levenshtein(0.2)</td>
    <td>Address</td>
    <td>streetname: levenshtein(0.3)<br>card: levenshtein(0.0)</td>
    <td>0%</td>
  </tr>
  <tr>
    <td><b>Address / Activity</b></td>
    <td>Address</td>
    <td>streetname: levenshtein(0.3)<br>card: levenshtein(0.0)</td>
    <td>Activity</td>
    <td>tokenwiseDistance(0.3)</td>
    <td>0%</td>
  </tr>
</table>

#### Aggrégation
Pour chaque paire de propriété, le score conservé pour filtrer les liens est le plus faible score de similirité obtenu.

### Résultats avec Silk
- NumEntry : 
    - Temps de calcul : quelques secondes
    - Nombre de liens : **31 244 liens**
- Label / Activity : 
    - Temps de calcul : ~6 minutes
    - Nombre de liens : **178 332 liens** (4 458 794)
- Label / Address
    - Temps de calcul : ~1 minute
    - Nombre de liens : **37 667 liens** (682 976 filtrés)
- Address / Activity
    - Temps de calcul : ~1 minute
    - Nombre de liens : **31 695 liens** (1 312 650 filtrés)

Nombre total de liens associant des ressources différentes (sans inférence) : **155 905**

## Questions
### Quelle est la liste des vétérinaires également professeurs ?

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rda: <http://rdaregistry.info/Elements/a/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX locn: <http://www.w3.org/ns/locn#>

SELECT DISTINCT ?e ?label ?act ?fullAdd
WHERE { 
    ?e a adb:Entry.
    ?e rdfs:label ?label.
    ?e rda:P50104 ?act.
    ?e prov:wasDerivedFrom ?directory.
    FILTER(regex(lcase(?act), 'école|ecole|alfort|prof')).#Contient un des mots de cette liste.
}
```
Dans l'application : écrire <span style="color:blue">école|ecole|alfort|prof</span> dans le champs *Activité*

### Quelle est liste des vétérinaires exerçant également la profession de maréchal ferrant ?

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX adb: <http://rdf.geohistoricaldata.org/def/directory#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rda: <http://rdaregistry.info/Elements/a/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pav: <http://purl.org/pav/>
PREFIX locn: <http://www.w3.org/ns/locn#>

SELECT DISTINCT ?e ?label ?act ?fullAdd
WHERE { 
    ?e a adb:Entry.
    ?e rdfs:label ?label.
    ?e rda:P50104 ?act.
    ?e prov:wasDerivedFrom ?directory.
    FILTER(regex(lcase(?act), '((?=.*vet)|(?=.*vét))(?=.* et )(?=.*mar)'))..
}
```
Dans l'application : écrire <span style="color:blue">((?=.*vet)|(?=.*vét))(?=.* et )(?=.*mar)</span> dans le champs *Activité*