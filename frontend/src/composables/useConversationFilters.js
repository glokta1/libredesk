import { computed } from 'vue'
import { useConversationStore } from '@/stores/conversation'
import { useInboxStore } from '@/stores/inbox'
import { useUsersStore } from '@/stores/users'
import { useTeamStore } from '@/stores/team'
import { useSlaStore } from '@/stores/sla'
import { useCustomAttributeStore } from '@/stores/customAttributes'
import { FIELD_TYPE, FIELD_OPERATORS } from '@/constants/filterConfig'

export function useConversationFilters () {
    const cStore = useConversationStore()
    const iStore = useInboxStore()
    const uStore = useUsersStore()
    const tStore = useTeamStore()
    const slaStore = useSlaStore()
    const customAttributeStore = useCustomAttributeStore()

    const customAttributeDataTypeToFieldType = {
        'text': FIELD_TYPE.TEXT,
        'number': FIELD_TYPE.NUMBER,
        'checkbox': FIELD_TYPE.BOOLEAN,
        'date': FIELD_TYPE.DATE,
        'link': FIELD_TYPE.TEXT,
        'list': FIELD_TYPE.SELECT,
    }

    const customAttributeDataTypeToFieldOperators = {
        'text': FIELD_OPERATORS.TEXT,
        'number': FIELD_OPERATORS.NUMBER,
        'checkbox': FIELD_OPERATORS.BOOLEAN,
        'date': FIELD_OPERATORS.DATE,
        'link': FIELD_OPERATORS.TEXT,
        'list': FIELD_OPERATORS.SELECT,
    }

    const conversationsListFilters = computed(() => ({
        status_id: {
            label: 'Status',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: cStore.statusOptions
        },
        priority_id: {
            label: 'Priority',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: cStore.priorityOptions
        },
        assigned_team_id: {
            label: 'Assigned team',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: tStore.options
        },
        assigned_user_id: {
            label: 'Assigned user',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: uStore.options
        },
        inbox_id: {
            label: 'Inbox',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: iStore.options
        }
    }))

    const contactCustomAttributes = computed(() => {
        return customAttributeStore.contactAttributeOptions
            .filter(attribute => attribute.applies_to === 'contact')
            .reduce((acc, attribute) => {
                acc[attribute.key] = {
                    label: attribute.label,
                    type: customAttributeDataTypeToFieldType[attribute.data_type] || FIELD_TYPE.TEXT,
                    operators: customAttributeDataTypeToFieldOperators[attribute.data_type] || FIELD_OPERATORS.TEXT,
                    options: attribute.values.map(value => ({
                        label: value,
                        value: value
                    })) || [],
                }
                return acc
            }, {})
    })

    const newConversationFilters = computed(() => ({
        contact_email: {
            label: 'Email',
            type: FIELD_TYPE.TEXT,
            operators: FIELD_OPERATORS.TEXT
        },
        content: {
            label: 'Content',
            type: FIELD_TYPE.TEXT,
            operators: FIELD_OPERATORS.TEXT
        },
        subject: {
            label: 'Subject',
            type: FIELD_TYPE.TEXT,
            operators: FIELD_OPERATORS.TEXT
        },
        status: {
            label: 'Status',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: cStore.statusOptions
        },
        priority: {
            label: 'Priority',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: cStore.priorityOptions
        },
        assigned_team: {
            label: 'Assigned team',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: tStore.options
        },
        assigned_user: {
            label: 'Assigned agent',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: uStore.options
        },
        inbox: {
            label: 'Inbox',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: iStore.options
        }
    }))

    const conversationFilters = computed(() => ({
        status: {
            label: 'Status',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: cStore.statusOptions
        },
        priority: {
            label: 'Priority',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: cStore.priorityOptions
        },
        assigned_team: {
            label: 'Assigned team',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: tStore.options
        },
        assigned_user: {
            label: 'Assigned agent',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: uStore.options
        },
        hours_since_created: {
            label: 'Hours since created',
            type: FIELD_TYPE.NUMBER,
            operators: FIELD_OPERATORS.NUMBER
        },
        hours_since_first_reply: {
            label: 'Hours since first reply',
            type: FIELD_TYPE.NUMBER,
            operators: FIELD_OPERATORS.NUMBER
        },
        hours_since_last_reply: {
            label: 'Hours since last reply',
            type: FIELD_TYPE.NUMBER,
            operators: FIELD_OPERATORS.NUMBER
        },
        hours_since_resolved: {
            label: 'Hours since resolved',
            type: FIELD_TYPE.NUMBER,
            operators: FIELD_OPERATORS.NUMBER
        },
        inbox: {
            label: 'Inbox',
            type: FIELD_TYPE.SELECT,
            operators: FIELD_OPERATORS.SELECT,
            options: iStore.options
        }
    }))

    const conversationActions = computed(() => ({
        assign_team: {
            label: 'Assign to team',
            type: FIELD_TYPE.SELECT,
            options: tStore.options
        },
        assign_user: {
            label: 'Assign to user',
            type: FIELD_TYPE.SELECT,
            options: uStore.options
        },
        set_status: {
            label: 'Set status',
            type: FIELD_TYPE.SELECT,
            options: cStore.statusOptionsNoSnooze
        },
        set_priority: {
            label: 'Set priority',
            type: FIELD_TYPE.SELECT,
            options: cStore.priorityOptions
        },
        send_private_note: {
            label: 'Send private note',
            type: FIELD_TYPE.RICHTEXT
        },
        send_reply: {
            label: 'Send reply',
            type: FIELD_TYPE.RICHTEXT
        },
        send_csat: {
            label: 'Send CSAT',
        },
        set_sla: {
            label: 'Set SLA',
            type: FIELD_TYPE.SELECT,
            options: slaStore.options
        },
        add_tags: {
            label: 'Add tags',
            type: FIELD_TYPE.TAG
        },
        set_tags: {
            label: 'Set tags',
            type: FIELD_TYPE.TAG
        },
        remove_tags: {
            label: 'Remove tags',
            type: FIELD_TYPE.TAG
        }
    }))

    const macroActions = computed(() => ({
        assign_team: {
            label: 'Assign to team',
            type: FIELD_TYPE.SELECT,
            options: tStore.options
        },
        assign_user: {
            label: 'Assign to user',
            type: FIELD_TYPE.SELECT,
            options: uStore.options
        },
        set_status: {
            label: 'Set status',
            type: FIELD_TYPE.SELECT,
            options: cStore.statusOptionsNoSnooze
        },
        set_priority: {
            label: 'Set priority',
            type: FIELD_TYPE.SELECT,
            options: cStore.priorityOptions
        },
        add_tags: {
            label: 'Add tags',
            type: FIELD_TYPE.TAG
        },
        set_tags: {
            label: 'Set tags',
            type: FIELD_TYPE.TAG
        },
        remove_tags: {
            label: 'Remove tags',
            type: FIELD_TYPE.TAG
        }
    }))


    return {
        conversationsListFilters,
        conversationFilters,
        newConversationFilters,
        conversationActions,
        macroActions,
        contactCustomAttributes,
    }
}