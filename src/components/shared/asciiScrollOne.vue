<script lang="ts">
export default {
  name: 'AsciiScrollOne',
}
</script>

<template>
  <pre class="menu-card-example">
╔════════════════════════════════╗
║         CAPPUCCINO             ║
║                                ║
║      )  (                      ║
║     (    )                     ║
║    ( (  ) )                    ║
║     ______                     ║
║    |      |                    ║
║    |      |                    ║
║     \____/                     ║
║                                ║
║    Rich espresso with          ║
║    steamed milk foam           ║
║                                ║
║         $4.50                  ║
╚════════════════════════════════╝
    </pre
  >
</template>

<style scoped>
.ascii-art-collection {
  font-family: monospace;
  line-height: 1.2;
}

pre {
  margin: 0;
  padding: 0;
  white-space: pre;
  font-family: 'Courier New', Courier, monospace;
}

.coffee-cup-small,
.coffee-cup-large,
.latte-cup,
.espresso-cup,
.to-go-cup {
  display: inline-block;
  margin: 1rem;
}

.menu-card-example {
  margin: 2rem 0;
}
</style>
