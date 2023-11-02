# Atelier de création de graphes de connaissances géohistoriques

## Baseline : travaux présentés à la conférence IC (Juillet 2023)

- [Article](https://hal.science/hal-04121643/)
- [Présentation](https://docs.google.com/presentation/d/1rwIu4ilWswUI7ltXQRd4-AUwcRffb8CQJ54chePoRQc/edit?usp=sharing)
- [Dépôt de code de la chaîne de traitement proposée à IC 2023](https://github.com/soduco/ic_2023_photographes_parisiens/tree/main/doc)
- [Interface de visualisation (ancienne version)](https://soduco.github.io/ic_2023_photographes_parisiens/)

## Outils et logiciels requis

### Installation (avant l'atelier)

➡️ [Notice d'installation des logiciels requis](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/Installations_Atelier_SODUCO.pdf) : 
- JDK 8
- Postgres SQL 16 avec PostGIS et pgAdmin
- GraphDB
- Silk single machine
- Silk Workbench

### Aides pour l'utilisation des logiciels (pendant l'atelier)

- [PgAdmin v7](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/pgadmin4.md) : connexion à la base de donnée soduco (réseau IGN / réseau invité)
- [Graph DB](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/Tutoriel_GraphDB.pdf) : utiliser le triplestore
- [Silk Single Machine](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/silk_single_machine.md) : utiliser le fichier .jar
- [Application de visualisation](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/Aide_utilisateur_appli_annuaires_SODUCO.pdf) : consulter les données

## Méthodologie de création de graphes de connaissances géohistoriques à partir des annuaires du commerce parisien du XIXème siècle

L'objectif de ce tutoriel est de créer des graphes de connaissances géohistoriques à partir des entrées d'annuaires du commerce du XIXème siècle extraites par le projet ANR SODUCO.

Nous allons travailler sur les entrées représentant les graveurs et les marchands de cartes et plans. Vous pouvez librement adapter la méthodologie présentée ici à d'autres types d'activités figurant dans les annuaires: ébénistes, architectes, photographes, dentelières, etc. 

### 1. Extraire les entrées d'annuaires sur les graveurs et les marchands de cartes et plans

Cette étape peut être réalisée en suivant les procédures présentées dans le dossier *scripts_sql*. 

:warning: Si vous n'avez pas de compte utilisateur pour la base de données soduco, suivez la procédure présentée dans *scripts_sql / local_database*.

### 2. Convertir les données en RDF

1) Lancer GraphDB et créer un nouveau dépôt (Configurer / Dépôts / Créer un nouveau dépôt) en choisissant de créer un dépôt "SPARQL virtuel Ontop". Ce type de dépôt permet de créer un graphe de données RDF "virtuel" en allant lire les données dans une base de données relationnelles et en les convertissant à la volée en RDF en suivant des règles de conversion décrites dans un fichier de mapping. Complétez le formulaire de création avec les informations suivantes (on suppose que l'on travaille sur une base PostgreSQL locale, installée avec les paramètres par défaut):
   * ID du dépôt: cartes_et_plans
   * Pilote de bases de données: PostgreSQL
   * Nom de l'hôte: localhost
   * Port: 5432
   * Nom de la base de données: le nom de votre base PostgreSQL locale.
   * Nom d'utilisateur: postgres
   * Mot de passe: le mot de passe de votre base de données PostgreSQL locale (postgres?)
   * Fichier OBDA ou R2RML: chargez le fichier *scripts_r2rml / directory_mapping_liage.ttl*
 Cliquez sur Test de connexion pour vous assurer que cela fonctionne. Validez ensuite votre formulaire pour créer le dépôt. Il doit apparaître dans la liste des dépôts existants (Configurer / Dépôts). 
2)  Sélectionner le dépôt que vous venez de créer pour pouvoir travailler dessus.
3)  Aller dans SPARQL pour tester le bon accès aux données en exécutant la requête suivante:
    ```sparql
    SELECT * WHERE { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans>
    { ?s ?p ?o .}
     } limit 100 
    ```
4)  Exporter les données pour créer un dépôt local qui servira à regrouper les liens et en inférer de nouveaux. Pour cela, exécuter la requête suivante et demander à télécharger les résultats en Turtle.
    ```sparql
    CONSTRUCT {?s ?p ?o} 
    WHERE { 
    GRAPH <http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans>
    { ?s ?p ?o .}
    } 
    ```
5)  Créer un nouveau dépôt en choisissant de créer un dépôt "GraphDB". Compléter le formulaire avec les informations suivantes:
   * ID du dépôt : cartes_et_plans_local
   * Décocher l'option "Disable owl:sameAs"
Valider le formulaire pour créer le dépôt.
6)  Sélectionner le dépôt que vous venez de créer pour pouvoir travailler dessus.
7) Charger les données que vous venez d'exporter (Importer / Télécharger des fichiers RDF). Une fois votre fichier en liste d'attente, le sélectionner et cliquer sur "Importer". Compléter le formulaire avec les valeurs suivantes:  
   * Base IRI : http://rdf.geohistoricaldata.org/id/directories/entry/
   * Cocher l'option "Graphe nommé"
   * Graphes cibles: http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans

