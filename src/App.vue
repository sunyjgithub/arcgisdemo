<template>
<!--  <div id="sceneview"></div>-->
<!--  <div id="buttonsDiv">-->
<!--    <button id="rotateAntiClockwiseSpan" title="Rotate 90°">↻</button>-->
<!--    <button id="indicatorSpan"></button>-->
<!--    <button id="rotateClockwiseSpan" title="Rotate 90°">↺</button>-->
<!--  </div>-->
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {loadModules} from 'esri-loader';

export default defineComponent({
  name: 'App',
  components: {

  },
  data(){
    return{
      view:null
    }
  },
  methods:{
    _createSceneView: function (){
        let option ={
          url: 'https://js.arcgis.com/4.4/',
          css: 'https://js.arcgis.com/4.4/esri/themes/light/main.css'
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
          "esri/Basemap"],option).then(([Map,MapView,SceneView,TileLayer,WebScene,esriConfig,SceneLayer,FeatureLayer,Circle,Graphic,Home,Legend,Basemap]) =>{



          const tileLayer = new TileLayer({
            url:"http://10.127.16.113:6080/arcgis/rest/services/jining/MapServer"
          });
          const baseLayers =[tileLayer];
          const basemap=new Basemap({
            baseLayers
          });

          const map = new Map({
            basemap: basemap
          });
          // map.ground.surfaceColor = '#fff';
          const buildingLayer = new SceneLayer({
            id:"building",
            popupEnabled: false,
            url: "https://tiles.arcgis.com/tiles/U26uBjSD32d7xvm2/arcgis/rest/services/building_demo2/SceneServer"
          });

          map.add(buildingLayer);

          // 山东边界
          // const featureLayer = new FeatureLayer({
          //   url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/%E5%B1%B1%E4%B8%9C%E7%9C%81/FeatureServer"
          // });
          //
          // map.add(featureLayer);

          // // 济宁市底图
          // const jiNingLayer = new FeatureLayer({
          //   url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/jncity/FeatureServer"
          // });
          //
          // map.add(jiNingLayer);

          // speedRoad
          // const speedroadLayer = new FeatureLayer({
          //   url: " https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/speedroad/FeatureServer"
          // });
          // map.add(speedroadLayer);



          map.ground.surfaceColor = '#fff';


          const view = new SceneView({
            map: map,
            container: "sceneview",
            // viewingMode :"local",
            camera: {
              position: [116.587245, 35.415393, 3000],
              // tilt=0:镜头与垂线夹角0 说明镜头正对准地面
              tilt: 0,
              heading: 0
            }
          });

          let homeWidget = new Home({
            view: view
          });

          // adds the home widget to the top left corner of the SceneView
          view.ui.add(homeWidget, "top-left");


          let legend = new Legend({
            view: view
          });

          view.ui.add(legend, "bottom-right");






          const circleGeometry = new Circle({
            center: [ 116.587245, 35.415393 ],
            geodesic: true,
            numberOfPoints: 100,
            radius: 100,
            radiusUnit: "kilometers"
          });

          view.graphics.add(new Graphic({
            geometry: circleGeometry,
            symbol: {
              type: "simple-fill",
              style: "none",
              outline: {
                width: 3,
                color: "red"
              }
            }
          }));

          let highlight:any;

          // Get the screen point from the view's click event
          view.on("click", function(event: MouseEvent) {
            // Search for graphics at the clicked location. View events can be used
            // as screen locations as they expose an x,y coordinate that conforms
            // to the ScreenPoint definition.
            view.hitTest(event).then(function(response: any) {
              // 只有撞击到大楼的时候才会触发事件
              // 在view.hitTest里进行是否点击到FeatureLayer要素的判断。判断条件有两个：
              // ①response.results.length是否大于0（即是否等于1） ②response.results[0].graphic是否存在
              if (!response.results || response.results.length === 0) {
                  alert('啥也没撞击着');
                  return;
              } else {
                const building = response.results.filter((result:any) => result.graphic.layer.id === "building")?.[0]
                if (building) {
                  // alert('建筑物');
                  console.log(building);
                  // 高亮
                  view.whenLayerView(buildingLayer)
                      .then(function(layerView: any) {
                        // The layerview for the layer
                        if (highlight) {
                          highlight.remove();
                        }
                        highlight = layerView.highlight(building.graphic.attributes.OBJECTID);

                        // center the feature
                        view.goTo(
                                {
                                  center: [building.mapPoint.longitude, building.mapPoint.latitude],
                                  zoom: 16,
                                  tilt: 75,
                                  heading: 0
                                },
                                {
                                  duration: 2000,
                                  easing: "in-out-expo"
                                }
                            )
                            .catch((error:any) => {
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
        })




    },
    rotateView: function (direction: number){
      // let heading = this.view!.camera.heading;
      // // Set the heading of the view to the closest multiple of 90 degrees,
      // // depending on the direction of rotation
      // if (direction > 0) {
      //   heading = Math.floor((heading + 1e-3) / 90) * 90 + 90;
      // } else {
      //   heading = Math.ceil((heading - 1e-3) / 90) * 90 - 90;
      // }
      //
      // view
      //     .goTo({
      //       heading: heading
      //     })
      //     .catch((error: { name: string; }) => {
      //       if (error.name != "AbortError") {
      //         console.error(error);
      //       }
      //     });
    }
  },
  mounted() {
    // this._createSceneView();
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#sceneview {
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
