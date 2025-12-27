<script setup lang="ts">
import { ref, computed, provide } from "vue";
import TitleBar from "./TitleBar.vue";
import Sidebar from "./Sidebar.vue";
import Outline from "./Outline.vue";
import StatusBar from "./StatusBar.vue";
import MilkdownEditor from "../editor/MilkdownEditor.vue";
import EmptyState from "../editor/EmptyState.vue";
import { useTabsStore } from "@/stores/tabs";

const tabsStore = useTabsStore();

const sidebarVisible = ref(true);
const sidebarWidth = ref(250);
const outlineVisible = ref(true);
const outlineWidth = ref(200);

const hasOpenTabs = computed(() => tabsStore.tabs.length > 0);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

const toggleOutline = () => {
  outlineVisible.value = !outlineVisible.value;
};

// Provide outline state to TitleBar
provide("outlineVisible", outlineVisible);
provide("toggleOutline", toggleOutline);
</script>

<template>
  <div class="main-layout">
    <TitleBar @toggle-sidebar="toggleSidebar" />

    <div class="content-area">
      <Sidebar v-show="sidebarVisible" :width="sidebarWidth" />

      <main class="editor-area">
        <MilkdownEditor v-if="hasOpenTabs" />
        <EmptyState v-else />
      </main>

      <Outline
        v-if="hasOpenTabs && outlineVisible"
        v-model:width="outlineWidth"
      />
    </div>

    <StatusBar v-if="hasOpenTabs" />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.content-area {
  display: flex;
  flex: 1;
  overflow: hidden;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  /* Ensure no gaps between flex children */
  gap: 0;
}

.editor-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: none !important;
  border-right: none !important;
  box-shadow: none !important;
  outline: none !important;
}
</style>
