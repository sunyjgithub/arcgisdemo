import './public-path';
import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router";
import '../mock/mockApi'
import './index.css'


const test5555 = function (){
    alert('你好，再见！')
}



function render() {
    createApp(App).use(router).mount('#app')
}

// 新增：独立运行时，直接挂载应用
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
    render();
}

/**
 * 新增：
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
    console.log("VueMicroApp bootstraped");
}

/**
 * 新增：
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount() {
    console.log("VueMicroApp mount");
    render();
}

/**
 * 新增：
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
    console.log("VueMicroApp unmount");
}

//Uncaught Error: application 'subapp' died in status LOADING_SOURCE_CODE: [qiankun]: You need to export lifecycle functions in subapp entry
