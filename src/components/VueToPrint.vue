<script setup lang="ts">
import { useVueToPrint } from "vue-to-print";

const { handlePrint } = useVueToPrint({
  content: () => document.body,
  documentTitle: "奥森文件名称",
});
</script>

<template>
  <button @click="handlePrint">
    <slot />
  </button>
</template>