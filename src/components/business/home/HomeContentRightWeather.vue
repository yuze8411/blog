<template>
  <div class="relative h-[300px] border-[1px] border-gray-300 rounded-[10px] mt-3"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
let isAllow = ref()
// 获取经纬度信息
function getPostion() {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      isAllow.value = true
      const coords = pos.coords
      let lat = coords.latitude
      let lon = coords.longitude
      const res = await axios.get('/api/weather', {
        params: { lat, lon },
      })
      console.log(res.data)
    },
    (err) => {
      isAllow.value = false
      console.log(err.code, err.message)
    },
    {
      enableHighAccuracy: false, // 开启高精度（耗电、慢，GPS优先）
      timeout: 10000, // 超时时间 10s
      maximumAge: 0, // 不使用缓存的旧定位
    },
  )
}
onMounted(() => {
  getPostion()
})
</script>
<style scoped></style>
