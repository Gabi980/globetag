maptilersdk.config.apiKey = 'JU48W0yhAlhBQNhCSx4e';
    const appContainer = document.getElementById('map');
    const map = new maptilersdk.Map({
      container: appContainer, // container's id or the HTML element to render the map
      style:  maptilersdk.MapStyle.STREETS,
      center: [-70.8, 0], // starting position [lng, lat]
      zoom: 1.5, // starting zoom
      projection: 'globe' //enable globe projection
    });

    // Creating the div that will contain all the markers
    const markerContainer = document.createElement("div");
    appContainer.appendChild(markerContainer);

    (async () => {
      await map.onReadyAsync();

      const markerManager = new maptilermarkerlayout.MarkerLayout(map, {
        layers: ["Country labels"],
        markerSize: [140, 80],
        markerAnchor: "top",
        offset: [0, -8], // so that the tip of the marker bottom pin lands on the city dot
        sortingProperty: "rank",

        // With `sortingProperty` option as a function, the following is equivalent to the above
        // sortingProperty: (feature) => {
        //   return feature.properties.rank;
        // },

        filter: ((feature) => {
          console.log(feature.properties);
          return ["country"].includes(feature.properties.class)
        })
      });


      // This object contains the marker DIV so that they can be updated rather than fully recreated every time
      const markerLogicContainer = {};

      // This function will be used as the callback for some map events
      const updateMarkers = () => {
        const markerStatus = markerManager.update();

        if (!markerStatus) return;

        // Remove the div that corresponds to removed markers
        markerStatus.removed.forEach((abstractMarker) => {
          const markerDiv = markerLogicContainer[abstractMarker.id];
          delete markerLogicContainer[abstractMarker.id];
          markerContainer.removeChild(markerDiv);
        });

        // Update the div that corresponds to updated markers
        markerStatus.updated.forEach((abstractMarker) => {
          const markerDiv = markerLogicContainer[abstractMarker.id];
          updateMarkerDiv(abstractMarker, markerDiv);
        });

        // Create the div that corresponds to the new markers
        markerStatus.new.forEach((abstractMarker) => {
          const markerDiv = makeMarker(abstractMarker);
          markerLogicContainer[abstractMarker.id] = markerDiv;
          markerContainer.appendChild(markerDiv);
        });
      }

      // The "idle" event is triggered every second because of the particle layer being refreshed,
      // even though their is no new data loaded, so this approach proved to be the best for this scenario
      map.on("move", updateMarkers);

      map.on("moveend", () => {
        map.once("idle", updateMarkers);
      })

      updateMarkers();
    })()

    function makeMarker(abstractMarker) {

      const marker = document.createElement("div");
      marker.classList.add("marker");
      marker.classList.add('fade-in-animation');
      marker.style.setProperty("width", `${abstractMarker.size[0]}px`);
      marker.style.setProperty("height", `${abstractMarker.size[1]}px`);
      marker.style.setProperty("transform", `translate(${abstractMarker.position[0]}px, ${abstractMarker.position[1]}px)`);

      const feature = abstractMarker.features[0];

      marker.innerHTML = `
        <div class="markerPointy"></div>
        <div class="markerBody">

          <div class="markerTop">
            ${feature.properties["name:en"] || feature.properties["name"]}
          </div>

          <div class="markerBottom">
          </div>
        </div>
      `
      return marker;
    }

    function updateMarkerDiv(abstractMarker, marker) {
      marker.style.setProperty("width", `${abstractMarker.size[0]}px`);
      marker.style.setProperty("height", `${abstractMarker.size[1]}px`);
      marker.style.setProperty("transform", `translate(${abstractMarker.position[0]}px, ${abstractMarker.position[1]}px)`);
    }