// import GeoJSON from "ol/format/GeoJSON.js";
// import LinearRing from "ol/geom/LinearRing.js";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon, LinearRing } from "ol/geom.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { fromLonLat } from "ol/proj.js";
import * as jsts from "jsts";
// import { useRef } from "react";
import Style from "ol/style/Style";
import { Feature } from "ol";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import "./App.css";
import { useRef } from "react";

function App() {
  const mapElement = useRef(null);

  const source = new VectorSource();

  const vectorLayer = new VectorLayer({
    source: source,
  });

  const rasterLayer = new TileLayer({
    source: new OSM(),
  });

  let regularStyle = new Style({
    stroke: new Stroke({
      color: "#0e97fa",
      width: 3,
    }),
    fill: new Fill({
      color: [0, 0, 0, 0.2],
    }),
  });

  let highlightStyle = new Style({
    stroke: new Stroke({
      color: [255, 0, 0, 0.6],
      width: 3,
    }),
    fill: new Fill({
      color: [255, 0, 0, 0.2],
    }),
    zIndex: 1,
  });

  let polygon1 = new Feature({
    geometry: new Polygon([
      [
        [-10717583.549570508, 3833749.5732664512],
        [-10777554.891503, 3804332.7398631293],
        [-10864387.34630427, 3834907.5511772],
        [-10852646.620625805, 3906819.5017894786],
        [-10717583.549570508, 3833749.5732664512],
      ],
    ]),
  });

  vectorLayer.getSource().addFeature(polygon1);

  //Sample polygon to merge
  let polygon2 = new Feature({
    geometry: new Polygon([
      [
        [-10852646.620625805, 3906819.5017894786],
        [-10797367.365502242, 3950847.234747086],
        [-10691456.211645748, 3911711.47159973],
        [-10687298.044771587, 3848605.062913627],
        [-10717583.549570508, 3833749.5732664512],
        [-10852646.620625805, 3906819.5017894786],
      ],
    ]),
  });

  vectorLayer.getSource().addFeature(polygon2);

  let mergePolygon = (e) => {
    let parser = new jsts.io.OL3Parser();
    parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);
    console.log(parser);
    console.log(vectorLayer.getSource().getFeatures()[0].getGeometry(), vectorLayer.getSource().getFeatures()[1].getGeometry());

    //Parse Polygons geometry to jsts type
    let a = parser.read(vectorLayer.getSource().getFeatures()[0].getGeometry());
    let b = parser.read(vectorLayer.getSource().getFeatures()[1].getGeometry());

    //Perform union of Polygons. The union function below will merge two polygon together
    let union = a.union(b);

    let merged_polygon = new Feature({
      geometry: new Polygon(parser.write(union).getCoordinates()),
    });
    vectorLayer.getSource().clear();
    vectorLayer.getSource().addFeature(merged_polygon);
    vectorLayer.setStyle(highlightStyle);
  };

  let clearGraphics = () => {
    // removeInteractions();
    map.getOverlays().clear();
    vectorLayer.getSource().clear();
    vectorLayer.setStyle(regularStyle);
  };

  const map = new Map({
    layers: [rasterLayer, vectorLayer],
    // target: document.getElementById("map"),
    view: new View({
      center: fromLonLat([-96.6345990807462, 32.81890764151014]),
      zoom: 9,
    }),
  });

  map.setTarget(mapElement.current);

  return (
    <div>
      <button
        // id="btn2"
        title="Merge Polygons"
        onClick={mergePolygon}
      >
        Merge Polygons
      </button>
      <button
        // id="btn2"
        title=" Clear Graphics"
        onClick={clearGraphics}
      >
        Clear Graphics
      </button>

      <div
        // id="map"
        className="map"
        ref={mapElement}
      ></div>
    </div>
  );
}

export default App;