### 3. Lier les entrées d'annuaires qui représentent un même commerce de gravure ou de vente de cartes et plans

Le liage des entrées d'annuaires représentant un même commerce est fait avec le logiciel libre Silk-single-machine. Il permet d'évaluer le degré de similarité entre ressources en comparant leurs valeurs de propriétés avec des fonctions de similarité adaptées (mesures de similarité de chaînes de caractères, comparaison de valeurs numériques, etc.) et en agrégeant les résultats obtenus pour chaque paire de propriétés afin de produire un score de similarité global. Le choix des propriétés à comparer et des fonctions de transformation, de similarité et d'agrégation à utiliser, ainsi que leur paramétrage sont définis dans un fichier XML (dit *LinkSpec*). Il permet de lancer Silk en ligne de commande.

1) Copier l'adresse du point d'accès SPARQL de votre dépôt GraphDB local : aller dans "Configurer / Dépôts" et cliquer sur l'icône dédiée (voir ci-dessous)
   ![URI SPARQL endpoint GraphDB](./img/URL_Depot.png "URI SPARQL endpoint GraphDB")
2) Adapter les fichiers de configuration de Silk en collant l'adresse du dépôt GraphDB de vos données et en modifiant si besoin l'URI du graphe nommé: paramètres endpointURI et graph.
```xml
  <Silk>
<!--Prefixes-->
    <Prefixes>
      <Prefix id="rdf" namespace="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/>
	  <Prefix id="owl" namespace="http://www.w3.org/2002/07/owl#"/>
	  <Prefix id="adb" namespace="http://rdf.geohistoricaldata.org/def/directory#"/>
	  <Prefix id="rdfs" namespace="http://www.w3.org/2000/01/rdf-schema#"/>
	  <Prefix id="locn" namespace="http://www.w3.org/ns/locn#"/>
	  <Prefix id="xsd" namespace="http://www.w3.org/2001/XMLSchema#"/>
	  <Prefix id="dcterms" namespace="http://purl.org/dc/terms/"/>
	  <Prefix id="rda" namespace="http://rdaregistry.info/Elements/a/"/>
    </Prefixes>
	<!--Datasets-->
<DataSources>
	  <DataSource id="graveurs1" type="sparqlEndpoint"><!--Nom du premier dataset à apparier-->
		  <Param name="pageSize" value="1000"></Param>
		  <Param name="pauseTime" value="0"></Param>
		  <Param name="retryCount" value="3"></Param>
		  <Param name="endpointURI" value="http://DESKTOP-PFPG9LI:7200/repositories/graveurs_local"></Param><!--Mettre l'adresse du répertoire GraphDB où se trouvent les données des annuaires-->
		  <Param name="graph" value="http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans"></Param><!--Mettre l'URI du graphe nommé où se trouvent les données sur lesquelles on travaille-->
		  <Param name="retryPause" value="1000"></Param>
		  <Param name="queryParameters" value=""/>
		  <Param name="login" value=""/>
		  <Param name="entityList" value=""/>
		  <Param name="parallel" value="true"/>
		  <Param name="password" value=""/>
	  </DataSource>
	  <DataSource id="graveurs2" type="sparqlEndpoint"><!--Nom du second dataset à apparier-->
		  <Param name="pageSize" value="1000"></Param>
		  <Param name="pauseTime" value="0"></Param>
		  <Param name="retryCount" value="3"></Param>
		  <Param name="endpointURI" value="http://DESKTOP-PFPG9LI:7200/repositories/graveurs_local"></Param><!--Mettre l'adresse du répertoire GraphDB où se trouvent les données des annuaires-->
		  <Param name="graph" value="http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans"></Param><!--Mettre l'URI du graphe nommé où se trouvent les données sur lesquelles on travaille-->
		  <Param name="retryPause" value="1000"></Param>
		  <Param name="queryParameters" value=""/>
		  <Param name="login" value=""/>
		  <Param name="entityList" value=""/>
		  <Param name="parallel" value="true"/>
		  <Param name="password" value=""/>
	  </DataSource>
	</DataSources>
<!--Links-->
<Interlinks>
	<Interlink id="by-keys">
....
 </Silk>
```
3) Placer les 4 fichiers de *LinkSpec* fournis dans *scripts_silk* dans le dossier silk sur votre machine, avec silk.jar, ouvrir une invite de commandes dans ce dossier et lancer le liage en exécutant successivement les 4 commandes suivantes:
   
