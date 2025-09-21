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
                <div
                  v-else-if="part.type === 'tool-waitingAgent'"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-2 bg-gray-50 dark:bg-gray-800/50"
                >
                  <!-- Tool Input/Executing State -->
                  <div v-if="part.state === 'input-streaming' || part.state === 'input-available'">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-lucide-loader-2" class="animate-spin text-primary" />
                      <span class="font-semibold text-sm">Waiting Agent Activated</span>
                    </div>
                    <div v-if="part.input?.message" class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Message: {{ part.input.message }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Waiting for {{ part.input?.duration || 4 }} seconds...
                    </div>
                  </div>

                  <!-- Tool Output/Completed State -->
                  <div v-else-if="part.state === 'output-available'">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-lucide-check-circle" class="text-green-500" />
                      <span class="font-semibold text-sm">Waiting Agent Complete</span>
                    </div>
                    <div class="bg-white dark:bg-gray-900 rounded p-3 text-sm border border-gray-200 dark:border-gray-600">
                      <div v-if="part.output?.status" class="text-green-600 dark:text-green-400 font-medium">
                        Status: {{ part.output.status }}
                      </div>
                      <div v-if="part.output?.message" class="mt-1 text-gray-700 dark:text-gray-300">
                        {{ part.output.message }}
                      </div>
                      <div v-if="part.output?.duration" class="text-xs text-gray-500 mt-2">
                        Duration: {{ part.output.duration }}
                      </div>
                    </div>
                  </div>

                  <!-- Tool Error State -->
                  <div v-else-if="part.state === 'output-error'">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon name="i-lucide-alert-circle" class="text-red-500" />
                      <span class="font-semibold text-sm text-red-600 dark:text-red-400">Agent Error</span>
                    </div>
                    <div class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {{ part.errorText || 'An error occurred during agent execution' }}
                    </div>
                  </div>

                  <!-- Fallback for other states -->
                  <div v-else>
                    <div class="text-xs font-mono text-gray-600 dark:text-gray-400">
                      Tool State: {{ part.state }}
                    </div>
                  </div>
                </div>

                <!-- Generic tool handler for future tools -->
                <div
                  v-else-if="part.type.startsWith('tool-') && part.type !== 'tool-waitingAgent'"
                  class="border border-blue-200 dark:border-blue-700 rounded-lg p-3 my-2 bg-blue-50 dark:bg-blue-900/20"
                >
                  <div class="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
                    Tool: {{ part.type.replace('tool-', '') }}
                  </div>
                  <pre class="text-xs text-gray-700 dark:text-gray-300 overflow-auto">{{ JSON.stringify(part, null, 2) }}</pre>
                </div>
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
                💡 Try typing <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">@waiting-agent</code> to activate the waiting agent tool
              </div>
              <ModelSelect v-model="model" />
            </div>
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
