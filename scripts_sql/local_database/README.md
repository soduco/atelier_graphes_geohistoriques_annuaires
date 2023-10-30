# Extraction des entrées d'annuaires relatives à un type d'activité, vers une base PostgreSQL locale

1) Lancez pgAdmin 4 et ouvrez un serveur local.

2) Créez une base PostgreSQL vide (clic droit / create database). Ouvrez votre base, et l'éditeur de requêtes (Tools / Query tool). Tapez la commande suivante dans l'éditeur de requêtes et exécutez-la en cliquant sur le bouton entouré en vert:

![Create extension postgis](Execute.png "Create extension postgis")

Cette extension permet à votre base de données de stocker des données géographiques, dotées de géométries sur lesquelles on peut faire des analyses spatiales quantitatives.

3) Ajoutez les schémas utiles et connectez-vous à la base *soduco* distante pour y lire et sélectionner les données. Pour cela, ouvrez le fichier *Create_local_schema_and_connect_to_server.sql* dans votre éditeur de requêtes et exécutez-le sans rien modifier.
4) Testez les mots-clés qui vous semblent pertinents pour récupérer les entrées relatives à un type d'activité donné et affinez-les avant de procéder à l'export des données proprement dit. Pour cela, ouvrez le fichier *Test_keywords.sql* dans l'éditeur de requêtes, modifiez les mots-clés selon les entrées que vous recherchez et excéutez le. Affinez vos mots-clés par essais/erreurs pour obtenir les données souhaitées.
5) Créez votre base locale et importez-y les données correspondant aux mots-clés que vous avez préalablement identifiés comme valides. Pour cela, ouvrez le fichier *Create_local_tables.sql* dans l'éditeur de requêtes, modifiez les parties indiquées sous les commentaires encadrés par des étoiles, et exécutez le.

6) De façon optionnelle, si vous souhaitez travailler sur plusieurs jeux de données relatifs à différents types d'activités:
* testez de nouveaux mots clés comme à l'étape 4;
* insérez les données correspondantes dans votre base de données locale à l'aide du fichier *Insert_into_local_tables.sql*: ouvrez-le dans l'éditeur de requêtes, modifiez les parties indiquées sous les commentaires encadrés par des étoiles, et exécutez le.
