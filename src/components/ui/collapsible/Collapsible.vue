<template>
  <CollapsiblePrimitive.Root v-bind="forwarded">
    <slot />
  </CollapsiblePrimitive.Root>
</template>

<script setup lang="ts">
import { CollapsibleRoot, useForwardProps } from 'radix-vue'

const CollapsiblePrimitive = {
  Root: CollapsibleRoot,
}

interface CollapsibleProps {
  defaultOpen?: boolean
  open?: boolean
  disabled?: boolean
}

const props = defineProps<CollapsibleProps>()

const emits = defineEmits<{
  'update:open': [value: boolean]
}>()

const forwarded = useForwardProps(props)
</script>