```cmd
java -DconfigFile=liage_annuaires_address_activity.xml -jar silk.jar
java -DconfigFile=liage_annuaires_index_extraction.xml -jar silk.jar
java -DconfigFile=liage_annuaires_label_activity.xml -jar silk.jar
java -DconfigFile=liage_annuaires_label_address.xml -jar silk.jar
```
:warning: Selon la quantité de données et le paramétrage choisi dans la *LinkSpec*, ces opérations peuvent prendre plus ou moins de temps, allant de quelques secondes à plusieurs heures.

4) Récupérer les fichiers de liens produits sur C:\Users\votre_nom\.silk\output (sous Windows)
   
### 4. Inférer plus de liens et exporter les liens obtenus

1) Charger les fichiers de liens obtenus dans votre dépôt GraphDB cartes_et_plans_local en suivant la même procédure qu'à l'étape 2.7. Il faut seulement changer le nom du graphe nommé dans lequel vous mettez les données:
   * Base IRI : http://rdf.geohistoricaldata.org/id/directories/entry/
   * Cocher l'option "Graphe nommé"
   * Graphes cibles: http://rdf.geohistoricaldata.org/id/directories/links
2) Aller dans SPARQL et exécuter la requête suivante pour récupérer la liste complète des liens créés (penser à changer le nom du graphe nommé pour y mettre le vôtre si vous travaillez sur un autre jeu de données):
```sparql
   PREFIX owl: <http://www.w3.org/2002/07/owl#> 
   select distinct ?entry_id1 ?entry_id2 ?named_graph
   where {?s owl:sameAs ?p.
	FILTER (?s != ?p).
    BIND(STRAFTER(STR(?s), 'http://rdf.geohistoricaldata.org/id/directories/entry/') AS ?entry_id1).
    BIND(STRAFTER(STR(?p), 'http://rdf.geohistoricaldata.org/id/directories/entry/') AS ?entry_id2).
    BIND('cartes_et_plans' AS ?named_graph).}
 ```

:warning: A cette étape, vérifier la quantité de liens inférés par le système de raisonnement de GraphDB! En effet, GraphDB est équipé d'un moteur d'inférences qui déduit de nouveaux faits à partir des faits (c-à-d des triplets de données) et des connaissances (c-à-d des ontologies) que l'on lui fournit. Ici on lui a fourni des triplets avec des liens owl:sameAs et on a précisé en créant le dépôt qu'il pouvait utiliser la propriété de transitivité de ces liens pour en inférer de nouveaux (en décochant l'option "Disable owl:sameAs"). Donc si dans nos données et nos liens, nous avons fourni au système A owl:sameAs B et B owl:sameAs C, il en déduit A owl:sameAs C. C'est très pratique pour compléter des liens que l'on peut avoir manqués avec Silk à causes de problèmes d'OCR par exemple. En revanche, cela peut aussi propager des liens erronés en cas d'erreurs dans les liens créés! Les liens erronés calculés par Silk à cause des erreurs d'OCR qui génèrent des chaînes de caractères très courtes et très fréquentes (ex. "R. " au lieu de "R. du Bac" ou "R. de la Paix") peuvent alors conduire à une explosion du nombre de liens erronés inférés... 

 ![Liens calculés et liens inferrés](./doc/Visu_nb_liens.png "Cliquer sur l'icône entourée en vert pour activer ou désactiver les inférences: le nombre de liens total s'affiche dans la partie entourée en bleu.")

 3) Quand le nombre total de liens est légèrement supérieur au nombre de liens calculés par Silk (par exemple 20 000 liens au total pour 15 000 liens calculés), vous pouvez télécharger le résultats de la requête de l'étape 2 en CSV. Sinon, désactiver le raisonnement avant d'exécuter la requête pour récupérer seulement les liens calculés. 

### 5. Importer les liens dans la base, créer et requêter le graphe final
### 6. Visualiser le graphe final
 
