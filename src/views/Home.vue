<template>
  <h1>HOME中的内容</h1>
  <div id="Mapview1"></div>
</template>
<script lang="ts">
import {loadModules} from "esri-loader";
import {defineComponent} from "vue";
export default defineComponent({
  name: "Home",
  components: {
  },
  methods:{
    _createSceneView: function (){
      let option ={
        url: 'https://js.arcgis.com/4.24/',
        css: 'https://js.arcgis.com/4.24/esri/themes/light/main.css'
      }
      loadModules(["esri/Map",
        "esri/views/MapView",
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
        "esri/renderers/ClassBreaksRenderer",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/support/ClassBreakInfo"],option).then(([Map,MapView,TileLayer,WebScene,esriConfig,SceneLayer,FeatureLayer,Circle,Graphic,Home,Legend,Basemap,ClassBreaksRenderer,SimpleLineSymbol,ClassBreakInfo]) =>{


        const less35 =new SimpleLineSymbol(
             {
              color: "lightblue",
              width: "2px",
              style: "short-dot"
            }
            );
        const less36100 = new SimpleLineSymbol({
          color: "#00ffee",
          width: "2px",
          style: "short-dot"
        });
        const more100 = new SimpleLineSymbol({
          color: "#33cc33",
          width: "2px",
          style: "short-dot"
        });

        let renderer = new ClassBreaksRenderer({
          field: "temp",
          classBreakInfos: [
            new ClassBreakInfo(
              {
                minValue: 0,  // 0 acres
                maxValue: 35,  // 200,000 acres
                symbol: less35,  // will be assigned sym1
                label: "fewer than 200,000 acres"
              }
            )
            ,
            new ClassBreakInfo(
            {
              minValue: 36,  // 200,001 acres
              maxValue: 100,  // 500,000 acres
              symbol: less36100,  // will be assigned sym2
              label: "200,000 - 500,000 acres"
            }),
            new ClassBreakInfo(
            {
              minValue: 101,  // 500,001 acres
              maxValue: 10000,  // 750,000 acres
              symbol: more100,  // will be assigned sym2
              label: "more than 500,000 acres"
            })
          ]
        });

        // 山东边界
        const featureLayer = new FeatureLayer({
          url: "http://10.127.16.113:6080/arcgis/rest/services/testTemprature/MapServer/0",
          renderer: renderer,
          outFields:['*']
        });
        // the layer will be refreshed every 6 seconds.
        featureLayer.refreshInterval = 0.1;

        const map = new Map({
          // basemap: 'osm',
          layers: [featureLayer]
        });

        const view = new MapView({
          map: map,
          container: "Mapview1",
        });

        // const legend = new Legend({
        //   view: view
        // });
        //
        // view.ui.add(legend, "bottom-left");

        // const legend = new Legend({
        //   view: view
        // });
        //
        // view.ui.add(legend, "bottom-left");
        // setTimeout(()=>{
        //   featureLayer.refresh()
        // },2000)
      })






    },
  },
  mounted() {
    this._createSceneView();
  }
});

</script>

<style scoped>
#Mapview1 {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
</style>
