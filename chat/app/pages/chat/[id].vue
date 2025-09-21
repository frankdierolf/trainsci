<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import ProseStreamPre from '../../components/prose/PreStream.vue'

const components = {
  pre: ProseStreamPre as unknown as DefineComponent
}

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { model } = useModels()

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found', fatal: true })
}

const input = ref('')

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    body: {
      model: model.value
    }
  }),
  onFinish() {
    refreshNuxtData('chats')
  },
  onError(error) {
    const { message } = typeof error.message === 'string' && error.message[0] === '{' ? JSON.parse(error.message) : error
    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

function handleSubmit(e: Event) {
  e.preventDefault()
  if (input.value.trim()) {
    chat.sendMessage({
      text: input.value
    })
    input.value = ''
  }
}

const copied = ref(false)

function copy(e: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handleMint(output: { transactionId?: string }) {
  const shortTxId = output.transactionId?.substring(0, 8) || 'unknown'

  toast.add({
    title: 'Ready to Mint',
    description: `NFT minting will be available soon. Transaction: ${shortTxId}...`,
    icon: 'i-lucide-gem',
    color: 'primary'
  })
}

// Agent helper functions
function getAgentColor(type: string) {
  const colors: Record<string, string> = {
    'tool-ipBlockchainAgent': 'violet',
    'tool-literatureAgent': 'blue',
    'tool-peerReviewAgent': 'orange',
    'tool-grantAgent': 'green',
    'tool-crossDomainAgent': 'purple',
    'tool-waitingAgent': 'info'
  }
  return colors[type] || 'neutral'
}

function getAgentLabel(type: string) {
  const labels: Record<string, string> = {
    'tool-ipBlockchainAgent': 'IP Blockchain',
    'tool-literatureAgent': 'Literature Search',
    'tool-peerReviewAgent': 'Peer Review',
    'tool-grantAgent': 'Grant Finder',
    'tool-crossDomainAgent': 'Cross-Domain',
    'tool-waitingAgent': 'Waiting Agent'
  }
  return labels[type] || type.replace('tool-', '')
}

function getAgentIcon(type: string) {
  const icons: Record<string, string> = {
    'tool-ipBlockchainAgent': 'i-lucide-shield-check',
    'tool-literatureAgent': 'i-lucide-book-open',
    'tool-peerReviewAgent': 'i-lucide-file-check',
    'tool-grantAgent': 'i-lucide-coins',
    'tool-crossDomainAgent': 'i-lucide-network',
    'tool-waitingAgent': 'i-lucide-clock'
  }
  return icons[type] || 'i-lucide-cpu'
}

onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})
</script>

