<template>
  <header class="sticky top-0 z-50 bg-lol-card border-b border-lol-border backdrop-blur-sm bg-opacity-90">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
      <RouterLink to="/" class="text-lol-primary font-bold text-lg shrink-0">
        LOL 成就追踪
      </RouterLink>

      <nav class="flex items-center gap-3 ml-auto text-sm">
        <RouterLink
          to="/achievements"
          class="text-lol-muted hover:text-lol-text transition-colors"
          active-class="!text-lol-primary"
        >
          成就管理
        </RouterLink>
        <RouterLink
          to="/settings"
          class="text-lol-muted hover:text-lol-text transition-colors"
          active-class="!text-lol-primary"
        >
          设置
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
