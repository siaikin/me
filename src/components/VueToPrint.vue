<script setup lang="ts">
import { useVueToPrint } from "vue-to-print";

const { handlePrint } = useVueToPrint({
  content: () => document.body,
  documentTitle: "siaikin's 简历",
});
</script>

<template>
  <button @click="handlePrint">
    <slot />
  </button>
</template>