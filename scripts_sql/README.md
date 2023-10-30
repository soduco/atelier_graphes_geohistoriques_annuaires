# Scripts SQL

Ce dossier regroupe les scripts SQL utiles pour extraire les données de la base des annuaires du commerce parisien du XIXème siècle produite par le projet SODUCO. La sélection des données à extraire se fait par mots-clés sur les activités associées aux entrées et les données sont exportées, soit sur le serveur distant soduco, soit sur un serveur PostgreSQL local.

Si vous n'avez pas de compte utilisateur pour accéder au serveur SODUCO, utilisez les scripts du dossier *local_database* pour extraire les données qui vous intéressent et les importer dans une base de données locale, sur votre machine.

Les scripts sont prêts à être exécutés. Ouvrez les à l'aide de l'éditeur de requêtes de pgAdmin4 et modifiez seulement les parties indiquées sous les commentaires encadrés par des étoiles comme dans l'exemple ci-dessous. Ici il faut modifier les mots-clés '%photo%', '%daguer%' ou '%opti%' pour les remplacer par les activités que l'on cherche à retrouver dans les annuaires.

```sql
SELECT ...
WHERE (
/* ************************************************************* */
/* Modifier la liste des mots-clés selon les données à extraire  */
/* ************************************************************* */
		act.act ILIKE '%photo%' OR
		act.act ILIKE '%daguer%' OR
		act.act ILIKE '%opti%'
		)
```

