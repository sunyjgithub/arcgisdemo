<template>
  <div id="sceneview222"></div>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {loadModules} from 'esri-loader';

export default defineComponent({
  name: 'Test3',
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
        "esri/Basemap",
        'esri/views/3d/externalRenderers',
        "esri/geometry/SpatialReference",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleLineSymbol"],option).then(([Map,MapView,SceneView,TileLayer,WebScene,esriConfig,SceneLayer,FeatureLayer,Circle,Graphic,Home,Legend,Basemap,externalRenderers,SpatialReference,SimpleRenderer,SimpleLineSymbol]) =>{

        //支路
        const zhiroadLayer = new FeatureLayer({
          url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/speedroad/FeatureServer",
        });
        const map = new WebScene({
          portalItem: {
            id: "90f1d6672e1345a68f77c8abbb0c42da"
          },
          layers: [zhiroadLayer]
        });


        // debugger;
        // map.layers.unshift(zhiroadLayer);

        // 山东边界
        // const featureLayer = new FeatureLayer({
        //   url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/%E5%B1%B1%E4%B8%9C%E7%9C%81/FeatureServer"
        // });
        //
        // map.add(featureLayer);

        // 济宁市底图
        // const jiNingLayer = new FeatureLayer({
        //   url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/jncity/FeatureServer"
        // });
        //
        // map.add(jiNingLayer);


        const view = new SceneView({
          viewingMode: "local",
          container: "sceneview222",
          map: map,
          camera: {
            position: [116.587245, 35.415393, 3000],
            // tilt=0:镜头与垂线夹角0 说明镜头正对准地面
            tilt: 75,
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

      })




    },
  },
  mounted() {
    this._createSceneView();
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

#sceneview222 {
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
