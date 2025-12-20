<template>
  <CollapsiblePrimitive.Trigger
    v-bind="forwarded"
    :class="cn(props.class)"
  >
    <slot />
  </CollapsiblePrimitive.Trigger>
</template>

<script setup lang="ts">
import { CollapsibleTrigger, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const CollapsiblePrimitive = {
  Trigger: CollapsibleTrigger,
}

interface CollapsibleTriggerProps {
  class?: string
  disabled?: boolean
  asChild?: boolean
}

const props = defineProps<CollapsibleTriggerProps>()

const forwarded = useForwardProps(props)
</script>