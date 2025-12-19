<template>
  <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
    <div class="flex items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink as-child>
              <router-link to="/dashboard">
                Dashboard
              </router-link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator v-if="breadcrumbItems.length > 1" class="hidden md:block" />
          <BreadcrumbItem v-for="(item, index) in breadcrumbItems" :key="index">
            <BreadcrumbPage v-if="index === breadcrumbItems.length - 1">
              {{ item.label }}
            </BreadcrumbPage>
            <BreadcrumbLink v-else as-child>
              <router-link :to="item.href">
                {{ item.label }}
              </router-link>
            </BreadcrumbLink>
            <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <div class="ml-auto px-3 flex items-center gap-2">
      <div class="hidden md:block">
        <Button
          variant="outline"
          size="sm"
          class="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
          @click="openCommandPalette"
        >
          <Search class="mr-2 h-4 w-4" />
          Search...
          <kbd class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span class="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 md:hidden"
        @click="openCommandPalette"
      >
        <Search class="h-4 w-4" />
        <span class="sr-only">Search</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="relative h-8 w-8"
        @click="openNotifications"
      >
        <Bell class="h-4 w-4" />
        <span v-if="notificationStore.unreadCount > 0" class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
          {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
        </span>
        <span class="sr-only">Notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="h-8 w-8">
            <Sun v-if="!isDark" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
            <span class="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="setTheme('light')">
            <Sun class="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem @click="setTheme('dark')">
            <Moon class="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem @click="setTheme('system')">
            <Monitor class="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    
    <!-- Command Palette -->
    <CommandPalette :open="commandPaletteOpen" @update:open="commandPaletteOpen = $event" />
  </header>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Sun, Moon, Monitor, Bell } from 'lucide-vue-next'
import CommandPalette from '@/components/CommandPalette.vue'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()

// Theme controls
const theme = inject('theme') as any
const isDark = computed(() => theme?.isDark.value || false)
const setTheme = (newTheme: string) => theme?.setTheme(newTheme)

// Breadcrumb generation
const breadcrumbItems = computed(() => {
  const items = []
  const pathSegments = route.path.split('/').filter(Boolean)
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    const path = '/' + pathSegments.slice(0, i + 1).join('/')
    
    // Skip the first segment if it's 'dashboard' since it's already in the base breadcrumb
    if (i === 0 && segment === 'dashboard') continue
    
    const label = (segment || '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    items.push({
      label,
      href: path
    })
  }
  
  return items
})

// Notifications
const notificationStore = useNotificationStore()

// Command palette state
const commandPaletteOpen = ref(false)

const openCommandPalette = () => {
  commandPaletteOpen.value = true
}

const openNotifications = () => {
  // TODO: Open notifications panel/dropdown
  console.log('Open notifications')
}
</script>