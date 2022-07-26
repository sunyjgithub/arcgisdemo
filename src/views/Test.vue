<template>
  <h1>Test中的内容</h1>
  <div id="xxxxxx"></div>
</template>
<script lang="ts">
/* eslint-disable */
/* eslint-disable no-debugger */
import {loadModules} from "esri-loader";
import {defineComponent} from "vue";
import axios from 'axios'

import * as THREE from '../libs/three.module.js';
//import * as THREE from 'three';
//import * as THREE from '../libs/threejs/three.module.r119.js';
//import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';
//import * as mapking from 'maptalks';

//const THREE = require('three');

// MeshLine extends THREE.BufferGeometry
const MeshLine = require('three.meshline').MeshLine;

//MeshLineMaterial extends THREE.ShaderMaterial
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;

const mapking = require('maptalks');


export default defineComponent({
  setup(){
    function _createSceneView() {
      let option ={
        url: 'https://js.arcgis.com/4.24/',
        css: 'https://js.arcgis.com/4.24/esri/themes/light/main.css'
      }
      loadModules(["esri/Map",
        'esri/views/SceneView',
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
        "esri/renderers/support/ClassBreakInfo",
        'esri/geometry/Polyline',
        'esri/views/3d/externalRenderers',
        'esri/geometry/support/webMercatorUtils',
        "esri/geometry/SpatialReference"],option).then(([Map,SceneView,MapView,TileLayer,WebScene,esriConfig,SceneLayer,FeatureLayer,Circle,Graphic,Home,Legend,Basemap,ClassBreaksRenderer,SimpleLineSymbol,ClassBreakInfo,Polyline,externalRenderers,webMercatorUtils,SpatialReference]) =>{


        let path: any[]=[
          [115.80895340787583, 30.92933111293343],
          [115.81947621477968,30.936026430486265],
          [115.85073577332635,30.952730603143078],
          [115.86830705038578,30.964969701156637],
          [115.87796494895557,30.970050440481813],
          [115.88263291871093,30.97587476869184],
          [115.88153549018487,30.97619308639916],
          [115.88860467181571,30.985581605596618],
          [115.89039457558401,30.99614115304192],
          [115.89037581420371,30.99986573852132],
          [115.88982453627196,31.003621647335926],
          [115.88822886767906,30.999078415194415],
          [115.88681216877917,30.997464365151867],
          [115.88286139825868,30.99686255666582],
          [115.87841763117079,30.999826971071514],
          [115.86308179931808,30.99584156461405],
          [115.85510630972263,30.993171784031908],
          [115.86174910808289,30.993473404196706],
          [115.86231959908358,30.99068362090549]

        ]



        const map = new Map({
          basemap: "osm",
        });

        const view = new SceneView({
          container: 'xxxxxx',
          map: map,
          camera: {
            position: [116.587245, 35.415393, 3000],
            tilt: 0,
            heading: 0
          }
        });

        const myRenderer = {
          view:view,
          renderer:null as any, // three js 渲染器
          camera:null as any,    //three js 相机
          scene:null as any, //three js 场景
          height:100,
          offest:0,
          map:null as any,
          multiLineStrings:null as any,
          material:null as any,
          setup:function (context: any){
            this.renderer= new THREE.WebGLRenderer({
              context:context.gl,
              premultipliedAlpha:false,   //renderer 是否假设颜色有 premaultiplied alpha 默认为true
            });
            this.renderer.setPixelRatio(window.devicePixelRatio); //设置设备像素比。通常用于避免HiDPI设备上绘图模糊
            this.renderer.setViewport(0,0,view.width,view.height);//视图大小设置
            //防止three.js 清除Arcgis JS API 提供的缓冲区
            this.renderer.autoClearDepth = false; // 定义renderer是否清除深度缓存
            this.renderer.autoClearStencil = false; // 定义renderer是否清除模板缓存
            this.renderer.autoClearColor = false; // 定义renderer是否清除颜色缓存
            // ArcGIS JS API渲染自定义离屏缓冲区，而不是默认的帧缓冲区。
            // 我们必须将这段代码注入到three.js运行时中，以便绑定这些缓冲区而不是默认的缓冲区。
            const originalSetRenderTarget = this.renderer.setRenderTarget.bind(
                this.renderer
            );
            this.renderer.setRenderTarget = function (target:any) {
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
            this.map = textureLoader.load('http://localhost:8081/static/line.png');
            this.map.wrapS = THREE.RepeatWrapping;
            this.map.wrapT = THREE.RepeatWrapping;
            this.map.repeat.set( 20,4);


            this.material = new MeshLineMaterial({
              color:0x85A9A9,
              transparent: true,
              opacity:1,
              useMap: 1,
              map: this.map,
            });

            // let material = new THREE.MeshBasicMaterial({
            //   color: 0x85A9A9,
            //   side:200,
            //   map:this.map,
            //   transparent: true,
            //   depthWrite: false,
            //   opacity: 1,
            // });
            debugger;
            console.log(this.multiLineStrings)

            this.multiLineStrings.forEach((lineString: any)=>{
              const positions:any[] = [];
              const coordinates = lineString.getCoordinates();
              coordinates.forEach((coordinate: any)=>{
                 console.log(coordinate)
                 if (coordinate.x && coordinate.y){
                   var renderPos = [0, 0, 0];
                   externalRenderers.toRenderCoordinates(view, [coordinate.x, coordinate.y, 0], 0, SpatialReference.WGS84, renderPos, 0, 1);
                   // let transform = new THREE.Matrix4();
                   // let transformation = new Array(16);
                   // transform.fromArray(
                   //     externalRenderers.renderCoordinateTransformAt(
                   //         view,
                   //         [coordinate.x, coordinate.y, 0],
                   //         SpatialReference.WebMercator,
                   //         transformation
                   //     )
                   // );
                   // let vector3 = new THREE.Vector3(
                   //     transform.elements[12],
                   //     transform.elements[13],
                   //     transform.elements[14]
                   // );
                   // positions.push(vector3)
                   //positions.push(new THREE.Vector3(renderPos[0], renderPos[1], renderPos[2]));
                   positions.push(renderPos[0]);
                   positions.push(renderPos[1]);
                   positions.push(renderPos[2]);
                 }
              })
              if (positions.length>0) {
                // let curve = new THREE.CatmullRomCurve3(positions, false);
                // let tubeGeometry = new THREE.TubeGeometry(curve, 20, 5);
                // let tube1 = new THREE.Mesh(tubeGeometry, material);
                // this.scene.add(tube1);

                const geometry: any = new THREE.BufferGeometry()
                geometry.attributes.position = new THREE.BufferAttribute(positions, 3);
                const line = new MeshLine();
                line.setGeometry(geometry);
                const mesh = new THREE.Mesh(line, this.material);
                this.scene.add(mesh);
                context.resetWebGLState();
              }
            })

            //创建几何体
            // let v3List: any[]=[];
            // path.forEach((item)=>{
            //   var renderPos = [0, 0, 0];
            //   externalRenderers.toRenderCoordinates(this.view, [item[0], item[1], 500], 0, SpatialReference.WGS84, renderPos, 0, 1);
            //   v3List.push(new THREE.Vector3(renderPos[0], renderPos[1], renderPos[2]));
            // })
            //let curve = new THREE.CatmullRomCurve3(v3List, false);
            /**
             * path 管道的形状 曲线
             * tubularsSegements    管道分成多少段
             * radius   管道的半径
             * radialSegments   管道口是几边形 分为多少段
             * closed 收尾是否相连 封闭
             * @type {TubeGeometry}
             */

          },
          render: function (context: any) {
            // 更新相机参数
            const cam = context.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(
                new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
            );
            // 投影矩阵可以直接复制
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            // // 更新几何体
            // this.map.offset.x += 0.02;
            this.map.needsUpdate = true;
            this.material.uniforms.dashOffset.value += 0.02
            // 绘制场景
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            // 请求重绘视图。
            externalRenderers.requestRender(view);
            // cleanup
            context.resetWebGLState();
          }
        }



        axios.get('/road').then(res => {
          const geojson = res.data
          myRenderer.multiLineStrings = mapking.GeoJSON.toGeometry(geojson);
          externalRenderers.add(view, myRenderer);
        })

      })


    }

    _createSceneView();
  }
});

</script>

<style scoped>
#xxxxxx {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
</style>
