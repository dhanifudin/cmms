<template>
  <Popover :open="isOpen" @update:open="setOpen">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="isOpen"
        :class="cn('justify-between', className)"
      >
        <span class="truncate">
          {{ displayValue }}
        </span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent :class="cn('p-0', contentClassName)" :align="align">
      <Command>
        <CommandInput
          v-if="searchEnabled"
          :placeholder="`Search ${placeholder.toLowerCase()}...`"
          class="h-9"
        />
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandGroup class="max-h-64 overflow-auto">
          <CommandItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            @select="toggleOption(option.value)"
          >
            <Check
              :class="cn(
                'mr-2 h-4 w-4',
                modelValue.includes(option.value) ? 'opacity-100' : 'opacity-0'
              )"
            />
            {{ option.label }}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator v-if="modelValue.length > 0" />
        <CommandGroup v-if="modelValue.length > 0">
          <CommandItem value="clear-all" @select="clearAll">
            <X class="mr-2 h-4 w-4" />
            Clear all
          </CommandItem>
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Check, ChevronsUpDown, X } from 'lucide-vue-next';

interface Option {
  value: string;
  label: string;
}

interface Props {
  modelValue: string[];
  options: Option[];
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  align?: 'start' | 'center' | 'end';
  searchEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select options...',
  align: 'start',
  searchEnabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const isOpen = ref(false);

const displayValue = computed(() => {
  if (props.modelValue.length === 0) {
    return props.placeholder;
  }
  
  if (props.modelValue.length === 1) {
    const option = props.options.find(opt => opt.value === props.modelValue[0]);
    return option?.label || props.modelValue[0];
  }
  
  return `${props.modelValue.length} selected`;
});

const setOpen = (open: boolean) => {
  isOpen.value = open;
};

const toggleOption = (value: string) => {
  const newValue = props.modelValue.includes(value)
    ? props.modelValue.filter(v => v !== value)
    : [...props.modelValue, value];
    
  emit('update:modelValue', newValue);
};

const clearAll = () => {
  emit('update:modelValue', []);
  isOpen.value = false;
};
</script>