<template>
  <div id="sceneviewx"></div>
  <router-view></router-view>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {loadModules} from 'esri-loader';
import * as THREE from "@/libs/three.module";
import axios from "axios";

import * as dat from 'dat.gui';

const mapking = require('maptalks');
const MeshLine = require('three.meshline').MeshLine;

const MeshLineMaterial = require('three.meshline').MeshLineMaterial;

export default defineComponent({
  name: 'Test2',
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
        "esri/layers/GraphicsLayer",], option).then(([Map, MapView, SceneView, TileLayer, WebScene, esriConfig, SceneLayer, FeatureLayer, Circle, Graphic, Home, Legend, Basemap, externalRenderers, SpatialReference, SimpleRenderer, SimpleLineSymbol,GraphicsLayer]) => {

        // 官网底图
        const map = new Map({
          basemap: "osm"
        });

        // 三维建筑图层
        const buildingLayer = new SceneLayer({
          id: "building",
          popupEnabled: false,
          url: "https://tiles.arcgis.com/tiles/U26uBjSD32d7xvm2/arcgis/rest/services/building_demo2/SceneServer"
        });

        map.add(buildingLayer);


        const point = {
          type: "point", // autocasts as new Point()
          x: 116.587245,
          y: 35.415393,
          z: 0
        };


        const markerSymbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [226, 119, 40],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 2
          }
        };


        const pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol
        });

        const graphicsLayer = new GraphicsLayer();
        graphicsLayer.add(pointGraphic);
        map.add(graphicsLayer);

        // const more100 = new SimpleLineSymbol({
        //   color: "#ff0000",
        //   width: "2px",
        //   style: "solid"
        // });
        // let citiesRenderer = new SimpleRenderer(
        //     {
        //       symbol: more100
        //     }
        // );
        //
        // //支路
        // const zhiroadLayer = new FeatureLayer({
        //   url: " https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/cityzhilu/FeatureServer",
        //   renderer: citiesRenderer,
        //   opacity: 0.3
        // });
        // map.add(zhiroadLayer);


        const view = new SceneView({
          map: map,
          container: "sceneviewx",
          //viewingMode :"local",
          //viewingMode: "local",
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


        // const circleGeometry = new Circle({
        //   center: [116.587245, 35.415393],
        //   geodesic: true,
        //   numberOfPoints: 100,
        //   radius: 100,
        //   radiusUnit: "kilometers"
        // });
        //
        // view.graphics.add(new Graphic({
        //   geometry: circleGeometry,
        //   symbol: {
        //     type: "simple-fill",
        //     style: "none",
        //     outline: {
        //       width: 3,
        //       color: "red"
        //     }
        //   }
        // }));

        let highlight: any;

        // Get the screen point from the view's click event
        view.on("click", function (event: MouseEvent) {
          // Search for graphics at the clicked location. View events can be used
          // as screen locations as they expose an x,y coordinate that conforms
          // to the ScreenPoint definition.
          view.hitTest(event).then(function (response: any) {
            debugger;
            // 只有撞击到大楼的时候才会触发事件
            // 在view.hitTest里进行是否点击到FeatureLayer要素的判断。判断条件有两个：
            // ①response.results.length是否大于0（即是否等于1） ②response.results[0].graphic是否存在
            if (!response.results || response.results.length === 0) {
              alert('啥也没撞击着');
              return;
            } else {
              const building = response.results.filter((result: any) => result.graphic.layer.id === "building")?.[0]
              if (building) {
                // alert('建筑物');
                console.log(building);
                // 高亮
                view.whenLayerView(buildingLayer)
                    .then(function (layerView: any) {
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
                          .catch((error: any) => {
                            if (error.name != "AbortError") {
                              console.error(error);
                            }
                          });

                    })
                    .catch(function (error: any) {
                      // An error occurred during the layerview creation
                    });
              }
            }
          });
        });


        const myRenderer = {
          view: view,
          renderer: null as any, // three js 渲染器
          camera: null as any,    //three js 相机
          scene: null as any, //three js 场景
          height: 100,
          offest: 0,
          map: null as any,
          multiLineStrings: null as any,
          material: null as any,
          clock: null as any,
          setup: function (context: any) {
            this.clock = new THREE.Clock();
            this.renderer = new THREE.WebGLRenderer({
              context: context.gl,
              premultipliedAlpha: false,   //renderer 是否假设颜色有 premaultiplied alpha 默认为true
            });
            console.log(this.renderer)
            this.renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
            // this.renderer.setViewport(0,0,view.width,view.height);//视图大小设置
            //防止three.js 清除Arcgis JS API 提供的缓冲区
            this.renderer.autoClearDepth = false; // 定义renderer是否清除深度缓存
            this.renderer.autoClearStencil = false; // 定义renderer是否清除模板缓存
            this.renderer.autoClearColor = false; // 定义renderer是否清除颜色缓存
            // ArcGIS JS API渲染自定义离屏缓冲区，而不是默认的帧缓冲区。
            // 我们必须将这段代码注入到three.js运行时中，以便绑定这些缓冲区而不是默认的缓冲区。
            const originalSetRenderTarget = this.renderer.setRenderTarget.bind(
                this.renderer
            );
            this.renderer.setRenderTarget = function (target: any) {
              originalSetRenderTarget(target);
              if (target == null) {
                // 绑定外部渲染器应该渲染到的颜色和深度缓冲区
                context.bindRenderTarget();
              }
            };
            this.scene = new THREE.Scene();//场景
            this.camera = new THREE.PerspectiveCamera(75, view.width / view.height, 0.01, 5000);//相机
            //添加坐标轴辅助工具
            const axesHelper = new THREE.AxesHelper(10000000);
            this.scene.add(axesHelper);


            var textureLoader = new (THREE.TextureLoader as any)();
            //设置纹理贴图
            this.map = textureLoader.load('/static/daoluliuguang.png');
            this.map.wrapS = THREE.RepeatWrapping;
            this.map.wrapT = THREE.RepeatWrapping;
            this.map.repeat.set(1, 1)
            this.map.needsUpdate = true

            let meshMaterial = new THREE.MeshBasicMaterial({
              map: this.map,
              side: THREE.BackSide,
              transparent: true
            })

            const material = new THREE.MeshBasicMaterial
            (
                {
                  color: 0x00ff00,
                  transparent: true,
                  opacity: 0.5
                }
            );
            const ConeGeometry: any = new THREE.ConeGeometry( 6, 20, 4 );
            for (let i = 0; i < 200; i++) {
              const lineString = this.multiLineStrings[i]
              const positions: any[] = [];
              const coordinates = lineString.getCoordinates();
              coordinates.forEach((coordinate: any) => {
                if (coordinate.x && coordinate.y) {
                  var renderPos = [0, 0, 0];
                  externalRenderers.toRenderCoordinates(view, [coordinate.x, coordinate.y, 30], 0, SpatialReference.WGS84, renderPos, 0, 1);
                  const cone: any = new THREE.Mesh(ConeGeometry, material);
                  cone.position.set(renderPos[0], renderPos[1], renderPos[2]);
                  cone.rotation.x = 0.96;
                  cone.rotation.y = -50.88;
                  cone.rotation.z = -59.2;
                  this.scene.add(cone);
                  positions.push(new THREE.Vector3(renderPos[0], renderPos[1], renderPos[2]));
                }
              })
              if (positions.length > 0) {
                let curvePath = new THREE.CatmullRomCurve3(positions);//SplineCurve
                var geometry = new THREE.TubeGeometry(curvePath, 128, 20, 20, false);
                const mesh = new THREE.Mesh(geometry, meshMaterial);
                this.scene.add(mesh);
              }
            }






            // 精灵
            const map = new (THREE.TextureLoader as any)().load( 'https://developers.arcgis.com/javascript/latest/sample-code/visualization-point-styles/live/Museum.png' );
            const spriteMaterial = new THREE.SpriteMaterial( { map: map,transparent: true, opacity: 0.5 } );
            const sprite: any = new THREE.Sprite( spriteMaterial );
            var p = [0, 0, 0];
            externalRenderers.toRenderCoordinates(view, [116.587245, 35.415393, 30], 0, SpatialReference.WGS84, p, 0, 1);
            sprite.position.set(p[0],p[1],p[2])
            sprite.scale.set(10,10,10); //精灵大小
            this.scene.add( sprite );



            // const gui = new dat.GUI({}) //创建GUI实例
            // gui.add(cone.rotation,"x")
            // gui.add(cone.rotation,"y")
            // gui.add(cone.rotation,"z")

            // this.multiLineStrings.forEach((lineString: any)=>{
            //   const positions:any[] = [];
            //   const coordinates = lineString.getCoordinates();
            //   coordinates.forEach((coordinate: any)=>{
            //     if (coordinate.x && coordinate.y){
            //       var renderPos = [0, 0, 0];
            //       externalRenderers.toRenderCoordinates(view, [coordinate.x, coordinate.y, 30], 0, SpatialReference.WGS84, renderPos, 0, 1);
            //       positions.push(new THREE.Vector3(renderPos[0], renderPos[1], renderPos[2]));
            //     }
            //   })
            //   if (positions.length>0) {
            //     let curvePath = new THREE.CatmullRomCurve3(positions);//SplineCurve
            //     var geometry = new THREE.TubeGeometry(curvePath, 128, 10, 20, false);
            //     const mesh = new THREE.Mesh(geometry, meshMaterial);
            //     this.scene.add(mesh);
            //   }
            // })
          },
          render: function (context: any) {
            // console.log(this.clock.getElapsedTime())
            // 更新相机参数
            //  RenderCamera = context.camera
            //  eye : The position of the camera in the internal Cartesian rendering coordinate system.
            //  center: The camera target ("look at") position in the internal Cartesian rendering coordinate system.
            //  up: The camera up vector
            //  projectionMatrix: A 4x4 matrix that defines the perspective projection transformation.
            const cam = context.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(
                new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
            );
            // // 投影矩阵可以直接复制
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            // // // 更新几何体
            // //this.map.offset.x += 0.02;
            this.map.offset.x -= 0.01
            // //this.map.needsUpdate = true;
            // //this.material.uniforms.offset.value.x -= 0.005
            // // this.material.uniforms.dashOffset.value += 0.02
            // this.map.needsUpdate = true;

            this.renderer.render(this.scene, this.camera);

            // // 绘制场景
            this.renderer.state.reset();
            // // 请求重绘视图。
            externalRenderers.requestRender(view);
            // // cleanup
            context.resetWebGLState();
          }
        }

        axios.get('/road').then(res => {
          const geojson = res.data
          myRenderer.multiLineStrings = mapking.GeoJSON.toGeometry(geojson);
          externalRenderers.add(view, myRenderer);
        })
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
