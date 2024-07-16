<template>
  <InputGroup
    row-at="all"
    class="justify-end"
  >
    <Button
      :button-text="$tc('button.cancel')"
      color="transparent"
      @click="closeModal"
    />
    <Button
      :button-text="$tc('button.apply')"
      :disabled="applyButtonDisabled"
      color="green"
      @click="setDateItem"
    />
  </InputGroup>
</template>

<script setup lang="ts">
import Button from '@/components/buttons/Button.vue';
import InputGroup from '@/components/form/InputGroup.vue';

defineProps<{
  applyButtonDisabled: boolean;
  closeModal: () => void;
  setDateItem: () => void;
}>();
</script>
