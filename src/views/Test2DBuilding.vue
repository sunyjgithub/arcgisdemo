<template>
  <div id="sceneviewx"></div>
  <router-view></router-view>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {loadModules} from 'esri-loader';
import * as THREE from "@/libs/three.module";

export default defineComponent({
  name: 'Test2DBuilding',
  components: {},
  data() {
    return {
      view: null
    }
  },
  methods: {
    _createSceneView: function () {
      let option = {
        url: 'https://js.arcgis.com/4.24/',
        css: 'https://js.arcgis.com/4.24/esri/themes/light/main.css'
      }
      loadModules(["esri/Map",
        "esri/views/MapView",
        "esri/views/SceneView",
        "esri/layers/TileLayer",
        "esri/WebScene",
        "esri/config",
        "esri/layers/SceneLayer",
        "esri/layers/FeatureLayer",
        "esri/geometry/Circle",
        "esri/Graphic",
        "esri/widgets/Home",
        "esri/widgets/Legend",
        "esri/Basemap",
        'esri/views/3d/externalRenderers',
        "esri/geometry/SpatialReference",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleLineSymbol",
        "esri/layers/GraphicsLayer",
        "esri/layers/support/Field",
        "esri/widgets/Daylight"], option).then(([Map, MapView, SceneView, TileLayer, WebScene, esriConfig, SceneLayer, FeatureLayer, Circle, Graphic, Home, Legend, Basemap, externalRenderers, SpatialReference, SimpleRenderer, SimpleLineSymbol,GraphicsLayer,Field,Daylight]) => {

        // 官网底图
        const map = new Map({
          // basemap: "dark-gray-vector"
          basemap: "satellite",
          ground: "world-elevation"
          // basemap: "osm"
        });


        // 1. IconSymbol3DLayers must be added to the symbolLayers property of either the PointSymbol3D or PolygonSymbol3D symbols.
        let pointSymbol3D = {
          type: "point-3d",  // autocasts as n7ew PointSymbol3D()
          symbolLayers: [
            {
              type: "icon", // autocasts as new IconSymbol3DLayer()
              resource: {
                href: "/static/处理.png"
              },
              size: '75px', // The size of the icon in points.
              // material: { color: "red" }
            }
          ],
          verticalOffset: {
            screenLength: 0,
            maxWorldLength: 100,
            minWorldLength: 20
          },
          // Callouts are drawn from the point feature location that is being symbolized, to the vertical offset of the symbol.
          // This property has no effect if verticalOffset is not set
          callout: {
            type: "line",  // autocasts as new LineCallout3D()
            size: 1.5,
            color: [150, 150, 150],
            border: {
              color: [50, 50, 50]
            }
          }
        };
        let points = [
          {
            geometry: {
              type: "point",
              x: 116.587245,
              y: 35.415393,
              z: 0
            },
            attributes: {
              ObjectID: 1,
              name:"美术博物馆",
            },
          },
        ];
        let citiesRenderer = {
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: pointSymbol3D,
        };
        const labelClass = {
          // autocasts as new LabelClass()
          symbol: {
            type: "label-3d", // autocasts as new LabelSymbol3D()
            symbolLayers: [
              {
                type: "text", // autocasts as new TextSymbol3DLayer()
                material: {
                  color: "white"
                },
                // we set a halo on the font to make the labels more visible with any kind of background
                halo: {
                  size: 1,
                  color: [50, 50, 50]
                },
                size: 10
              }
            ]
          },
          labelPlacement: "center-right",
          labelExpressionInfo: {
            expression: "$feature.name"
          }
        };
        // define each field's schema
        const fields = [
          new Field({
            name: "ObjectID",
            alias: "ObjectID",
            type: "oid"
          }), new Field({
            name: "name",
            alias: "name",
            type: "string"
          })
        ];
        let symbol = {
          type: "polygon-3d", // autocasts as new PolygonSymbol3D()
          symbolLayers: [{
            size: 30,  // 100,000 meters in height
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
              color: [244, 247, 134]
            },
            edges: {
              type: "solid", // autocasts as new SolidEdges3D()
              color: [50, 50, 50, 0.5]
            },
            castShadows: true // Indicates whether the symbol layer geometry casts shadows in the scene.
          }]
        };
        const renderer = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: symbol
        };

        let blayer = new FeatureLayer({
          url:'https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/buildoutline/FeatureServer',
          renderer: renderer,
          elevationInfo: {
            mode: "on-the-ground"
          },
        });
        map.add(blayer);





        const waterRenderer = {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: {
            type: "polygon-3d",
            symbolLayers: [{
              type: "water",
              waveDirection: 180,
              color: "#5975a3",
              waveStrength: "moderate",
              waterbodySize: "medium"
            }]
          }
        };
        let water = new FeatureLayer({
          url:'http://10.127.16.113:6080/arcgis/rest/services/WaterService/MapServer/2',
          renderer: waterRenderer,
          elevationInfo: {
            mode: "on-the-ground"
          },
        });
        map.add(water);


        let layer = new FeatureLayer({
          source: points,  // autocast as a Collection of new Graphic()
          objectIdField: "ObjectID",
          outFields:['*'],
          renderer: citiesRenderer,
          labelingInfo: [labelClass],
          fields: fields,
          screenSizePerspectiveEnabled: true
        });
        map.add(layer);


        let Citylayer = new FeatureLayer({
          url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/pointstest/FeatureServer",  // autocast as a Collection of new Graphic()
          outFields:['*'],
          renderer: citiesRenderer,
          labelingInfo: [labelClass],
          fields: fields,
          screenSizePerspectiveEnabled: true,
          id: "blink"
        });
        map.add(Citylayer);





        const view = new SceneView({
          map: map,
          container: "sceneviewx",
          //viewingMode :"local",
          camera: {
            position: [116.587245, 35.415393, 3000],
            // tilt=0:镜头与垂线夹角0 说明镜头正对准地面
            tilt: 0,
            heading: 0
          },
          environment: {
            lighting: {
              type: "sun",  // autocasts as new SunLighting()
              date: new Date(), // sets the lighting to reflect the current time of day
              directShadowsEnabled: true
            }
          },
          atmosphere: {
            quality: "high" // creates a more realistic atmosphere
          }
        });

        let homeWidget = new Home({
          view: view
        });

        // adds the home widget to the top left corner of the SceneView
        view.ui.add(homeWidget, "top-left");


        let highlight:any;

        // Set up a click event handler and retrieve the screen point
        view.on("click", function(event: any) {
          // the hitTest() checks to see if any graphics in the view
          // intersect the given screen x, y coordinates
          // view.hitTest(event)
          //     .then(getGraphics);
          view.hitTest(event).then(function(response: any) {
            debugger;
            // 只有撞击到大楼的时候才会触发事件
            // 在view.hitTest里进行是否点击到FeatureLayer要素的判断。判断条件有两个：
            // ①response.results.length是否大于0（即是否等于1） ②response.results[0].graphic是否存在
            if (!response.results || response.results.length === 0) {
              alert('啥也没撞击着');
              return;
            } else {
              let result = response.results[0];
              if (result){
                // 高亮
                view.whenLayerView(Citylayer)
                    .then(function(layerView: any) {
                      // The layerview for the layer
                      if (highlight) {
                        highlight.remove();
                      }
                      highlight = layerView.highlight(result.graphic);

                      // center the feature
                      view.goTo(
                          {
                            center: [result.mapPoint.longitude, result.mapPoint.latitude],
                            zoom: 10,
                            tilt: 75,
                            heading: 0
                          },
                          {
                            duration: 2000,
                            easing: "in-out-expo"
                          }
                      ).catch((error:any) => {
                            if (error.name != "AbortError") {
                              console.error(error);
                            }
                          });
                    })
                    .catch(function(error:any) {
                      // An error occurred during the layerview creation
                    });
              }
            }
          });
        });


        const daylightWidget = new Daylight({
          view: view,
          visibleElements: {
            timezone: true,
            datePicker: true,
            playButtons: true,
            sunLightingToggle: true,
            shadowsToggle: false
          }
        });

        view.ui.add(daylightWidget, "top-right");




      })


    },
  },
  mounted() {
    this._createSceneView();
  }
});
</script>

<style>

html, body, #map {
  height: 100%; width: 100%; margin: 0; padding: 0;
}
@-webkit-keyframes
pulse
{
  0%
  {
    opacity: 1.0;

  }
  45%
  {
    opacity: 0.20;

  }
  100%
  {
    opacity: 1.0;

  }
}
#blink_layer {
  -webkit-animation-duration: 3s;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-name: pulse;
  -moz-animation-duration: 3s;
  -moz-animation-iteration-count: infinite;
  -moz-animation-name: pulse;
}



#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#sceneviewx {
  position: absolute;
  width: 100%;
  height: 100%;
}

html,
body,
#viewDiv {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}

#buttonsDiv {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 12px;
  background-color: rgba(200, 200, 200, 0.5);
  border: 1px solid black;
}

#indicatorSpan {
  display: inline-block;
  vertical-align: middle;
  width: 30px;
  height: 30px;
  background-color: rgba(100, 100, 100, 0.8);
  border: 2px solid #ccc;
}
</style>
