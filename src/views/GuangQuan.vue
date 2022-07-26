<template>
  <div id="sceneviewx"></div>
  <router-view></router-view>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {loadModules} from 'esri-loader';
import * as THREE from "@/libs/three.module";

export default defineComponent({
  name: 'GuangQuan',
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
        "esri/layers/support/Field"], option).then(([Map, MapView, SceneView, TileLayer, WebScene, esriConfig, SceneLayer, FeatureLayer, Circle, Graphic, Home, Legend, Basemap, externalRenderers, SpatialReference, SimpleRenderer, SimpleLineSymbol,GraphicsLayer,Field]) => {

        // 官网底图
        const map = new Map({
          basemap: "dark-gray"
        });

        // 三维建筑图层
        const buildingLayer = new SceneLayer({
          id: "building",
          popupEnabled: false,
          url: "https://tiles.arcgis.com/tiles/U26uBjSD32d7xvm2/arcgis/rest/services/building_demo2/SceneServer"
        });

        map.add(buildingLayer);


        // 1. IconSymbol3DLayers must be added to the symbolLayers property of either the PointSymbol3D or PolygonSymbol3D symbols.
        let pointSymbol3D = {
          type: "point-3d",  // autocasts as n7ew PointSymbol3D()
          symbolLayers: [
            {
              type: "icon", // autocasts as new IconSymbol3DLayer()
              resource: {
                href: "/static/处理.png"
              },
              size: '50px', // The size of the icon in points.
              // material: { color: "red" }
            }
          ],
          // verticalOffset: {
          //   screenLength: 30,
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
              Naem:"美术博物馆",
            },
          }
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
            expression: "$feature.Naem"
          }
        };

        // define each field's schema
        const fields = [
          new Field({
            name: "ObjectID",
            alias: "ObjectID",
            type: "oid"
          }), new Field({
            name: "Naem",
            alias: "Naem",
            type: "string"
          })
        ];

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


        const view = new SceneView({
          map: map,
          container: "sceneviewx",
          viewingMode :"local",
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

        const WaveMeshArr:any[] = [];


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
            this.camera = new THREE.PerspectiveCamera();//相机
            //添加坐标轴辅助工具
            const axesHelper = new THREE.AxesHelper(10000000);
            this.scene.add(axesHelper);



            var textureLoader = new (THREE.TextureLoader as any)();
            //设置纹理贴图
            this.map = textureLoader.load('/static/guangquan3.png');
            this.map.wrapS = THREE.RepeatWrapping;
            this.map.wrapT = THREE.RepeatWrapping;
            this.map.repeat.set(1, 1)
            this.map.needsUpdate = true


            let material2 = new THREE.MeshBasicMaterial( {
              map: this.map,
              transparent: true, //使用背景透明的png贴图，注意开启透明计算
              side: THREE.DoubleSide, //双面可见
              depthWrite: false, //禁止写入深度缓冲区数据
              opacity:0.8,
            } );

            let planGeometry = new THREE.PlaneGeometry(50,50);
            let mesh:any = new THREE.Mesh( planGeometry, material2 );
            let size1 = 100 * 0.04;//矩形平面Mesh的尺寸
            mesh.size = size1;
            mesh.scale.set( size1, size1, size1 );//设置mesh大小
            let renderPos = [0, 0, 0];
            externalRenderers.toRenderCoordinates(view, [116.587245, 35.415393, 0.1], 0, SpatialReference.WGS84, renderPos, 0, 1);
            //设置mesh位置
            mesh.position.set(renderPos[0], renderPos[1], renderPos[2]);
            //mesh.rotation.x -= 0.5 * Math.PI;
            mesh._s = Math.random() * 1.0 + 1.0; //自定义属性._s表示mesh在原始大小基础上放大倍数  光圈在原来mesh.size基础上1~2倍之间变化
            this.scene.add(mesh);
            WaveMeshArr.push(mesh)
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
            this.renderer.render(this.scene, this.camera);

            // 所有波动光圈都有自己的透明度和大小状态
            // 一个波动光圈透明度变化过程是：0~1~0反复循环
            WaveMeshArr.forEach(function (mesh: any) {
              mesh._s += 0.007;
              mesh.scale.set(
                  mesh.size * mesh._s,
                  mesh.size * mesh._s,
                  mesh.size * mesh._s
              );
              if (mesh._s <= 1.5) {
                mesh.material.opacity = (mesh._s - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
              } else if (mesh._s > 1.5 && mesh._s <= 2) {
                mesh.material.opacity = 1 - (mesh._s - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
              } else {
                mesh._s = 1.0;
              }
            });
            // // 绘制场景
            this.renderer.state.reset();
            // // 请求重绘视图。
            externalRenderers.requestRender(view);
            // // cleanup
            context.resetWebGLState();
          }
        }

        externalRenderers.add(view, myRenderer);

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
