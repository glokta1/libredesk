<template>
  <div class="overflow-y-auto">
    <div
      class="p-4 w-[calc(100%-3rem)]"
      :class="{ 'opacity-50 transition-opacity duration-300': isLoading }"
    >
      <Spinner v-if="isLoading" />
      <div class="space-y-4">
        <div class="text-sm text-gray-500 text-right">
          {{ $t('globals.terms.lastUpdated') }}: {{ new Date(lastUpdate).toLocaleTimeString() }}
        </div>
        <div class="mt-7 flex w-full space-x-4">
          <Card title="Open conversations" :counts="cardCounts" :labels="agentCountCardsLabels" />
          <Card
            class="w-8/12"
            title="Agent status"
            :counts="agentStatusCounts"
            :labels="agentStatusLabels"
          />
        </div>
        <div class="rounded box w-full p-5">
          <LineChart :data="chartData.processedData" />
        </div>
        <div class="rounded box w-full p-5">
          <BarChart :data="chartData.status_summary" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useEmitter } from '@/composables/useEmitter'
import { EMITTER_EVENTS } from '@/constants/emitterEvents.js'
import { handleHTTPError } from '@/utils/http'
import Card from '@/features/reports/DashboardCard.vue'
import LineChart from '@/features/reports/DashboardLineChart.vue'
import BarChart from '@/features/reports/DashboardBarChart.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { useI18n } from 'vue-i18n'
import api from '@/api'

const emitter = useEmitter()
const { t } = useI18n()
const isLoading = ref(false)
const cardCounts = ref({})
const chartData = ref({})
const lastUpdate = ref(new Date())
let updateInterval

const agentCountCardsLabels = {
  open: t('globals.terms.open'),
  awaiting_response: t('globals.terms.awaitingResponse'),
  unassigned: t('globals.terms.unassigned'),
  pending: t('globals.terms.pending')
}

const agentStatusLabels = {
  agents_online: t('globals.terms.online'),
  agents_offline: t('globals.terms.offline'),
  agents_away: t('globals.terms.away')
}

const agentStatusCounts = ref({
  agents_online: 0,
  agents_offline: 0,
  agents_away: 0
})

onMounted(() => {
  getDashboardData()
  startRealtimeUpdates()
})

onUnmounted(() => {
  stopRealtimeUpdates()
})

const startRealtimeUpdates = () => {
  updateInterval = setInterval(() => {
    getDashboardData()
    lastUpdate.value = new Date()
  }, 60000)
}

const stopRealtimeUpdates = () => {
  clearInterval(updateInterval)
}

const getDashboardData = () => {
  isLoading.value = true
  Promise.allSettled([getCardStats(), getDashboardCharts()]).finally(() => {
    isLoading.value = false
  })
}

const getCardStats = async () => {
  return api
    .getOverviewCounts()
    .then((resp) => {
      cardCounts.value = resp.data.data
      agentStatusCounts.value = {
        agents_online: cardCounts.value.agents_online,
        agents_offline: cardCounts.value.agents_offline,
        agents_away: cardCounts.value.agents_away
      }
    })
    .catch((error) => {
      emitter.emit(EMITTER_EVENTS.SHOW_TOAST, {
        variant: 'destructive',
        description: handleHTTPError(error).message
      })
    })
}

const getDashboardCharts = async () => {
  return api
    .getOverviewCharts()
    .then((resp) => {
      chartData.value.new_conversations = resp.data.data.new_conversations || []
      chartData.value.resolved_conversations = resp.data.data.resolved_conversations || []
      chartData.value.messages_sent = resp.data.data.messages_sent || []

      // Get all dates from all datasets
      const allDates = [
        ...chartData.value.new_conversations.map((item) => item.date),
        ...chartData.value.resolved_conversations.map((item) => item.date),
        ...chartData.value.messages_sent.map((item) => item.date)
      ]

      // Create unique sorted dates
      const uniqueDates = [...new Set(allDates)].sort((a, b) => new Date(a) - new Date(b))

      // Process data for all dates
      chartData.value.processedData = uniqueDates.map((date) => ({
        date,
        [t('report.chart.newConversations')]:
          chartData.value.new_conversations.find((item) => item.date === date)?.count || 0,
        [t('report.chart.resolvedConversations')]:
          chartData.value.resolved_conversations.find((item) => item.date === date)?.count || 0
      }))

      chartData.value.status_summary = resp.data.data.status_summary || []
    })
    .catch((error) => {
      emitter.emit(EMITTER_EVENTS.SHOW_TOAST, {
        variant: 'destructive',
        description: handleHTTPError(error).message
      })
    })
}
</script>
