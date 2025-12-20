<template>
  <CollapsiblePrimitive.Content
    v-bind="forwarded"
    :class="cn('overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down', props.class)"
  >
    <slot />
  </CollapsiblePrimitive.Content>
</template>

<script setup lang="ts">
import { CollapsibleContent, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const CollapsiblePrimitive = {
  Content: CollapsibleContent,
}

interface CollapsibleContentProps {
  class?: string
  forceMount?: boolean
  asChild?: boolean
}

const props = defineProps<CollapsibleContentProps>()

const forwarded = useForwardProps(props)
</script>