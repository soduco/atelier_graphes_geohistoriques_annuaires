# Atelier de création de graphes de connaissances géohistoriques

## Baseline : travaux présentés à la conférence IC (Juillet 2023)

- [Article](https://hal.science/hal-04121643/)
- [Présentation](https://docs.google.com/presentation/d/1rwIu4ilWswUI7ltXQRd4-AUwcRffb8CQJ54chePoRQc/edit?usp=sharing)
- [Dépôt de code de la chaîne de traitement proposée à IC 2023](https://github.com/soduco/ic_2023_photographes_parisiens)
- [Interface de visualisation (ancienne version, juillet 2023)](https://soduco.github.io/ic_2023_photographes_parisiens/)

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

NB: Sauf mention contraire, les membres du projet SODUCO sont les auteurs des scripts utilisés dans ce tutorial. Vous pouvez le réutiliser librement pour produire vos propres graphes de connaissances géohistoriques professionnels (Licence Creative Common BY 4.0). Pour citer ce travail, merci d'utiliser la référence suivante:

Solenn Tual, Nathalie Abadie, Bertrand Duménieu, Joseph Chazalon and Edwin Carlinet. Création d’un graphe de connaissances géohistorique à partir d’annuaires du commerce parisien du 19ème siècle: application aux métiers de la photographie. *IC 2023, 34èmes journées francophones d’Ingénierie des connaissances*, Strasbourg, France, 3-7 July 2023. [hal-04121643](https://hal.science/hal-04121643/)

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
2)  Sélectionner (connecter) le dépôt que vous venez de créer pour pouvoir travailler dessus.
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
   * Valider le formulaire pour créer le dépôt.
6)  Sélectionner (connecter) le dépôt que vous venez de créer pour pouvoir travailler dessus.
7) Charger les données que vous venez d'exporter (Importer / Télécharger des fichiers RDF). Une fois votre fichier en liste d'attente, le sélectionner et cliquer sur "Importer". Compléter le formulaire avec les valeurs suivantes:  
   * Base IRI : http://rdf.geohistoricaldata.org/id/directories/entry/
   * Cocher l'option "Graphe nommé"
   * Graphes cibles: http://rdf.geohistoricaldata.org/id/directories/cartes_et_plans

### 3. Lier les entrées d'annuaires qui représentent un même commerce de gravure ou de vente de cartes et plans

Le liage des entrées d'annuaires représentant un même commerce est fait avec le logiciel libre Silk-single-machine (http://silkframework.org/). Il permet d'évaluer le degré de similarité entre ressources en comparant leurs valeurs de propriétés avec des fonctions de similarité adaptées (mesures de similarité de chaînes de caractères, comparaison de valeurs numériques, etc.) et en agrégeant les résultats obtenus pour chaque paire de propriétés afin de produire un score de similarité global. Le choix des propriétés à comparer et des fonctions de transformation, de similarité et d'agrégation à utiliser, ainsi que leur paramétrage sont définis dans un fichier XML (dit *LinkSpec*). Il permet de lancer Silk en ligne de commande.

1) Copier l'adresse du point d'accès SPARQL de votre dépôt GraphDB local : aller dans "Configurer / Dépôts" et cliquer sur l'icône dédiée (voir ci-dessous)
   ![URI SPARQL endpoint GraphDB](./doc/img/URL_Depot.png "URI SPARQL endpoint GraphDB")
   ![Copier URI SPARQL endpoint GraphDB](./doc/img/URL_Depot_copy.png "Copier URI SPARQL endpoint GraphDB")
2) Adapter les fichiers de configuration de Silk en collant l'adresse du dépôt GraphDB de vos données et en modifiant si besoin l'URI du graphe nommé: paramètres endpointURI et graph. :warning: si vous êtes sous Mac, vous devez également spécifier le chemin de sortie du fichier (voir documentation pour [Mac](https://github.com/soduco/atelier_graphes_geohistoriques_annuaires/blob/main/doc/silk_MacOS_java_home_workbench.md)).
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
3) Placer les 4 fichiers de *LinkSpec* fournis dans *scripts_silk* dans le dossier silk-single-machine sur votre machine, avec silk.jar, ouvrir une invite de commandes dans ce dossier et lancer le liage en exécutant successivement les 4 commandes suivantes:
   
```cmd
java -DconfigFile=liage_annuaires_address_activity.xml -jar silk.jar
java -DconfigFile=liage_annuaires_index_extraction.xml -jar silk.jar
java -DconfigFile=liage_annuaires_label_activity.xml -jar silk.jar
java -DconfigFile=liage_annuaires_label_address.xml -jar silk.jar
```
:warning: Selon la quantité de données et le paramétrage choisi dans la *LinkSpec*, ces opérations peuvent prendre plus ou moins de temps, allant de quelques secondes à plusieurs heures.

4) Récupérer les fichiers de liens produits sur C:\Users\votre_nom\\.silk\output (sous Windows)
   
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

 ![Liens calculés et liens inferrés](./doc/img/Visu_nb_liens.png "Cliquer sur l'icône entourée en vert pour activer ou désactiver les inférences: le nombre de liens total s'affiche dans la partie entourée en bleu.")

 3) Quand le nombre total de liens est légèrement supérieur au nombre de liens calculés par Silk (par exemple 20 000 liens au total pour 15 000 liens calculés), vous pouvez télécharger le résultats de la requête de l'étape 2 en CSV. Sinon, désactiver le raisonnement avant d'exécuter la requête pour récupérer seulement les liens calculés. 

