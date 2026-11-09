<template>
  <div class="relative min-h-screen overflow-x-hidden bg-[#f5f8fc] dark:bg-[#050a12]">
    <!-- 页面底色光晕 -->
    <div class="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div
        class="absolute -left-40 -top-24 h-[520px] w-[520px] rounded-full bg-sky-200/35 blur-[130px] dark:bg-sky-900/20"
      ></div>
      <div
        class="absolute -right-40 top-[28%] h-[480px] w-[480px] rounded-full bg-indigo-200/25 blur-[140px] dark:bg-indigo-900/15"
      ></div>
      <div
        class="absolute bottom-0 left-1/3 h-[420px] w-[520px] rounded-full bg-teal-100/30 blur-[150px] dark:bg-teal-900/10"
      ></div>
    </div>

    <!-- 封面图会盖住页面顶部，默认导航在图片上使用白色文字，和首页一致 -->
    <TopNavigation />

    <main class="relative z-10">
      <TravelNoteCover :total="travelImages.length" />
      <TravelNoteContent :travel-images="travelImages" />
    </main>

    <div class="relative z-10">
      <SiteFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { TravelImage } from '@/types/travel'
import TravelNoteCover from '@/components/business/travelNote/TravelNoteCover.vue'

const travelImages = reactive<TravelImage[]>([
  {
    img_id: '1',
    img_url: 'https://picsum.photos/seed/songshan-01/960/720',
    img_introduction: '清晨的嵩山，云雾还没散开，山谷里安静得只剩风声。',
    img_tags: ['嵩山', '山野'],
    img_time: '2025-06-06',
  },
  {
    img_id: '2',
    img_url: 'https://picsum.photos/seed/seaside-02/960/720',
    img_introduction: '海边落日，把整片海面染成了温柔的橘色。',
    img_tags: ['海边', '日落'],
    img_time: '2025-05-18',
  },
  {
    img_id: '3',
    img_url: 'https://picsum.photos/seed/citynight-03/720/960',
    img_introduction: '城市夜色，灯火像一条缓慢流动的星河。',
    img_tags: ['城市', '夜景'],
    img_time: '2025-04-27',
  },
  {
    img_id: '4',
    img_url: 'https://picsum.photos/seed/ancienttown-04/960/720',
    img_introduction: '雨后的古镇，青石板路泛着光，脚步也慢了下来。',
    img_tags: ['古镇'],
    img_time: '2025-03-15',
  },
  {
    img_id: '5',
    img_url: 'https://picsum.photos/seed/pineforest-05/720/900',
    img_introduction: '山路上偶遇的一片松林，阳光从枝叶间漏下来。',
    img_tags: ['山野'],
    img_time: '2025-02-09',
  },
  {
    img_id: '6',
    img_url: 'https://picsum.photos/seed/firstsnow-06/960/720',
    img_introduction: '初雪落在屋顶和松枝上，世界忽然变得很轻。',
    img_tags: ['雪景', '山野'],
    img_time: '2025-01-21',
  },
  {
    img_id: '7',
    img_url: 'https://picsum.photos/seed/lake-07/960/540',
    img_introduction: '湖面安静得像一面镜子，把远山和云都收了进去。',
    img_tags: ['湖泊', '日落'],
    img_time: '2024-12-30',
  },
  {
    img_id: '8',
    img_url: 'https://picsum.photos/seed/grassland-08/960/720',
    img_introduction: '风吹过草原，云影一路奔跑，像没有尽头。',
    img_tags: ['草原'],
    img_time: '2024-10-05',
  },
  {
    img_id: '9',
    img_url: 'https://picsum.photos/seed/oldstreet-09/960/960',
    img_introduction: '老街拐角，藏着一家旧书店，门口趴着一只橘猫。',
    img_tags: ['城市', '街拍', '古镇'],
    img_time: '2024-09-14',
  },
  {
    img_id: '10',
    img_url: 'https://picsum.photos/seed/wave-10/720/960',
    img_introduction: '浪一层层涌上来，又慢慢退回去，留下细碎的白沫。',
    img_tags: ['海边'],
    img_time: '2024-08-23',
  },
  {
    img_id: '11',
    img_url: 'https://picsum.photos/seed/lantern-11/960/720',
    img_introduction: '灯笼亮起时，古镇换了一副模样。',
    img_tags: ['古镇', '夜景'],
    img_time: '2024-07-11',
  },
  {
    img_id: '12',
    img_url: 'https://picsum.photos/seed/mountainpass-12/960/600',
    img_introduction: '翻过垭口，眼前突然开阔，远处的雪线若隐若现。',
    img_tags: ['山野'],
    img_time: '2024-06-02',
  },
  {
    img_id: '13',
    img_url: 'https://picsum.photos/seed/starrynight-13/960/720',
    img_introduction: '凌晨的星空，比想象中更亮，连呼吸都变得小心翼翼。',
    img_tags: ['星空'],
    img_time: '2024-05-19',
  },
  {
    img_id: '14',
    img_url: 'https://picsum.photos/seed/springlake-14/960/720',
    img_introduction: '春天的湖边，柳枝刚刚发芽，风里带着潮湿的青草味。',
    img_tags: ['湖泊'],
    img_time: '2024-04-06',
  },
  {
    img_id: '15',
    img_url: 'https://picsum.photos/seed/commute-15/720/960',
    img_introduction: '地铁口的晚高峰，人群匆匆，每个人都有自己的方向。',
    img_tags: ['城市', '街拍'],
    img_time: '2024-03-17',
  },
  {
    img_id: '16',
    img_url: 'https://picsum.photos/seed/snowmorning-16/960/720',
    img_introduction: '雪后的清晨，世界安静了一整拍，连鸟鸣都显得清脆。',
    img_tags: ['雪景'],
    img_time: '2024-02-02',
  },
  {
    img_id: '17',
    img_url: 'https://picsum.photos/seed/wintersea-17/960/540',
    img_introduction: '冬天的海，风很大，天很蓝，海岸线一直延伸到很远。',
    img_tags: ['海边', '日落'],
    img_time: '2024-01-13',
  },
  {
    img_id: '18',
    img_url: 'https://picsum.photos/seed/autumngrass-18/960/720',
    img_introduction: '秋天最后的草原，颜色温柔，风一吹就像金色的海。',
    img_tags: ['草原'],
    img_time: '2023-11-25',
  },
  {
    img_id: '19',
    img_url: 'https://picsum.photos/seed/alleycat-19/720/900',
    img_introduction: '小巷深处，一只猫在晒太阳，路过的人都不忍心打扰。',
    img_tags: ['古镇', '街拍'],
    img_time: '2023-10-08',
  },
  {
    img_id: '20',
    img_url: 'https://picsum.photos/seed/cloudridge-20/960/720',
    img_introduction: '雨后的山脊，云在脚下慢慢走，像一场无声的潮汐。',
    img_tags: ['山野'],
    img_time: '2023-09-16',
  },
  {
    img_id: '21',
    img_url: 'https://picsum.photos/seed/rooftop-21/720/960',
    img_introduction: '天台上看城市，风把一天的烦恼都吹散了。',
    img_tags: ['夜景', '城市'],
    img_time: '2023-08-04',
  },
  {
    img_id: '22',
    img_url: 'https://picsum.photos/seed/goldenlake-22/960/600',
    img_introduction: '傍晚的湖，船桨划开一圈金色，涟漪慢慢荡向岸边。',
    img_tags: ['湖泊', '日落'],
    img_time: '2023-07-22',
  },
  {
    img_id: '23',
    img_url: 'https://picsum.photos/seed/milkyway-23/960/720',
    img_introduction: '露营的夜里，银河刚好升起来，帐篷外安静得只剩虫鸣。',
    img_tags: ['星空'],
    img_time: '2023-06-10',
  },
])
</script>
