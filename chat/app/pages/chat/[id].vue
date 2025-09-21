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

                <!-- Waiting Agent Tool Call Visualization -->
                <UCard v-else-if="part.type === 'tool-waitingAgent'" variant="soft" class="my-2">
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UBadge
                        :color="part.state === 'output-available' ? 'success' : part.state === 'output-error' ? 'error' : 'info'"
                        variant="soft"
                        size="sm"
                      >
                        Waiting Agent
                      </UBadge>
                    </div>
                  </template>

                  <!-- Tool Input/Executing State -->
                  <UAlert
                    v-if="part.state === 'input-streaming' || part.state === 'input-available'"
                    icon="i-lucide-clock"
                    color="info"
                    variant="soft"
                    title="Agent Executing"
                    :description="`${part.input?.message ? 'Message: ' + part.input.message + ' • ' : ''}Waiting for ${part.input?.duration || 4} seconds...`"
                  />

                  <!-- Tool Output/Completed State -->
                  <UAlert
                    v-else-if="part.state === 'output-available'"
                    icon="i-lucide-check-circle"
                    color="success"
                    variant="soft"
                    title="Agent Completed"
                    :description="`${part.output?.message || 'Task completed successfully'}${part.output?.duration ? ' • Duration: ' + part.output.duration : ''}`"
                  />

                  <!-- Tool Error State -->
                  <UAlert
                    v-else-if="part.state === 'output-error'"
                    icon="i-lucide-alert-circle"
                    color="error"
                    variant="soft"
                    title="Agent Error"
                    :description="part.errorText || 'An error occurred during agent execution'"
                  />

                  <!-- Fallback for other states -->
                  <UAlert
                    v-else
                    icon="i-lucide-info"
                    color="neutral"
                    variant="soft"
                    title="Unknown State"
                    :description="`Tool State: ${part.state}`"
                  />
                </UCard>

                <!-- Generic tool handler for future tools -->
                <UCard
                  v-else-if="part.type.startsWith('tool-') && part.type !== 'tool-waitingAgent'"
                  variant="soft"
                  class="my-2"
                >
                  <template #header>
                    <UBadge color="info" variant="soft" size="sm">
                      {{ part.type.replace('tool-', '') }}
                    </UBadge>
                  </template>

                  <pre class="text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">{{ JSON.stringify(part,
                                                                                                                null, 2) }}</pre>
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
          placeholder="Type your message... Try @waiting-agent to test the tool agent!"
          @submit="handleSubmit"
        >
          <UChatPromptSubmit
            :status="chat.status"
            color="neutral"
            @stop="chat.stop"
            @reload="chat.regenerate"
          />

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                💡 Try typing <code
                  class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                >@waiting-agent</code> to activate the
                waiting agent tool
              </div>
              <ModelSelect v-model="model" />
            </div>
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