### 5. Importer les liens dans la base, créer et requêter le graphe final

#### Import des liens dans la base locale

1) Ouvrir le fichier CSV qui contient les liens et supprimer la première et la dernière ligne.
2) Mettre à jour et exécuter la requête SQL ci-dessous:

```sql
-- DROP TABLE IF EXISTS directories_graph.liens_chargement;
CREATE TABLE IF NOT EXISTS directories_graph.liens_chargement
(
    entry_id1 uuid,
    entry_id2 uuid,
	 graph_name character varying);

/* **************************************************************** */
/* Modifier ici le nom du fichier des liens et celui du graph nommé */
/* **************************************************************** */
COPY directories_graph.liens_chargement FROM 'C:\silk\liens_graveurs.csv' (DELIMITER ',');
INSERT INTO directories_graph.liens(entry_id1,entry_id2) SELECT entry_id1,entry_id2 FROM directories_graph.liens_chargement AS t WHERE t.graph_name like 'cartes_et_plans';
DELETE FROM directories_graph.liens_chargement AS t WHERE t.graph_name like 'cartes_et_plans';
```

#### Import des liens dans la base soduco distante

1) Si elle n'existe pas déjà, ajouter une table intermédiaire pour le chargement des liens:
   
```sql
-- DROP TABLE IF EXISTS directories_graph.liens_chargement;
CREATE TABLE IF NOT EXISTS directories_graph.liens_chargement
(
    entry_id1 uuid,
    entry_id2 uuid,
	 graph_name character varying);
```

2) Aller dans le dossier bin de PostgreSQL et lancer une invite de commandes. Entrer et exécuter la commande suivante:
   
```cmd
psql -h geohistoricaldata.org -d soduco -U user
```
3) Entrer le mot de passe de votre compte utilisateur
4) Adapter, entrer et exécuter la commande suivante:
```cmd
\copy directories_graph.liens_chargement from 'C:/.../liens_graveurs_cartes.csv' with CSV ENCODING 'UTF8'
```

5) Transférer les liens vers la table de liens:
   
```sql
INSERT INTO directories_graph.liens(entry_id1,entry_id2) SELECT entry_id1,entry_id2 FROM directories_graph.liens_chargement AS t WHERE t.graph_name like 'cartes_et_plans';
DELETE FROM directories_graph.liens_chargement AS t WHERE t.graph_name like 'cartes_et_plans';
```

#### Création du graphe final

1) Sous GraphDB, créer un nouveau dépôt "SPARQL virtuel Ontop" en utilisant le fichier de mapping *directory.ttl*. (Si vous voulez activer aussi le raisonnement, l'ontologie directory.rdf est disponible dans le même dépôt).
2) Dans l'onglet SPARQL, vous pouvez explorer le graphe géohistorique. Pour vous aider à démarrer, vous trouverez des requêtes types ici: *./atelier_graphes_geohistoriques_annuaires
/requetes_sparql/explorer_un_graphe.md*

### 6. Visualiser le graphe final
 
#### Visualisation des données de la base locale

* Si ce n'est pas encore fait : 
* Télécharger le dossier *appli* de ce dépôt Git-Hub
* Copier l'adresse du point d'accès du dépôt "SPARQL virtuel Ontop" que vous avez créés à l'étape précédente. 
![URI SPARQL endpoint GraphDB](./doc/img/URL_Depot.png "URI SPARQL endpoint GraphDB")
![Copier URI SPARQL endpoint GraphDB](./doc/img/URL_Depot_copy.png "Copier URI SPARQL endpoint GraphDB")
* Ouvrir le fichier *parameters.js*  : 
   * Commenter l'adresse du endpoint en ligne du projet SODUCO (avec //)
   * Coller l'adresse du point d'accès "SPARQL virtuel Ontop" que vous venez de créer en local comme valeur de la variable **endpointURL**.
![URI SPARQL endpoint dans l'appli](./doc/img/Adresse_sparql_endpoint_appli_local.PNG "URI SPARQL endpoint dans l'appli")
* Dans la fenêtre GraphDB Desktop, cliquer sur "Settings" et ajouter les deux paramètres suivants:
	* -Dgraphdb.workbench.cors.enable = true
	* -Dgraphdb.workbench.cors.origin = *
* Cliquer sur "Save and Restart"
* Cliquer sur le fichier *index.html* : vous arrivez sur la page d'accueil de l'application. Elle vous permet de consulter :
   - les ressources géocodés de votre jeu de données ;
   - les sous-ensembles d'entrées liées sous la forme d'une frise chronologique (PS: pour voir les fonds de cartes, vous devez être connectés à Internet).


#### Visualisation des données de la base soduco distante

* Le graphe géohistorique publié sur la base soduco est directement requêtable sur le point d'accès SPARQL suivant (des requêtes types sont disponibles ici: *./requetes_sparql*) : https://dir.geohistoricaldata.org/

* Il est aussi visualisable via l'interface cartographique suivante: https://soduco.geohistoricaldata.org/atelier_graphes_geohistoriques_annuaires/