<template>
  <UDashboardPanel id="chat" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages
          :messages="chat.messages"
          :status="chat.status"
          :assistant="{ actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] }"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
          :spacing-offset="160"
        >
          <template #content="{ message }">
            <div class="space-y-4">
              <template v-for="(part, index) in message.parts" :key="`${part.type}-${index}-${message.id}`">
                <UButton
                  v-if="part.type === 'reasoning' && part.state !== 'done'"
                  label="Thinking..."
                  variant="link"
                  color="neutral"
                  class="p-0"
                  loading
                />

                <!-- Enhanced Agent Tool Visualization -->
                <UCard v-else-if="part.type.startsWith('tool-')" variant="soft" class="my-2">
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UBadge
                        :color="getAgentColor(part.type)"
                        variant="soft"
                        size="sm"
                      >
                        {{ getAgentLabel(part.type) }}
                      </UBadge>
                    </div>
                  </template>

                  <!-- Completed State -->
                  <div v-if="part.state === 'output-available' && part.output" class="space-y-3">
                    <!-- IP Blockchain Agent Output -->
                    <template v-if="part.type === 'tool-ipBlockchainAgent'">
                      <UAlert
                        icon="i-lucide-check-circle"
                        color="success"
                        variant="soft"
                        :actions="[
                          { label: 'View Certificate', size: 'xs', variant: 'soft', color: 'primary' },
                          { label: 'Mint as NFT', icon: 'i-lucide-gem', size: 'xs', variant: 'soft', color: 'primary', onClick: () => handleMint(part.output) }
                        ]"
                      >
                        <template #title>
                          Research Protected
                        </template>
                        <template #description>
                          <div class="space-y-2 mt-2">
                            <div><strong>Title:</strong> {{ part.output.title }}</div>
                            <div><strong>Transaction:</strong> <code class="text-xs">{{ part.output.transactionId?.substring(0, 20) }}...</code></div>
                            <div><strong>IPFS Hash:</strong> <code class="text-xs">{{ part.output.ipfsHash?.substring(0, 20) }}...</code></div>
                            <div><strong>Authors:</strong> {{ part.output.authors?.join(', ') }}</div>
                          </div>
                        </template>
                      </UAlert>
                    </template>

                    <!-- Literature Agent Output -->
                    <template v-else-if="part.type === 'tool-literatureAgent'">
                      <div class="space-y-3">
                        <UAlert icon="i-lucide-search" color="blue" variant="soft">
                          <template #title>
                            Literature Search Complete
                          </template>
                          <template #description>
                            Found <strong>{{ part.output.papersFound }}</strong> papers in {{ part.output.sources?.join(', ') }}
                          </template>
                        </UAlert>

                        <div class="space-y-2">
                          <p class="text-sm font-medium">
                            Top Papers:
                          </p>
                          <div v-for="paper in part.output.topPapers" :key="paper.title" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div class="font-medium text-sm">
                              {{ paper.title }}
                            </div>
                            <div class="text-xs text-muted mt-1">
                              {{ paper.year }} • {{ paper.citations }} citations
                            </div>
                          </div>
                        </div>

                        <div v-if="part.output.researchGaps" class="mt-3">
                          <p class="text-sm font-medium mb-2">
                            Research Gaps Identified:
                          </p>
                          <ul class="text-sm space-y-1">
                            <li v-for="gap in part.output.researchGaps" :key="gap" class="flex items-start gap-2">
                              <span class="text-blue-500 mt-1">•</span>
                              <span>{{ gap }}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </template>

                    <!-- Peer Review Agent Output -->
                    <template v-else-if="part.type === 'tool-peerReviewAgent'">
                      <div class="space-y-3">
                        <UAlert icon="i-lucide-file-check" color="orange" variant="soft">
                          <template #title>
                            Peer Review Complete
                          </template>
                          <template #description>
                            Overall Score: <strong>{{ part.output.overallScore }}</strong> • Recommendation: <strong>{{ part.output.recommendation }}</strong>
                          </template>
                        </UAlert>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <p class="text-sm font-medium text-green-600">
                              Strengths:
                            </p>
                            <ul class="text-sm space-y-1">
                              <li v-for="strength in part.output.strengths" :key="strength" class="flex items-start gap-2">
                                <span class="text-green-500 mt-1">✓</span>
                                <span>{{ strength }}</span>
                              </li>
                            </ul>
                          </div>

                          <div class="space-y-2">
                            <p class="text-sm font-medium text-red-600">
                              Areas for Improvement:
                            </p>
                            <ul class="text-sm space-y-1">
                              <li v-for="weakness in part.output.weaknesses" :key="weakness" class="flex items-start gap-2">
                                <span class="text-red-500 mt-1">!</span>
                                <span>{{ weakness }}</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div class="space-y-2">
                          <p class="text-sm font-medium">
                            Suggestions:
                          </p>
                          <ul class="text-sm space-y-1">
                            <li v-for="suggestion in part.output.suggestions" :key="suggestion" class="flex items-start gap-2">
                              <span class="text-orange-500 mt-1">→</span>
                              <span>{{ suggestion }}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </template>

                    <!-- Grant Agent Output -->
                    <template v-else-if="part.type === 'tool-grantAgent'">
                      <div class="space-y-3">
                        <UAlert icon="i-lucide-coins" color="green" variant="soft">
                          <template #title>
                            Grant Search Complete
                          </template>
                          <template #description>
                            Found <strong>{{ part.output.grantsFound }}</strong> grants, <strong>{{ part.output.eligibleGrants }}</strong> eligible for your research
                          </template>
                        </UAlert>

                        <div class="space-y-3">
                          <p class="text-sm font-medium">
                            Top Matches:
                          </p>
                          <div v-for="grant in part.output.topMatches" :key="grant.name" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                              <div class="font-medium text-sm">
                                {{ grant.name }}
                              </div>
                              <UBadge size="xs" color="green" variant="soft">
                                {{ grant.matchScore }}
                              </UBadge>
                            </div>
                            <div class="text-sm text-muted">
                              <strong>Amount:</strong> {{ grant.amount }} • <strong>Deadline:</strong> {{ grant.deadline }}
                            </div>
                          </div>
                        </div>

                        <div v-if="part.output.tips" class="space-y-2">
                          <p class="text-sm font-medium">
                            Tips:
                          </p>
                          <ul class="text-sm space-y-1">
                            <li v-for="tip in part.output.tips" :key="tip" class="flex items-start gap-2">
                              <span class="text-green-500 mt-1">💡</span>
                              <span>{{ tip }}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </template>

                    <!-- Cross-Domain Agent Output -->
                    <template v-else-if="part.type === 'tool-crossDomainAgent'">
                      <div class="space-y-3">
                        <UAlert icon="i-lucide-network" color="purple" variant="soft">
                          <template #title>
                            Cross-Domain Analysis Complete
                          </template>
                          <template #description>
                            Found <strong>{{ part.output.connectionsFound }}</strong> interdisciplinary connections
                          </template>
                        </UAlert>

                        <div class="space-y-3">
                          <p class="text-sm font-medium">
                            Cross-Domain Applications:
                          </p>
                          <div v-for="app in part.output.crossDomainApplications" :key="app.field" class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div class="font-medium text-sm mb-1">
                              {{ app.field }}
                            </div>
                            <div class="text-sm text-muted mb-2">
                              {{ app.connection }}
                            </div>
                            <div class="text-sm">
                              <strong>Potential:</strong> {{ app.potential }}
                            </div>
                          </div>
                        </div>

                        <div class="space-y-2">
                          <p class="text-sm font-medium">
                            Suggested Collaborations:
                          </p>
                          <div class="flex flex-wrap gap-2">
                            <UBadge
                              v-for="collab in part.output.suggestedCollaborations"
                              :key="collab"
                              size="sm"
                              color="purple"
                              variant="soft"
                            >
                              {{ collab }}
                            </UBadge>
                          </div>
                        </div>

                        <div v-if="part.output.novelApproach" class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <p class="text-sm font-medium mb-1">
                            Novel Approach:
                          </p>
                          <p class="text-sm">
                            {{ part.output.novelApproach }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <!-- Waiting Agent Output -->
                    <template v-else-if="part.type === 'tool-waitingAgent'">
                      <UAlert icon="i-lucide-check-circle" color="success" variant="soft">
                        <template #title>
                          Agent Completed
                        </template>
                        <template #description>
                          {{ part.output.message || 'Task completed successfully' }}{{ part.output.duration ? ' • Duration: ' + part.output.duration : '' }}
                        </template>
                      </UAlert>
                    </template>

                    <!-- Fallback for unknown tools -->
                    <template v-else>
                      <UAlert icon="i-lucide-info" color="neutral" variant="soft">
                        <template #title>
                          {{ getAgentLabel(part.type) }} Complete
                        </template>
                        <template #description>
                          <pre class="text-xs mt-2 overflow-auto">{{ JSON.stringify(part.output, null, 2) }}</pre>
                        </template>
                      </UAlert>
                    </template>
                  </div>

                  <!-- Processing State -->
                  <UAlert
                    v-else-if="part.state === 'input-available' || part.state === 'input-streaming'"
                    :icon="getAgentIcon(part.type)"
                    color="info"
                    variant="soft"
                    title="Processing..."
                    description="Agent is working on your request"
                  />

                  <!-- Error State -->
                  <UAlert
                    v-else-if="part.state === 'output-error'"
                    :icon="getAgentIcon(part.type)"
                    color="error"
                    variant="soft"
                    title="Agent Error"
                    :description="part.errorText || 'An error occurred during agent execution'"
                  />

                  <!-- Fallback for other states -->
                  <UAlert
                    v-else
                    :icon="getAgentIcon(part.type)"
                    color="neutral"
                    variant="soft"
                    title="Unknown State"
                    :description="`Tool State: ${part.state}`"
                  />
                </UCard>
              </template>

              <!-- Regular message content -->
              <MDCCached
                :value="getTextFromMessage(message)"
                :cache-key="message.id"
                unwrap="p"
                :components="components"
                :parser-options="{ highlight: false }"
              />
            </div>
          </template>
        </UChatMessages>

        <UChatPrompt
          v-model="input"
          :error="chat.error"
          variant="subtle"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          placeholder="Type your message... Try @ip-blockchain-agent, @literature-agent, @peer-review-agent, @grant-agent, or @cross-domain-agent"
          @submit="handleSubmit"
        >
          <UChatPromptSubmit
            :status="chat.status"
            color="neutral"
            @stop="chat.stop"
            @reload="chat.regenerate"
          />

          <template #footer>
            <div class="flex items-center justify-end">
              <ModelSelect v-model="model" />
            </div>
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
