// Progressive enhancement for server rendered content components.
// Currently only <HAVMap>: loads Leaflet on demand and initialises the maps.
(function () {
  const maps = document.querySelectorAll("[data-hav-map]");
  if (!maps.length) return;

  const leafletSrc = document.currentScript && document.currentScript.dataset.leaflet;

  function init() {
    const L = window.L;
    maps.forEach((el) => {
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      });
      const hot = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          'Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> ' +
          'hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
      });
      const map = L.map(el, {
        center: [parseFloat(el.dataset.lat), parseFloat(el.dataset.lng)],
        zoom: parseInt(el.dataset.zoom, 10),
        layers: [hot],
      });
      L.control.layers({ OSM: osm, "Humanitarian OSM": hot }, {}, { position: "topright" }).addTo(map);
    });
  }

  if (window.L) {
    init();
  } else if (leafletSrc) {
    const script = document.createElement("script");
    script.src = leafletSrc;
    script.onload = init;
    document.head.appendChild(script);
  }
})();
