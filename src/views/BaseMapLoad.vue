<template>
  <div id="sceneviewtt"></div>
  <router-view></router-view>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {loadModules} from 'esri-loader';
import * as THREE from "@/libs/three.module";
import axios from "axios";
import * as echarts from 'echarts'

const mapking = require('maptalks');
const MeshLine = require('three.meshline').MeshLine;

//MeshLineMaterial extends THREE.ShaderMaterial
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;


export default defineComponent({
  name: 'BaseMapLoad',
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
        "esri/widgets/Daylight",
        "esri/layers/MapImageLayer",
        "esri/renderers/ClassBreaksRenderer",
        "esri/renderers/support/ClassBreakInfo",
        "esri/Color",
        "esri/core/promiseUtils",
        "esri/geometry/geometryEngine",
        "esri/symbols/MeshSymbol3D",
        "esri/symbols/FillSymbol3DLayer",
        "esri/geometry/Mesh",
        "esri/geometry/support/MeshMaterialMetallicRoughness",
        "esri/geometry/support/MeshComponent",
        "esri/geometry/Polygon",
        "esri/PopupTemplate"], option).then(([Map, MapView, SceneView, TileLayer, WebScene, esriConfig, SceneLayer, FeatureLayer, Circle, Graphic, Home, Legend, Basemap, externalRenderers, SpatialReference, SimpleRenderer, SimpleLineSymbol,GraphicsLayer,Field,Daylight,MapImageLayer,
                                                                        ClassBreaksRenderer,
                                              ClassBreakInfo,
                                              Color,
                                              promiseUtils,
                                              geometryEngine,
                                              MeshSymbol3D,
                                              FillSymbol3DLayer,Mesh,MeshMaterialMetallicRoughness,MeshComponent,Polygon,
                                                     PopupTemplate]) => {



        let baseLayer = new MapImageLayer({
          url: "http://10.10.30.156:6080/arcgis/rest/services/basemap_v2/MapServer",
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
        // 隐藏底图中的建筑/水系
        const subBuilding = baseLayer.findSublayerById(8);
        subBuilding.visible = false;
        const subWater = baseLayer.findSublayerById(9);
        subWater.visible = false;

        const baseMap = new Basemap({
          baseLayers: [baseLayer],
        });


        const walls = new GraphicsLayer({
          elevationInfo: {
            mode: "absolute-height"
          }
        });

        const map = new Map({
          basemap: baseMap,
          layers: [walls]
        });

        map.ground.opacity = 0.2;



        // 规定         20 - 30 暗色     大于30 红色   小于20 绿色
        // 加载建筑图层  并进行拉伸
        let symbolGreen = {
          type: "polygon-3d", // autocasts as new PolygonSymbol3D()
          symbolLayers: [{
            // size: 30,  // 100,000 meters in height
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
              color: [35, 99, 83]
            },
            castShadows: true // Indicates whether the symbol layer geometry casts shadows in the scene.
          }]
        };


        let symbolDark = {
          type: "polygon-3d", // autocasts as new PolygonSymbol3D()
          symbolLayers: [{
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
              color: [37, 56, 99]
            },
            castShadows: true // Indicates whether the symbol layer geometry casts shadows in the scene.
          }]
        };

        let symbolRed = {
          type: "polygon-3d", // autocasts as new PolygonSymbol3D()
          symbolLayers: [{
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
              color: [138, 31, 0]
            },
            castShadows: true // Indicates whether the symbol layer geometry casts shadows in the scene.
          }]
        };





        // 也可以用stops 色带实现

        // const renderer = {
        //   type: "simple", // autocasts as new SimpleRenderer()
        //   symbol: symbol,
        //   // define size visual variable based on height values in a field
        //   visualVariables: [
        //     {
        //       type: "size",
        //       field: "floor"
        //     }
        //   ]
        // };


        let classBreaksRenderer = new ClassBreaksRenderer({
          field: "temprature",
          visualVariables: [
            {
              type: "size",
              field: "floor"
            }
          ],
          classBreakInfos: [
            new ClassBreakInfo(
                {
                  minValue: 0,  // 0 acres
                  maxValue: 19,  // 200,000 acres
                  symbol: symbolGreen,  // will be assigned sym1
                  label: "<20"
                }
            )
            ,
            new ClassBreakInfo(
                {
                  minValue: 20,  // 200,001 acres
                  maxValue: 30,  // 500,000 acres
                  symbol: symbolDark,  // will be assigned sym2
                  label: "20-30"
                }),
            new ClassBreakInfo(
                {
                  minValue: 31,  // 500,001 acres
                  maxValue: 10000,  // 750,000 acres
                  symbol: symbolRed,  // will be assigned sym2
                  label: ">30"
                })
          ]
        });

        let buildingLayer = new FeatureLayer({
          url:'http://10.10.30.156:6080/arcgis/rest/services/building_v3/MapServer/0',
          renderer: classBreaksRenderer,
          outFields: ["*"],
          opacity: 0.3
        });
        // the layer will be refreshed every 6 seconds.
        buildingLayer.refreshInterval = 0.1;
        map.add(buildingLayer);



        const template = {
          // NAME and COUNTY are fields in the service containing the Census Tract (NAME) and county of the feature
          title: "{NAME}/{floor}米/{temprature}摄氏度",
          content:[
            {
              type: "fields",
              fieldInfos:[
                {
                  fieldName: "floor", // The field whose values you want to format
                  label: "标签"
                },
              ]
            }
          ]
        };
        buildingLayer.popupTemplate = template;








        const view = new SceneView({
          map: map,
          container: "sceneviewtt",
          //viewingMode :"local",
          camera: {
            position: [116.587245, 35.415393, 3000],
            // tilt=0:镜头与垂线夹角0 说明镜头正对准地面
            tilt: 0,
            heading: 0
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



        const wallColor = new Color("#00fffb");



        async function createBoundingBox(building: any, extent: any) {
          const objectId = building.getObjectId();

          const query = buildingLayer.createQuery();
          query.objectIds = [objectId];
          query.outFields = ["*"];
          query.multipatchOption = "xyFootprint";
          query.returnGeometry = true;

          const result = await buildingLayer.queryFeatures(query);
          if (result.features.length === 0) {
            return;
          }

          const footprint = result.features[0];

          debugger;
          // 凸包(Convex Hull)是计算几何中的一个经典常用的算法。它解决的问题在于给定空间一堆离散的点，计算包含所有点的凸多边形。
          const hull = geometryEngine.convexHull(footprint.geometry, true);
          const wall = geometryEngine.geodesicBuffer(hull, 10);

          //
          const size = (extent.zmax - extent.zmin) * 0.9;

          // const mesh = createMesh(wall, extent.zmin, size);
          const mesh = createMesh(wall, 10);
          walls.removeAll();

          const fill = new FillSymbol3DLayer({
            material: {
              color: wallColor,
              colorMixMode: "tint"
            },
            castShadows: false
          });

          walls.add(
              new Graphic({
                geometry: mesh,
                symbol: new MeshSymbol3D({
                  symbolLayers: [fill]
                })
              })
          );
        }


        function createMesh(polygon:any, zmin:any, height = 100) {
          //A polygon contains an array of rings and a spatialReference.
          // Each ring is represented as an array of points.
          // The first and last points of a ring must be the same.
          // A polygon also has boolean-valued hasM and hasZ fields.
          const ring = polygon.rings[0];
          // 三角形
          const triangles = [];
          const vertices = [];
          const colors = [];

          for (let i = 0; i < ring.length; i++) {
            const vIdx0 = 2 * i;
            const vIdx1 = 2 * i + 1;

            const vIdx2 = (2 * i + 2) % (2 * ring.length);
            const vIdx3 = (2 * i + 3) % (2 * ring.length);

            // Add new wall vertex
            vertices.push(ring[i][0], ring[i][1], zmin);
            vertices.push(ring[i][0], ring[i][1], height);

            // Colors
            colors.push(255, 255, 255, 255);
            colors.push(255, 255, 255, 0);

            triangles.push(vIdx0, vIdx1, vIdx2, vIdx2, vIdx1, vIdx3);
          }

          const wall = new MeshComponent({
            faces: triangles,
            shading: "flat",
            material: new MeshMaterialMetallicRoughness({
              emissiveColor: wallColor,
              metallic: 0.5,
              roughness: 0.8,
              doubleSided: true
            })
          });

          return new Mesh({
            components: [wall],
            vertexAttributes: {
              position: vertices,
              color: colors
            },
            spatialReference: polygon.spatialReference
          });
        }

        function populationChange (feature: any){
          const div: HTMLElement = document.createElement("div");
          div.style.width = '600px';
          div.style.height = '400px';
          //div.setAttribute("height","50px");
          // div.classList.add("echarts")
          //基于准备好的dom，初始化echarts实例
          window.test1111= function (){
            alert('wocao')
          }
          div.innerHTML = `<div id="div1">
                                <h2 onclick="test1111()">111</h2>
                                <div id="div2"></div>
                           </div>
                           `;

          debugger
          // var myChart = echarts.init(div);
          // // 指定图表的配置项和数据
          // var option = {
          //   title: {
          //     text: 'ECharts 入门示例'
          //   },
          //   tooltip: {},
          //   legend: {
          //     data: ['销量']
          //   },
          //   xAxis: {
          //     data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
          //   },
          //   yAxis: {},
          //   series: [
          //     {
          //       name: '销量',
          //       type: 'bar',
          //       data: [5, 20, 36, 10, 10, 20]
          //     }
          //   ]
          // }
          // // 使用刚指定的配置项和数据显示图表。
          // myChart.setOption(option);

           return div;
        }




        view.when().then(async () => {
          // view.popup.autoOpenEnabled = false;
          const buildingsLV = await view.whenLayerView(buildingLayer);
          view.on(
              "click",
              promiseUtils.debounce(async (e: any) => {

                // Create lat/lon vars to display in popup title
                const lat = Math.round(e.mapPoint.latitude * 1000) / 1000;
                const lon = Math.round(e.mapPoint.longitude * 1000) / 1000;

                // view.popup.open({
                //   // Set the popup's title to the coordinates of the location
                //   title: "Map view coordinates: [" + lon + ", " + lat + "]",
                //   location: e.mapPoint, // Set the location of the popup to the clicked location
                //   content: populationChange
                // });




                // A list of layers and graphics to include for intersection testing.
                // All layers and graphics will be included if include is not specified.
                const ht = await view.hitTest(e, {
                  include: [buildingLayer]
                });

                walls.removeAll();

                for (const result of ht.results) {
                  debugger;
                  const graphic = result.graphic;
                  if (graphic && graphic.layer === buildingLayer) {
                    // 参数是Query对象
                    const extentResult = await buildingsLV.queryExtent({
                      objectIds: [graphic.getObjectId()],
                      returnGeometry: true
                    });

                    await createBoundingBox(graphic, extentResult.extent);
                    return;
                  }
                }
              })
          );
        });







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
          {
            geometry: {
              type: 'point',
              x: 116.58481651649127,
              y: 35.40850389131799,
              z: 0,
            },
            attributes: {
              ObjectID: 2,
              name: '热电厂B',
            },
          },
        ];

        // define each field's schema
        const fields = [
          new Field({
            name: "ObjectID",
            alias: "ObjectID",
            type: "oid"
          }),
          new Field({
            name: "name",
            alias: "name",
            type: "string"
          })
        ];

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
          // verticalOffset: {
          //   screenLength: 0,
          //   maxWorldLength: 100,
          //   minWorldLength: 20
          // },
          // // Callouts are drawn from the point feature location that is being symbolized, to the vertical offset of the symbol.
          // // This property has no effect if verticalOffset is not set
          // callout: {
          //   type: "line",  // autocasts as new LineCallout3D()
          //   size: 1.5,
          //   color: [150, 150, 150],
          //   border: {
          //     color: [50, 50, 50]
          //   }
          // }
        };
        let citiesRenderer = {
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: pointSymbol3D,
        };

        const template2 = new PopupTemplate({
          // NAME and COUNTY are fields in the service containing the Census Tract (NAME) and county of the feature
          title: "{NAME} in {ObjectID}",
          outFields: ["*"],
          content: populationChange
        });
        let layer = new FeatureLayer({
          source: points,  // autocast as a Collection of new Graphic()
          objectIdField: "ObjectID",
          outFields:['*'],
          renderer: citiesRenderer,
          labelingInfo: [labelClass],
          fields: fields,
          screenSizePerspectiveEnabled: true,
          popupTemplate:template2,
          elevationInfo: {
            // this elevation mode will place points on top of
            // buildings or other SceneLayer 3D objects
            mode: 'relative-to-scene',
          },
        });
        map.add(layer);


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
          url:'http://10.10.30.156:6080/arcgis/rest/services/WaterService/MapServer',
          renderer: waterRenderer,
          elevationInfo: {
            mode: "on-the-ground"
          },
        });
        map.add(water);



        // const myRenderer = {
        //   view:view,
        //   renderer:null as any, // three js 渲染器
        //   camera:null as any,    //three js 相机
        //   scene:null as any, //three js 场景
        //   height:100,
        //   offest:0,
        //   map:null as any,
        //   multiLineStrings:null as any,
        //   material:null as any,
        //   setup:function (context: any){
        //     this.renderer= new THREE.WebGLRenderer({
        //       context:context.gl,
        //       antialias: true,     //抗锯齿
        //       premultipliedAlpha:false,   //renderer 是否假设颜色有 premaultiplied alpha 默认为true
        //     });
        //     this.renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
        //     this.renderer.setViewport(0,0,view.width,view.height);//视图大小设置
        //     //防止three.js 清除Arcgis JS API 提供的缓冲区
        //     this.renderer.autoClearDepth = false; // 定义renderer是否清除深度缓存
        //     this.renderer.autoClearStencil = false; // 定义renderer是否清除模板缓存
        //     this.renderer.autoClearColor = false; // 定义renderer是否清除颜色缓存
        //     // ArcGIS JS API渲染自定义离屏缓冲区，而不是默认的帧缓冲区。
        //     // 我们必须将这段代码注入到three.js运行时中，以便绑定这些缓冲区而不是默认的缓冲区。
        //     const originalSetRenderTarget = this.renderer.setRenderTarget.bind(
        //         this.renderer
        //     );
        //     this.renderer.setRenderTarget = function (target:any) {
        //       originalSetRenderTarget(target);
        //       if (target == null) {
        //         // 绑定外部渲染器应该渲染到的颜色和深度缓冲区
        //         context.bindRenderTarget();
        //       }
        //     };
        //     this.scene = new THREE.Scene();//场景
        //     this.camera = new THREE.PerspectiveCamera( 180,  view.width/view.height,  0.01,  10000);//相机
        //     //添加坐标轴辅助工具
        //     const axesHelper = new THREE.AxesHelper(10000000);
        //     this.scene.add(axesHelper);
        //
        //
        //     var textureLoader = new (THREE.TextureLoader as any)();
        //     //设置纹理贴图
        //     this.map = textureLoader.load('/static/daoluliuguang.png');
        //     this.map.wrapS = THREE.RepeatWrapping;
        //     this.map.wrapT = THREE.RepeatWrapping;
        //     this.map.repeat.set(1, 1)
        //     this.map.needsUpdate = true
        //
        //     let meshMaterial = new THREE.MeshBasicMaterial({
        //       map: this.map,
        //       side: THREE.BackSide,
        //       transparent: true
        //     })
        //     // this.material = new MeshLineMaterial({
        //     //   transparent: true,
        //     //   side:THREE.DoubleSide,
        //     //   opacity:1,
        //     //   useMap: 1,
        //     //   map: this.map,
        //     //   dashRatio:1,
        //     //   dashArray: 0,  // 破折号之间的长度和间距。(0 -无破折号)
        //     //   dashOffset: 0,
        //     //   blending: THREE.AdditiveBlending,
        //     //   near: this.camera.near,
        //     //   far: this.camera.far,
        //     //   lineWidth:4,
        //     // });
        //
        //     this.multiLineStrings.slice(0,1000).forEach((lineString: any)=>{
        //       const positions:any[] = [];
        //       const coordinates = lineString.getCoordinates();
        //       coordinates.forEach((coordinate: any)=>{
        //         if (coordinate.x && coordinate.y){
        //           var renderPos = [0, 0, 0];
        //           externalRenderers.toRenderCoordinates(view, [coordinate.x, coordinate.y, 30], 0, SpatialReference.WGS84, renderPos, 0, 1);
        //           positions.push(new THREE.Vector3(renderPos[0], renderPos[1], renderPos[2]));
        //         }
        //       })
        //       if (positions.length>0) {
        //         let curvePath = new THREE.CatmullRomCurve3(positions);//SplineCurve
        //         var geometry = new THREE.TubeGeometry(curvePath, 64, 10, 20, false);
        //         const mesh = new THREE.Mesh(geometry, meshMaterial);
        //         this.scene.add(mesh);
        //         // let curve = new THREE.CatmullRomCurve3(positions, false);
        //         // let tubeGeometry = new THREE.TubeGeometry(curve, 20, 1);
        //         // let tube1 = new THREE.Mesh(tubeGeometry, material);
        //         // this.scene.add(tube1);
        //         // context.resetWebGLState();
        //       }
        //     })
        //   },
        //   render: function (context: any) {
        //     debugger;
        //     // 更新相机参数
        //     const cam = context.camera;
        //     this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
        //     this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
        //     this.camera.lookAt(
        //         new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
        //     );
        //     // 投影矩阵可以直接复制
        //     this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
        //     // // 更新几何体
        //     this.map.offset.x -= 0.01
        //
        //     this.renderer.render(this.scene, this.camera);
        //     // 绘制场景
        //     this.renderer.state.reset();
        //     // 请求重绘视图。
        //     externalRenderers.requestRender(view);
        //     // cleanup
        //     context.resetWebGLState();
        //   }
        // }
        //
        // axios.get('/road').then(res => {
        //   const geojson = res.data
        //   myRenderer.multiLineStrings = mapking.GeoJSON.toGeometry(geojson);
        //   externalRenderers.add(view, myRenderer);
        // })
      })


    },
  },
  mounted() {

    this._createSceneView();

  },
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

#sceneviewtt {
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

#div1 {
  background-color: aqua;
}
</style>
