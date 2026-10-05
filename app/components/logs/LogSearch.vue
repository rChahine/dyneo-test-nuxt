<script setup lang="ts">
const model = defineModel<string>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      for="log-search"
      class="text-xs uppercase tracking-widest text-muted"
    >Recherche</label>
    <input
      id="log-search"
      v-model="model"
      type="search"
      placeholder="texte, service, identifiant de requête…"
      class="min-h-11 w-full rounded-lg border border-edge bg-raised px-3.5 font-mono text-sm text-ink"
    >
  </div>
</template>
