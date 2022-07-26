import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// Cannot find module '@/views/Home' or its corresponding type declarations
const routes: RouteRecordRaw[] = [
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      children: [
          {
              path: 'message',
              name: 'message',
              component: () => import('@/views/Message.vue'),
          }
      ]
    },
    {
        path: '/test',
        name: 'test',
        component: () => import('@/views/Test.vue'),
    },
    {
        path: '/test2',
        name: 'test2',
        component: () => import('@/views/Test2.vue'),
    },
    {
        path: '/test3',
        name: 'test23',
        component: () => import('@/views/Test3.vue'),
    },
    {
        path: '/test4',
        name: 'test4',
        component: () => import('@/views/Label3D.vue'),
    },

    {
        path: '/test5',
        name: 'test5',
        component: () => import('@/views/GuangQuan.vue'),
    },
    {
        path: '/test6',
        name: 'test6',
        component: () => import('@/views/Test2DBuilding.vue'),
    },

    {
        path: '/test7',
        name: 'test7',
        component: () => import('@/views/PictureMarkerSymbol.vue'),
    },
    {
        path: '/basemap',
        name: 'basemap',
        component: () => import('@/views/BaseMapLoad.vue'),
    },
    {
        path: '/under',
        name: 'under',
        component: () => import('@/views/TestUnderGround.vue'),
    },
    { path: '/about', name: 'about', component: () => import('@/views/About.vue') },
];
const router = createRouter({
    history: createWebHistory(
        window.__POWERED_BY_QIANKUN__? '/subapp':''
    ),
    routes
})
export default  router;
