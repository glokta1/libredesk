<template>
  <div>
    <div class="mb-5">
      <RadioGroup
        class="flex"
        :modelValue="ruleGroup.logical_op"
        @update:modelValue="handleGroupOperator"
      >
        <div class="flex items-center space-x-2">
          <RadioGroupItem value="OR" />
          <Label
            >{{ $t('admin.automation.match') }} <b>{{ $t('admin.automation.any') }}</b>
            {{ $t('admin.automation.below') }}.</Label
          >
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem value="AND" />
          <Label
            >{{ $t('admin.automation.match') }} <b>{{ $t('admin.automation.all') }}</b>
            {{ $t('admin.automation.below') }}.</Label
          >
        </div>
      </RadioGroup>
    </div>

    <div class="space-y-5 rounded" :class="{ 'box p-5': ruleGroup.rules?.length > 0 }">
      <div class="space-y-5">
        <div v-for="(rule, index) in ruleGroup.rules" :key="rule" class="space-y-5">
          <div v-if="index > 0">
            <hr class="border-t-2 border-dotted border-gray-200" />
          </div>

          <!-- Field -->
          <div class="flex space-x-5 items-start">
            <Select
              v-model="rule.field"
              @update:modelValue="(value) => handleFieldChange(value, index)"
            >
              <SelectTrigger class="w-56">
                <SelectValue :placeholder="t('form.field.selectField')" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <!-- Conversation fields -->
                  <SelectLabel>{{ $t('globals.terms.conversation') }}</SelectLabel>
                  <SelectItem v-for="(field, key) in currentFilters" :key="key" :value="key">
                    {{ field.label }}
                  </SelectItem>
                  <!-- Contact custom attributes -->
                  <SelectLabel>{{ $t('globals.terms.contact') }}</SelectLabel>
                  <SelectItem
                    v-for="(field, key) in contactCustomAttributes"
                    :key="key"
                    :value="key"
                  >
                    {{ field.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <!-- Operator -->
            <Select
              v-model="rule.operator"
              @update:modelValue="(value) => handleOperatorChange(value, index)"
            >
              <SelectTrigger class="w-56">
                <SelectValue :placeholder="t('form.field.selectOperator')" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="(op, key) in getFieldOperators(rule.field, rule.field_type)"
                    :key="key"
                    :value="op"
                  >
                    {{ op }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <!-- Value -->
            <div v-if="showInput(index)" class="flex-1">
              <!-- Plain text input -->
              <Input
                type="text"
                :placeholder="t('form.field.setValue')"
                v-if="inputType(index) === 'text'"
                v-model="rule.value"
                @update:modelValue="(value) => handleValueChange(value, index)"
              />

              <!-- Number input -->
              <Input
                type="number"
                :placeholder="t('form.field.setValue')"
                v-if="inputType(index) === 'number'"
                v-model="rule.value"
                @update:modelValue="(value) => handleValueChange(value, index)"
              />

              <!-- Select input -->
              <div v-if="inputType(index) === 'select'">
                <ComboBox
                  v-model="rule.value"
                  :items="getFieldOptions(rule.field, rule.field_type)"
                  @select="handleValueChange($event, index)"
                >
                  <template #item="{ item }">
                    <div class="flex items-center gap-2 ml-2">
                      <Avatar v-if="rule.field === 'assigned_user'" class="w-7 h-7">
                        <AvatarImage :src="item.avatar_url || ''" :alt="item.label.slice(0, 2)" />
                        <AvatarFallback>
                          {{ item.label.slice(0, 2).toUpperCase() }}
                        </AvatarFallback>
                      </Avatar>
                      <span v-if="rule.field === 'assigned_team'">
                        {{ item.emoji }}
                      </span>
                      <span>{{ item.label }}</span>
                    </div>
                  </template>

                  <template #selected="{ selected }">
                    <div v-if="rule?.field === 'assigned_team'">
                      <div v-if="selected" class="flex items-center gap-2">
                        {{ selected.emoji }}
                        <span>{{ selected.label }}</span>
                      </div>
                      <span v-else>{{ $t('form.field.selectTeam') }}</span>
                    </div>

                    <div
                      v-else-if="rule?.field === 'assigned_user'"
                      class="flex items-center gap-2"
                    >
                      <div v-if="selected" class="flex items-center gap-2">
                        <Avatar class="w-7 h-7">
                          <AvatarImage
                            :src="selected.avatar_url || ''"
                            :alt="selected.label.slice(0, 2)"
                          />
                          <AvatarFallback>
                            {{ selected.label.slice(0, 2).toUpperCase() }}
                          </AvatarFallback>
                        </Avatar>
                        <span>{{ selected.label }}</span>
                      </div>
                      <span v-else>{{ $t('form.field.selectUser') }}</span>
                    </div>
                    <span v-else>
                      <span v-if="!selected"> {{ $t('form.field.select') }}</span>
                      <span v-else>{{ selected.label }} </span>
                    </span>
                  </template>
                </ComboBox>
              </div>

              <!-- Tag input -->
              <div v-if="inputType(index) === 'tag'">
                <TagsInput
                  :defaultValue="fieldValueAsArray(rule.value)"
                  @update:modelValue="(value) => handleValueChange(value, index)"
                >
                  <TagsInputItem
                    v-for="item in fieldValueAsArray(rule.value)"
                    :key="item"
                    :value="item"
                  >
                    <TagsInputItemText />
                    <TagsInputItemDelete />
                  </TagsInputItem>
                  <TagsInputInput :placeholder="t('form.field.selectValue')" />
                </TagsInput>
                <p class="text-xs text-gray-500 mt-1">
                  {{ $t('globals.messages.pressEnterToSelectAValue') }}
                </p>
              </div>

              <!-- Date input -->
              <Input
                type="date"
                :placeholder="t('form.field.setValue')"
                v-if="inputType(index) === 'date'"
                v-model="rule.value"
                @update:modelValue="(value) => handleValueChange(value, index)"
              />

              <!-- Boolean / Checkbox input -->
              <Select
                v-model="rule.value"
                @update:modelValue="(value) => handleValueChange(value, index)"
                v-if="inputType(index) === 'boolean'"
              >
                <SelectTrigger>
                  <SelectValue :placeholder="t('form.field.selectValue')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <!-- Placeholder for spacing -->
            <div v-else class="flex-1"></div>

            <!-- Remove condition -->
            <div class="cursor-pointer mt-2" @click.prevent="removeCondition(index)">
              <X size="16" />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox
              id="terms"
              :defaultChecked="rule.case_sensitive_match"
              @update:checked="(value) => handleCaseSensitiveCheck(value, index)"
            />
            <label> {{ $t('globals.messages.caseSensitiveMatch') }} </label>
          </div>
        </div>
      </div>
      <div>
        <Button variant="outline" size="sm" @click.prevent="addCondition">
          {{
            $t('globals.messages.add', {
              name: $t('globals.terms.condition')
            })
          }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs, computed, watch } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText
} from '@/components/ui/tags-input'
import { X } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import ComboBox from '@/components/ui/combobox/ComboBox.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useI18n } from 'vue-i18n'
import { useConversationFilters } from '@/composables/useConversationFilters'

const props = defineProps({
  ruleGroup: {
    type: Object,
    required: true
  },
  groupIndex: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})

const fieldTypeConstants = {
  conversation: 'conversation',
  contact_custom_attribute: 'contact_custom_attribute'
}
const { conversationFilters, newConversationFilters, contactCustomAttributes } =
  useConversationFilters()
const { ruleGroup } = toRefs(props)
const emit = defineEmits(['update-group', 'add-condition', 'remove-condition'])
const { t } = useI18n()

// Computed property to get the correct filters based on type
const currentFilters = computed(() => {
  return props.type === 'new_conversation'
    ? newConversationFilters.value
    : conversationFilters.value
})

// Watch for type change and reset the rules as the fields will change
watch(
  () => props.type,
  (newType, oldType) => {
    // Make sure types have values and they are different.
    if (newType !== oldType && newType && oldType) {
      ruleGroup.value.rules = []
      emitUpdate()
    }
  }
)

const handleGroupOperator = (value) => {
  ruleGroup.value.logical_op = value
  emitUpdate()
}

const handleFieldChange = (value, ruleIndex) => {
  // Set the field type based on the selected field value.
  let fieldType = fieldTypeConstants.conversation
  if (contactCustomAttributes.value[value]) {
    fieldType = fieldTypeConstants.contact_custom_attribute
  }

  ruleGroup.value.rules[ruleIndex].operator = ''
  ruleGroup.value.rules[ruleIndex].value = ''
  ruleGroup.value.rules[ruleIndex].field = value
  ruleGroup.value.rules[ruleIndex].field_type = fieldType
  emitUpdate()
}

const handleOperatorChange = (value, ruleIndex) => {
  if (['contains', 'not contains'].includes(value)) {
    ruleGroup.value.rules[ruleIndex].value = []
  } else {
    ruleGroup.value.rules[ruleIndex].value = ''
  }
  ruleGroup.value.rules[ruleIndex].operator = value
  emitUpdate()
}

const handleValueChange = (value, ruleIndex) => {
  // Get value from object if it's an object.
  const val = typeof value === 'object' && !Array.isArray(value) ? value.value : value

  // Fetch the rule.
  const rule = ruleGroup.value.rules[ruleIndex]

  // Array values are stored as comma separated string.
  rule.value = ['contains', 'not contains'].includes(rule.operator)
    ? Array.isArray(val)
      ? val.join(',')
      : val
    : String(val)

  emitUpdate()
}

const fieldValueAsArray = (value) => {
  return Array.isArray(value) ? value : value ? value.split(',') : []
}

const handleCaseSensitiveCheck = (value, ruleIndex) => {
  ruleGroup.value.rules[ruleIndex].case_sensitive_match = value
  emitUpdate()
}

const removeCondition = (index) => {
  emit('remove-condition', props.groupIndex, index)
}

const addCondition = () => {
  emit('add-condition', props.groupIndex)
}

const emitUpdate = () => {
  emit('update-group', ruleGroup, props.groupIndex)
}

const getFieldOperators = (field, fieldType) => {
  // Set default field type if not set for backwards compatibility as this field was added later.
  if (!fieldType) {
    fieldType = fieldTypeConstants.conversation
  }
  if (fieldType === fieldTypeConstants.contact_custom_attribute) {
    return contactCustomAttributes.value[field]?.operators || []
  }
  if (fieldType === fieldTypeConstants.conversation) {
    return currentFilters.value[field]?.operators || []
  }
  return []
}

const getFieldOptions = (field, fieldType) => {
  // Set default field type if not set for backwards compatibility as this field was added later.
  if (!fieldType) {
    fieldType = fieldTypeConstants.conversation
  }
  if (fieldType === fieldTypeConstants.contact_custom_attribute) {
    return contactCustomAttributes.value[field]?.options || []
  }
  if (fieldType === fieldTypeConstants.conversation) {
    return currentFilters.value[field]?.options || []
  }
  return []
}

const inputType = (index) => {
  const field = ruleGroup.value.rules[index]?.field
  const operator = ruleGroup.value.rules[index]?.operator
  let fieldType = ruleGroup.value.rules[index]?.field_type
  if (['contains', 'not contains'].includes(operator)) return 'tag'

  // Set default field type if not set for backwards compatibility as this field was added later.
  if (!fieldType) {
    fieldType = fieldTypeConstants.conversation
  }
  if (field && fieldType) {
    if (fieldType === fieldTypeConstants.contact_custom_attribute) {
      return contactCustomAttributes.value[field]?.type || ''
    }
    if (fieldType === fieldTypeConstants.conversation) {
      return currentFilters.value[field]?.type || ''
    }
  }
  return ''
}

const showInput = (index) => {
  const operator = ruleGroup.value.rules[index]?.operator
  return !['set', 'not set'].includes(operator)
}
</script>
