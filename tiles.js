/*Tiles*/
var wmsJacoubet = L.tileLayer.wms('https://geohistoricaldata.org/geoserver/ows?SERVICE=WMS&',{
    layers:'paris-rasters:jacoubet_1836',
    attribution: 'Atlas général de la Ville, des faubourgs et des monuments de Paris - Jacoubet - 1836 © <a target="_blank" href="https://geohistoricaldata.org/">GeoHistoricalData</a>'
    });

var wmsAndriveau = L.tileLayer.wms('https://geohistoricaldata.org/geoserver/ows?SERVICE=WMS&',{
    layers:'paris-rasters:andriveau_1849',
    attribution: 'Plan de Paris contenant l\'enceinte des fortifications - Andriveau-Goujon - 1849 © <a target="_blank" href="https://geohistoricaldata.org/">GeoHistoricalData</a>'
    });

var wmsbhdv = L.tileLayer.wms('https://geohistoricaldata.org/geoserver/ows?SERVICE=WMS&',{
    layers:'paris-rasters:BHdV_PL_ATL20Ardt_1888',
    attribution: 'Atlas municipal - 1888 © <a target="_blank" href="https://geohistoricaldata.org/">GeoHistoricalData</a>'
    });

var GeoportailFrance_plan = L.tileLayer(
    "https://data.geopf.fr/wmts?" +
    "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
    "&STYLE=normal" +
    "&TILEMATRIXSET=PM" +
    "&FORMAT=image/png"+
    "&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2"+
    "&TILEMATRIX={z}" +
    "&TILEROW={y}" +
    "&TILECOL={x}",
    {
        minZoom : 0,
        maxZoom : 18,
        attribution : "IGN-F/Geoportail",
        tileSize : 256 // les tuiles du Géooportail font 256x256px
    }
);

/////////////// VECTOR LAYER

var url_voies = "./data/voie.geojson"
//Source : Open data Paris

function onEachLine(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(feature.properties.l_longmin);
    }
}

var voies = L.geoJSON(null,{
    onEachFeature: onEachLine,
    style:{
            "color": "ff7800",
            "weight": 0.5,
            "opacity": 1
    }
});

$.getJSON(url_voies, function(data) {
    voies.addData(data);
});


var url_arr = "./data/arrondissement.geojson"
//Source : Open data Paris

var arr = L.geoJSON(null,{
    //onEachFeature: onEachLine,
    style: {
        color: 'lightblue',
        fillColor: '#f03',
        fillOpacity: 0.5
    }
});

$.getJSON(url_arr, function(data) {
    arr.addData(data);
});

var openDataParis = L.layerGroup([voies])