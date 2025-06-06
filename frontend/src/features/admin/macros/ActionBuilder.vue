<template>
  <div class="space-y-5 rounded">
    <div class="space-y-5">
      <div v-for="(action, index) in model" :key="index" class="space-y-5">
        <hr v-if="index" class="border-t-2 border-dotted border-gray-300" />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex gap-5">
              <div class="w-48">
                <Select
                  v-model="action.type"
                  @update:modelValue="(value) => updateField(value, index)"
                >
                  <SelectTrigger>
                    <SelectValue :placeholder="config.typePlaceholder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="(actionConfig, key) in config.actions"
                        :key="key"
                        :value="key"
                      >
                        {{ actionConfig.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div
                v-if="action.type && config.actions[action.type]?.type === 'select'"
                class="w-48"
              >
                <ComboBox
                  v-model="action.value[0]"
                  :items="config.actions[action.type].options"
                  :placeholder="config.valuePlaceholder"
                  @update:modelValue="(value) => updateValue(value, index)"
                >
                  <template #item="{ item }">
                    <div v-if="action.type === 'assign_user'">
                      <div class="flex items-center flex-1 gap-2 ml-2">
                        <Avatar class="w-7 h-7">
                          <AvatarImage :src="item.avatar_url || ''" :alt="item.label.slice(0, 2)" />
                          <AvatarFallback
                            >{{ item.label.slice(0, 2).toUpperCase() }}
                          </AvatarFallback>
                        </Avatar>
                        <span>{{ item.label }}</span>
                      </div>
                    </div>
                    <div v-else-if="action.type === 'assign_team'">
                      <div class="flex items-center gap-2 ml-2">
                        <span>{{ item.emoji }}</span>
                        <span>{{ item.label }}</span>
                      </div>
                    </div>
                    <div v-else>
                      {{ item.label }}
                    </div>
                  </template>

                  <template #selected="{ selected }">
                    <div v-if="action.type === 'assign_user'">
                      <div class="flex items-center gap-2">
                        <div v-if="selected" class="flex items-center gap-2">
                          <Avatar class="w-7 h-7">
                            <AvatarImage
                              :src="selected.avatar_url || ''"
                              :alt="selected.label.slice(0, 2)"
                            />
                            <AvatarFallback>{{
                              selected.label.slice(0, 2).toUpperCase()
                            }}</AvatarFallback>
                          </Avatar>
                          <span>{{ selected.label }}</span>
                        </div>
                        <span v-else>{{ $t('form.field.selectUser') }}</span>
                      </div>
                    </div>
                    <div v-else-if="action.type === 'assign_team'">
                      <div class="flex items-center gap-2">
                        <span v-if="selected">
                          {{ selected.emoji }}
                          <span>{{ selected.label }}</span>
                        </span>
                        <span v-else>
                          {{ $t('form.field.selectTeam') }}
                        </span>
                      </div>
                    </div>
                    <div v-else-if="selected">
                      {{ selected.label }}
                    </div>
                    <div v-else>{{ $t('form.field.select') }}</div>
                  </template>
                </ComboBox>
              </div>
            </div>

            <X class="cursor-pointer w-4" @click="remove(index)" />
          </div>

          <div v-if="action.type && config.actions[action.type]?.type === 'tag'">
            <SelectTag
              v-model="action.value"
              :items="tagsStore.tagNames.map((tag) => ({ label: tag, value: tag }))"
              placeholder="Select tag"
            />
          </div>
        </div>
      </div>
    </div>
    <Button type="button" variant="outline" @click.prevent="add">{{ config.addButtonText }}</Button>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { SelectTag } from '@/components/ui/select'
import { useTagStore } from '@/stores/tag'
import ComboBox from '@/components/ui/combobox/ComboBox.vue'

const model = defineModel('actions', {
  type: Array,
  required: true,
  default: () => []
})

defineProps({
  config: {
    type: Object,
    required: true
  }
})

const tagsStore = useTagStore()

const updateField = (value, index) => {
  const newModel = [...model.value]
  newModel[index] = { type: value, value: [] }
  model.value = newModel
}

const updateValue = (value, index) => {
  const newModel = [...model.value]
  newModel[index] = {
    ...newModel[index],
    value: [value?.value ?? value]
  }
  model.value = newModel
}

const remove = (index) => {
  model.value = model.value.filter((_, i) => i !== index)
}

const add = () => {
  model.value = [...model.value, { type: '', value: [] }]
}
</script>
