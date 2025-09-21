<script setup lang="ts">
interface Props {
  transactionId?: string
  ipfsHash?: string
  title?: string
  authors?: string[]
}

const props = defineProps<Props>()
const toast = useToast()

function handleMint() {
  const shortTxId = props.transactionId?.substring(0, 8) || 'unknown'

  toast.add({
    title: 'Ready to Mint',
    description: `NFT minting will be available soon. Transaction: ${shortTxId}...`,
    icon: 'i-lucide-gem',
    color: 'primary'
  })
}
</script>

<template>
  <UButton
    icon="i-lucide-gem"
    label="Mint as NFT"
    size="xs"
    variant="soft"
    color="primary"
    @click="handleMint"
  />
</template>
