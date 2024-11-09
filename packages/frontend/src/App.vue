<script setup lang="ts">
import { RenderSchedule } from '@itwin/core-common'
import { ScreenViewport } from '@itwin/core-frontend'
import { DisplayApp } from './DisplayApp.ts'
import { onMounted, ref } from 'vue'
import { ElSlider } from 'element-plus'

let vp: ScreenViewport
onMounted(async () => {
  await DisplayApp.initialize()
  const iModel = await DisplayApp.openLocalIModel('D:/xxx/rvt-4c.bim')
  vp = await DisplayApp.openView(iModel, 'modelContainer')
  await DisplayApp.setViewFlags(vp)
  
})

const insertVisibilityScript = () => {
  const scriptBuilder = new RenderSchedule.ScriptBuilder()
  const modelBuilder = scriptBuilder.addModelTimeline('0x2000000000f')
  const elementBuilder = modelBuilder.addElementTimeline([ '0x20000000141' ])
  
  const startTime = Date.parse('2022/06/26') / 1000
  const endTime = Date.parse('2022/06/28') / 1000
  
  elementBuilder.addVisibility(startTime, 0)
  elementBuilder.addVisibility(endTime, 15)
  
  const scriptProps = scriptBuilder.finish()
  
  vp.view.displayStyle.scheduleScript = RenderSchedule.Script.fromJSON(scriptProps)
}

const sliderVal = ref(0)
const onPercentChange = (per: number) => {
  const startTime = Date.parse('2022/06/26') / 1000
  const endTime = Date.parse('2022/06/27') / 1000
  vp.timePoint = (startTime + (endTime - startTime) * per)
}
</script>

<template>
  <div id="modelContainer" />
  <!-- /#modelContainer -->
  
  <div class="tool-bar">
    <div class="btn" @click="insertVisibilityScript">InsertVisibilityScript</div>
    <div class="btn" style="width: 240px;">
      <el-slider
        v-model="sliderVal"
        :format-tooltip="(val: number)=> Math.round(val*100)"
        :max="1"
        :min="0"
        :step="0.01"
        @input="onPercentChange"
      />
    </div>
  </div>
</template>

<style scoped>
#modelContainer {
  width: 100%;
  height: 100%;
}

.tool-bar {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  justify-content: flex-start;
  width: 100%;
  pointer-events: none;
  background-color: transparent;
  gap: 6px;
  
  .btn {
    font-size: 12px;
    padding: 6px 16px;
    cursor: pointer;
    pointer-events: auto;
    color: #1A1A1A;
    border-radius: 4px;
    background-color: aliceblue;
  }
}
</style>
