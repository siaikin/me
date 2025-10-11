<script setup lang="ts">
import { onMounted, ref } from "vue";

const loading = ref(false);

function refresh() {
  loading.value = true;
  setTimeout(() => loading.value = false, 2000);
}

onMounted(() => {
  document.getElementById("gueleton-reload")?.addEventListener("click", (e) => {
    e.preventDefault();
    refresh();
  });
});
</script>

<template>
  <div class="relative">
    <Gueleton
      data-key="GueletonSample"
      :data="{a:1}"
      :loading="loading"
      :fuzzy="2"
      type="inPlace"
      :bone="{ className: '!bg-primary' }"
      :container="{
        style: { backgroundColor: '' },
        leave: { className: 'opacity-0 transition-opacity duration-300', }
      }"
    > 
      <slot />
    </Gueleton>
  </div>
</template>