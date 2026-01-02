<template>
  <div id="app-container">
    <header>
      <router-link to="/"><h1>Manga Reader</h1></router-link>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
#app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

header {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

header h1 {
  margin: 0;
  color: var(--primary-color);
  text-align: center;
}
</style>