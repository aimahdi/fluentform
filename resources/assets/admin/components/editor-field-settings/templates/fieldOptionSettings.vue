<template>
    <div>
        <el-form labelWidth="130px" labelPosition="left" class="el-form-nested">
            <inputText v-if="childFields.indexOf('label') != -1" :listItem="{type: 'text', label: 'Label'}" v-model="field.settings.label"></inputText>

            <inputDefaultValue v-if="childFields.indexOf('value') != -1" v-model="field.attributes.value" :listItem="{label: 'Default'}" :editItem="field"></inputDefaultValue>

            <inputText v-if="childFields.indexOf('placeholder') != -1" :listItem="{type: 'text', label: 'Placeholder'}" v-model="field.attributes.placeholder"></inputText>

            <inputText v-if="childFields.indexOf('help_message') != -1" :listItem="{type: 'text', label: 'Help Message'}" v-model="field.settings.help_message"></inputText>

            <inputText v-if="childFields.indexOf('maxlength') != -1 && field.attributes.maxlength  " :listItem="{type: 'number', label: 'Max text length'}" v-model="field.attributes.maxlength"></inputText>

            <customSelect v-if="childFields.indexOf('temp_mask_list') != -1" :listItem="{label: 'Mask Input', options: field.settings.temp_mask_list}" v-model="field.settings.temp_mask"></customSelect>

            <template v-if="field.settings.temp_mask == 'custom'">
                <custom-mask v-model="field.attributes['data-mask']" :listItem="{label: 'Custom Mask', help_text: 'Write your own mask for this input', type: 'text'}"></custom-mask>
                <input-yes-no-checkbox v-model="field.settings['data-mask-reverse']" :listItem="{label: 'Activating a reversible mask', help_text: 'If you enable this then it the mask will work as reverse' }"></input-yes-no-checkbox>
                <input-yes-no-checkbox v-model="field.settings['data-clear-if-not-match']" :listItem="{label: 'Clear if not match', help_text: 'Clear value if not match the mask' }"></input-yes-no-checkbox>
            </template>

            <template v-if="childFields.indexOf('layout_class_list') != -1">
                <customSelect :listItem="{label: 'Layout', options: field.settings.layout_class_list}" v-model="field.settings.layout_class"></customSelect>
                <input-yes-no-checkbox v-model="field.settings.randomize_options" :listItem="{label: 'Shuffle the available options', help_text: 'If you enable this then the checkable options will be shuffled' }"></input-yes-no-checkbox>
                <inputDefaultValue v-model="field.settings.dynamic_default_value" :listItem="{label: 'Dynamic Default Value', help_text: 'If you would like to pre-populate the value of a field, enter it here.'}" :editItem="field"></inputDefaultValue>
            </template>

            <advanced-options
                    class="ff_full_width_child"
                    v-if="childFields.indexOf('advanced_options') != -1"
                    :editItem="field" :list-item="{ label: 'Options', help_text: 'Provide Field Options'}"
                    :hasCalValue="true"
            ></advanced-options>

        </el-form>

        <validationRules labelPosition="left" :editItem="field"></validationRules>
    </div>
</template>

<script type="text/babel">
import { mapGetters } from 'vuex';

import inputText from './inputText.vue'
import customSelect from './select.vue'
import inputYesNoCheckbox from './inputYesNoCheckbox.vue'
import customMask from './customMask.vue'
import inputDefaultValue from './inputValue.vue'
import inputPopover from '../../input-popover.vue'
import validationRules from './validationRules.vue'
import advancedOptions from './advanced-options'
import InputCheckbox from '../../templates/inputCheckbox';

export default {
    name: 'fieldOptionSettings',
    props: {
        field: {
            type: Object
        },
        childFields: {
            default() {
                return [
                    'label',
                    'value',
                    'placeholder',
                    'help_message',
                    'maxlength'
                ]
            }
        }
    },
    components: {
        InputCheckbox,
        inputText,
        inputPopover,
        validationRules,
        inputDefaultValue,
        advancedOptions,
        customSelect,
        inputYesNoCheckbox,
        customMask
    },
    computed: {
        ...mapGetters(['editorShortcodes']),
    },
}
</script>

