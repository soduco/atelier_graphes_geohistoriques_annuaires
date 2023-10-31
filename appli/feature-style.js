/***********************************
 ******** STYLE DES POINTS *********
************************************/

//////////// Sur la couche des extractions soduco ///////////

function pointToLayerExtract(feature,latlng) {
    /* Création d'un marker pour chaque point du geojson */
    return L.marker(latlng, 
      {icon: L.divIcon({ html: '', 
                        className:'clusters', 
                        iconSize: new L.point(12.5,12.5)})
  });
}

//////////// Sur la couche des photographes produite à partir de Durand et al. (2015)

var geojsonMarkerOptionsRef = {
    //Style des markers de la couche de référence
    radius:6,
    fillColor: "#FFC300",
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 1
};

function pointToLayerRef(feature,latlng) {
    /* Création d'un marker pour chaque point du geojson */
    return L.circleMarker(latlng, geojsonMarkerOptionsRef);
}

function iconByName(name) {
    /********** Icones *********/
	return '<i class="icon icon-'+name+'"></i>';
}

/***********************************
 ************* POP-UP **************
************************************/

 function generateButton(valuri) {
  /*Fonction qui insère dans la pop-up d'un point le boutton qui permet à l'utilisateur de créer une frise chronologique avec toutes les ressources du sous-graphe dont elle fait partie
  * Input : URI de la ressource 
  * Output : Button HTML inséré dans la popup du point
  */
  var htmlString = `<button class="button" style="font-size: 12px; margin-right:auto; margin-left:auto;" onclick="createlinkDataSoduco('${valuri.toString()}')">Frise chronologique</button>`;
  return htmlString;
}

 function popUpDirectories(feature, layer) {
  /*Fonction de création de la pop-up associée à un point de la carte
  */
  var valuri = feature.properties.uri.replace('http://rdf.geohistoricaldata.org/id/directories/entry/', '')
  texte = '<h4>'+ feature.properties.person +'</h4>'+
  '<p><b>Adresse (annuaire)</b> : ' + feature.properties.addresses + '<br>'+ 
  '<b>Adresse (géocodeur)</b> : ' + feature.properties.addresses_geocoding + '<br>';
  if (feature.properties.activities){
      texte += '<b>Activité</b> : ' + feature.properties.activities + '<br>';
  };
  texte += '<b>Année de publication</b> : ' + feature.properties.directoryDate + '<br>'+
  '<b>Annuaire</b> : ' + feature.properties.directoryName + '</br>'+
  '<b>Identifiant de l\'entrée </b> : ' + feature.properties.index + '</p>'
  texte += generateButton(valuri)
  layer.bindPopup(texte);
}

function onEachFeature(feature, layer) {
    /*
    * Fonction exécutée à chaque fois que l'utilisateur clique sur un point de la carte (couche soduco ou couche de référence)
    */
    if (feature.properties.uri) {
      // Pop-up content for directories data in extraction layer
        popUpDirectories(feature, layer)
      //Search link data with BNF ressources
      layer.on('click', function(e) {
        //Search external resources
        $('#bnfdata').empty();
        //searchLinkedDataWithBNF(feature.properties.uri)
        //message.innerHTML = '<p class="noentry">Requête en cours d\'exécution : entrées liées à ' + feature.properties.person + ' (ID ' + feature.properties.index + ') <img src="./img/loading_cut.gif">.</p>';  
      });
        
    } else if (feature.properties.secteur) {
        // Contenu de la pop-up d'un point de la couche de référence des photographes
        if (feature.properties.prénoms && feature.properties.nom){
            texte = '<h4>' + feature.properties.prénoms + ' ' + feature.properties.nom + '</h4>'
        } else if (feature.properties.prénoms == null && feature.properties.nom) {
            texte = '<h4>' + feature.properties.nom + '</h4>'
        }
        texte += '<p><b>Adresse</b> : ' + feature.properties.street + ' ' + feature.properties.number + '<br>'
        if (feature.properties.rue_2) {
            texte += '<b>Seconde adresse </b> : ' + feature.properties.rue_2 + '<br>'
        }
        if (feature.properties.date)
            {texte += "<b>Période d'activité</b> : " + feature.properties.date + '<br></p>'}
        if (feature.properties.note) {
            texte += "<p>" + feature.properties.note + "</p>"
        }
        layer.bindPopup(texte);
    };

};

function openPopUp(id, clusterId){
  map.closePopup(); //which will close all popups
  map.eachLayer(function(layer){     //iterate over map layer
      if (layer._leaflet_id == clusterId){         // if layer is markerCluster
          layer.spiderfy(); //spiederfies our cluster
      }
  });
  map.eachLayer(function(layer){     //iterate over map rather than clusters
      if (layer._leaflet_id == id){         // if layer is marker
          layer.openPopup();
      }
  });
}

function sortTable() {
    /*
    * Fonction qui ordonne les lignes du tableau proposé dans la pop-up d'un cluster par date croissante
    * Source : https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table_number
    */

  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("popuptable");
  switching = true;
  /*Make a loop that will continue until no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[0];
      y = rows[i + 1].getElementsByTagName("TD")[0];
      //check if the two rows should switch place:
      if (Number(x.innerHTML) > Number(y.innerHTML)) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}