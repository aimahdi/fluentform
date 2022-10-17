<template>
    <div class="el-form--label-top">
        <b>
            <elLabel slot="label" :label="listItem.label" :helpText="listItem.help_text"></elLabel>
        </b>
        <div style="margin-top:10px;" class="address-field-option" v-for="(field, i) in editItem.fields">
            <div class="field-options-settings">
                <div class="action-btn pull-right">
                    <i @click="toggleAddressFieldInputs" class="icon el-icon-caret-bottom"></i>
                    <i @click="increase(i)" class="icon icon-plus-circle"></i>
                    <i @click="decrease(i)" class="icon icon-minus-circle"></i>
                </div>
                <b style="color: #409EFF;" @click="toggleAddressFieldInputs">{{ field.settings.label }}</b>
            </div>
            <div class="address-field-option__settings">
                <div class="el-form--label-left">
                    <div class="el-form-item">
                        <label class="el-form-item__label" style="width: 130px; float: left;">
                            <span>{{ $t('Field Type') }}</span>
                        </label>
                        <div class="el-form-item__content" style="margin-left: 130px;">
                            <el-select @change="changeFieldType(field, i)" v-model="field.element">
                                <el-option v-for="(element,elementName) in available_elements" :key="elementName"
                                           :value="elementName" :label="element"></el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div v-if="field.element == 'select'">
                    <fieldOptionSettings :field="field" :child-fields="selectChildFields"></fieldOptionSettings>
                </div>
                <div v-if="field.element == 'input_mask'">
                    <fieldOptionSettings :field="field" :child-fields="inputMaskChildFields"></fieldOptionSettings>
                </div>
                <div v-if="field.element == 'input_radio'">
                    <fieldOptionSettings :field="field" :child-fields="inputRadioChildFields"></fieldOptionSettings>
                </div>
                <template v-else>
                    <fieldOptionSettings :child-fields="inputChildFields" :field="field"></fieldOptionSettings>
                </template>
            </div>

        </div>
    </div>
</template>

