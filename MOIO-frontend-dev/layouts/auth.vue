<template>
  <div class="layout --auth">
    <ClientOnly>
      <main>
        <img src="~/assets/imgs/logo.svg" width="194" height="80" class="logo">
        <slot />
      </main>
    </ClientOnly>
  </div>
</template>
<script setup lang="ts">

// const test = ref('')
// const publicKey = {
//   rp: {
//     name: "WebAuthn Demo",
//   },
//   user: {
//     id: {/* binary data */},
//     name: "user@email.com",
//     displayName: "user@email.com",
//   },
//   challenge: {
//     challenge: "O-SjwzNHvaJrIMBILj7vaupmbSXqaSpzhBiMaiXtq-w",
//     uuid: "user@email.com",
//   },
//   pubKeyCredParams: [
//     {
//       type: "public-key",
//       alg: -7,
//     },
//   ],
//   timeout: 300000,
//   authenticatorSelection: {
//     authenticatorAttachment: "platform",
//     userVerification: "preferred",
//   },
// }
// onMounted(async () => {
//   const attestation = await navigator.credentials.create({ publicKey })
// })
</script>
<style lang="scss">
@import "assets/styles/layouts/auth-layout";

</style>

