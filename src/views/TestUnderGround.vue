<template>
  <h1>HOME中的内容</h1>
  <div id="menu" class="esri-widget">
    <button id="undergroundBtn">Go underground</button>
  </div>
  <div id="Mapview1"></div>
</template>
<script lang="ts">
import {loadModules} from "esri-loader";
import {defineComponent} from "vue";
export default defineComponent({
  name: "TestUnderGround",
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
        "esri/renderers/ClassBreaksRenderer",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/support/ClassBreakInfo",
        "esri/layers/MapImageLayer",
        "esri/Camera",
        "esri/geometry/Point"],option).then(([Map,MapView,SceneView,TileLayer,WebScene,esriConfig,SceneLayer,FeatureLayer,Circle,Graphic,Home,Legend,Basemap,ClassBreaksRenderer,SimpleLineSymbol,ClassBreakInfo,MapImageLayer,
                                             Camera,
                                                     Point]) =>{


        let baseLayer = new MapImageLayer({
          url: "http://10.10.30.156:6080/arcgis/rest/services/basemap_v2/MapServer",
          //opacity: 0.6,
          sublayers: [
            {
              id:14,
              visible:true
            },
            {
              id:13,
              visible:true
            },
            {
              id:12,
              visible:true
            },
            {
              id:10,
              visible:true
            },
            {
              id:9,
              visible:true
            },
            {
              id:8, // 建筑
              visible:true
            },
            {
              id:6,
              visible:true
            },
            {
              id:5,
              visible:true
            },
            {
              id:3,
              visible:true
            },
            {
              id:2,
              visible:true
            },
            {
              id:1,
              visible:true
            },

          ]
        });
        // toggles the visibility of the first sublayer to false
        // 隐藏底图中的建筑
        const subBuilding = baseLayer.findSublayerById(8);
        subBuilding.visible = false;

        const baseMap = new Basemap({
          baseLayers: [baseLayer],
        });

        const map = new Map({
          basemap: baseMap,
        });
        map.ground.opacity = 0.4;
        //map.ground.surfaceColor = "#CFC7BC";
        map.ground.navigationConstraint = {
          type: "none"
        };


        let polyline = {
          type: "polyline",  // autocasts as new Polyline()
          paths: [
            [116.64001170027984,35.42917989993248,-0],
            [116.64128619969847,35.42892249957373,0],
            [116.64229649988363,35.42882050026594,-0],
            [116.64268520036183,35.42881009960644,-0],
            [116.64308829988522,35.42883500003529,-0],
            [116.64399149980795,35.4290474001175,-0]
          ]
        };

        let polylineSymbol = {
          type: "simple-line",  // autocasts as SimpleLineSymbol()
          color: [226, 119, 40],
          width: 4
        };

        let polylineAtt = {
          Name: "Keystone Pipeline",
          Owner: "TransCanada"
        };

        let polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: polylineSymbol,
          attributes: polylineAtt
        });



        const view = new SceneView({
          map: map,
          container: "Mapview1",
          camera: {
            position: [116.64001170027984,35.42917989993248, 3000],
            // tilt=0:镜头与垂线夹角0 说明镜头正对准地面
            tilt: 0,
            heading: 0
          },
        });

        view.graphics.add(polylineGraphic);


        let homeWidget = new Home({
          view: view
        });

        // adds the home widget to the top left corner of the SceneView
        view.ui.add(homeWidget, "top-left");

        const undergroundBtn = document.getElementById("undergroundBtn");
        undergroundBtn!.addEventListener("click", () => {
          // slide 1 of the webscene presentation has a viewpoint that is underground
          // view
          //     .goTo(map.presentation.slides.getItemAt(1).viewpoint, {
          //       duration: 1000
          //     })

          // view
          //     .goTo({
          //       center: [116.64001170027984,35.42917989993248],
          //       heading: 180, // set the heading to point South
          //       tilt: -45, // maintain tilt value
          //     }, {
          //       duration: 1000
          //     })
          //
          //     .catch((error: any) => {
          //       if (error.name !== "AbortError") {
          //         console.error(error);
          //       }
          //     });
          // go to a location defined by a Camera object
          let cam = new Camera({
            position: new Point({
              x: 116.64268520036183, // lon
              y: 35.4290474001175,      // lat
              z: -200,   // elevation in meters
            }),

            heading: 75, // facing due south
            tilt: 135      // bird's eye view
          });

          view.goTo(cam);
        });
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
