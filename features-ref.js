/******************************
 **** Init Features Layers ****
 *****************************/

//Ref
var url_ref = "./data/reference_geocoded_unique.geojson"

var ref = L.geoJSON(null,{
    onEachFeature: onEachFeature,
    pointToLayer:pointToLayerRef
});

$.getJSON(url_ref, function(data) {
        ref.addData(data);
});

var refgroup =L.featureGroup();
ref.addTo(refgroup);

//Update values on change
slidervar.noUiSlider.on('update', function( values, handle ) {
    //console.log(handle);
    if (handle==0){
        document.getElementById('input-number-min').value = values[0];
    } else {
        document.getElementById('input-number-max').value =  values[1];
    }
    rangeMin = document.getElementById('input-number-min').value;
    rangeMax = document.getElementById('input-number-max').value;

         //Reference layer update
    //Clear the layer:
    refgroup.removeLayer(ref);
    //Repopulate it with filtered features
    ref = new L.geoJson(null,{
        onEachFeature: onEachFeature,
        filter:
            function(feature, layer) {
                return ((feature.properties.date_debut != null && feature.properties.date_fin != null) &&
                   (feature.properties.date_debut >= rangeMin && feature.properties.date_fin <= rangeMax));
            },
        pointToLayer: pointToLayerRef
    })
    $.getJSON(url_ref, function(data) {
        ref.addData(data);
    });
    //and back again into the cluster group
    ref.addTo(refgroup)

    refgroup.bringToFront()
});