<script type="text/babel">
    import elLabel from '../../includes/el-label.vue'

    import fieldOptionSettings from './fieldOptionSettings.vue'
    import validationRules from './validationRules.vue'

    export default {
        name: 'customRepeaterFields',
        props: ['listItem', 'editItem'],
        components: {
            fieldOptionSettings,
            validationRules,
            elLabel
        },
        data() {
            return {
                available_elements: {
                    'input_text': 'Text Field',
                    'input_email': 'Email Field',
                    'input_number': 'Numeric Field',
                    'select': 'Select Field',
                    'input_mask': 'Input Mask Field',
                    'input_radio': 'Radio Field'
                },
                elementMaps: {
                    input_text: 'text',
                    input_email: 'email',
                    input_number: 'number',
                    select: 'select',
                    input_mask: 'text',
                    input_radio: 'radio'
                },
                inputChildFields: ['label', 'value', 'placeholder'],
                selectChildFields: ['label', 'placeholder', 'advanced_options'],
                inputMaskChildFields: ['label', 'value', 'placeholder', 'temp_mask', 'data-mask', 'data-mask-reverse', 'temp_mask_list'],
                inputRadioChildFields: ['label', 'dynamic_default_value', 'display_type', 'layout_class', 'layout_class_list', 'randomize_options', 'advanced_options']
            }
        },
        methods: {
            changeFieldType(field, index) {
                let newCopy = this.getTypeSettings(field.element);
                newCopy.settings.label = field.settings.label;
                let freshCopy = _ff.cloneDeep(newCopy);
                this.$set(this.editItem.fields, index, freshCopy);
            },
            getTypeSettings(element) {
                let item = {
                    'element': element,
                    'attributes': {
                        'type': this.elementMaps[element],
                        'value': '',
                        'placeholder': '',
                        'data-mask': ''
                    },
                    'settings': {
                        'label': 'Column 1',
                        'help_message': '',
                        'validation_rules': {
                            required: {
                                'value': false,
                                'message': 'This field is required'
                            }
                        }
                    },
                    'editor_options': {}
                };

                if (element == 'input_email') {
                    item.settings.validation_rules.email = {
                        value: true,
                        message: 'This field must contain a valid email'
                    };
                }

                if (element == 'select') {
                    item.settings.advanced_options = [
                        {
                            label: 'Option 1',
                            value: 'Option 1'
                        },
                        {
                            label: 'Option 2',
                            value: 'Option 2'
                        }
                    ];
                }

                if (element == 'input_mask') {
                    item.settings.temp_mask = '';
                    item.settings['data-mask-reverse'] = 'no';
                    item.settings['data-clear-if-not-match'] = 'no';
                    item.settings.temp_mask_list = [
                        {
                            label: 'None',
                            value: ''
                        },
                        {
                            label: '(###) ###-####',
                            value: '(000) 000-0000'
                        },
                        {
                            label: '(##) ####-####',
                            value: '(00) 0000-0000'
                        },
                        {
                            label: '23/03/2018',
                            value: '00/00/0000'
                        },
                        {
                            label: '23:59:59',
                            value: '00:00:00'
                        },
                        {
                            label: '23/03/2018 23:59:59',
                            value: '00/00/0000 00:00:00'
                        },
                        {
                            label: 'Custom',
                            value: 'custom'
                        }
                    ];
                }

                if (element == 'input_radio') {
                    item.settings.dynamic_default_value = '';
                    item.settings.layout_class_list = [
                        {
                            image: '',
                            label: 'Default',
                            value: ''
                        },
                        {
                            image: '',
                            label: 'Inline Layout',
                            value: 'ff_list_inline'
                        },
                        {
                            image: '',
                            label: 'Button Type Styles',
                            value: 'ff_list_buttons'
                        },
                        {
                            image: '',
                            label: '2-Column Layout',
                            value: 'ff_list_2col'
                        },
                        {
                            image: '',
                            label: '3-Column Layout',
                            value: 'ff_list_3col'
                        },
                        {
                            image: '',
                            label: '4-Column Layout',
                            value: 'ff_list_4col'
                        },
                        {
                            image: '',
                            label: '5-Column Layout',
                            value: 'ff_list_5col'
                        }
                    ];

                    item.settings.advanced_options = [
                        {
                            image: '',
                            label: 'Option 1',
                            value: 'Option 1'
                        },
                        {
                            image: '',
                            label: 'Option 2',
                            value: 'Option 2'
                        }
                    ];
                }

                return item;
            },
            highlightEl(el) {
                jQuery(el).addClass('highlighted').delay(1000).queue(function (next) {
                    jQuery(this).removeClass('highlighted');
                    next();
                });
            },
            increase(index) {
                const newCol = _ff.cloneDeep(this.getTypeSettings('input_text'));
                newCol.settings.label = `Column ${ this.editItem.fields.length + 1 }`;
                this.editItem.fields.splice(index + 1, 0, newCol);
                //  this.editItem.fields.push(newCol);
            },
            decrease(index) {
                if (this.editItem.fields.length > 1) {
                    this.editItem.fields.splice(index, 1);
                } else {
                    this.highlightEl(this.$refs.highlight);

                    this.$notify.error({
                        title: this.$t('Oops!'),
                        message: this.$t('The last item can not be deleted.'),
                        offset: 30
                    });
                }
            },
            toggleAddressFieldInputs(event) {
                if (!jQuery(event.target).closest('.address-field-option').find('.address-field-option__settings').hasClass('is-open')) {
                    jQuery(event.target).closest('.address-field-option').find('.address-field-option__settings').addClass('is-open');
                    jQuery(event.target).closest('.address-field-option').find('.required-checkbox').addClass('is-open');
                } else {
                    jQuery(event.target).closest('.address-field-option').find('.address-field-option__settings').removeClass('is-open');
                    jQuery(event.target).closest('address-field-option').find('.required-checkbox').removeClass('is-open');
                }
            }
        }
    }
</script>
