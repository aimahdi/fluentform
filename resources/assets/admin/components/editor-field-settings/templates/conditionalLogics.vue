<template>
    <div>
        <!-- ADDITIONAL OPTIONS : CONDITIONAL LOGIC -->
        <el-form-item>
            <elLabel slot="label" :label="listItem.label" :helpText="listItem.help_text"></elLabel>
            <el-radio v-model="conditional_logics.status" :label="true">{{ $t('Yes') }}</el-radio>
            <el-radio v-model="conditional_logics.status" :label="false">{{ $t('No') }}</el-radio>
        </el-form-item>

        <template v-if="conditional_logics.status">
            <el-form-item>
                <elLabel slot="label" :label="$t('Condition Match')"
                         :helpText="$t('Select to match whether all rules are required or any. if the match success then the field will be shown')"></elLabel>

                <el-radio v-model="conditional_logics.type" label="any">{{ $t('Any') }}</el-radio>
                <el-radio v-model="conditional_logics.type" label="all">{{ $t('All') }}</el-radio>
            </el-form-item>

            <div v-for="(condition, i) in conditional_logics.conditions" :key="i" class="conditional-logic">
                <select
                        v-model="condition.field"
                        @change="condition.value = ''"
                        :placeholder="$t('Select')"
                        class="condition-field"
                >
                    <option value="" disabled>- Select -</option>
                    <option v-for="(dep, meta, i) in dependencies"
                            v-if="meta != editItem.attributes.name"
                            :key="i"
                            :value="meta">{{ dep.field_label || meta }}
                    </option>
                </select>
                <select v-model="condition.operator" :placeholder="$t('Select')" class="condition-operator">
                    <option value="" disabled>- {{ $t('Select') }} -</option>
                    <option value="=">{{ $t('equal') }}</option>
                    <option value="!=">{{ $t('not equal') }}</option>

                    <template
                            v-if="condition.field && (!dependencies[condition.field] || !dependencies[condition.field].options)">
                        <option value=">">{{ $t('greater than') }}</option>
                        <option value="<">{{ $t('less than') }}</option>
                        <option value=">=">{{ $t('greater than or equal') }}</option>
                        <option value="<=">{{ $t('less than or equal') }}</option>
                        <option value="contains">{{ $t('includes') }}</option>
                        <option value="doNotContains">{{ $t('not includes') }}</option>
                        <option value="startsWith">{{ $t('starts with') }}</option>
                        <option value="endsWith">{{ $t('ends with') }}</option>
                        <option value="test_regex">{{ $t('Regex match') }}</option>
                    </template>
                </select>

                <template v-if="condition.field">
                    <input
                            v-if="!dependencies[condition.field] ||!dependencies[condition.field].options"
                            class="form-control-2 condition-value"
                            type="text"
                            v-model="condition.value"
                    >
                    <select v-else-if="dependencies[condition.field] && dependencies[condition.field].options"
                            v-model="condition.value" :placeholder="$t('Select')" class="condition-value">
                        <option value="" selected >- {{ $t('Select') }} -</option>
                        <option v-for="(label, key, i) in dependencies[condition.field].options"
                                :key="key"
                                :value="key">{{ label }}
                        </option>
                    </select>
                </template>

                <!-- JUST A PLACEHOLDER -->
                <select v-else class="condition-value">
                    <option value="" disabled selected>- {{ $t('Select') }} -</option>
                </select>

                <div class="action-btn">
                    <i @click.prevent="conditional_logics.conditions.pushAfter(i, emptyRules)"
                       class="icon icon-plus-circle"></i>
                    <i @click.prevent="decreaseLogic(i)" class="icon icon-minus-circle"></i>
                </div>
            </div>
        </template>

        <el-dialog
                width="30%"
                top="30%"
                style="text-align: center;"
                :visible.sync="showPreventMessage">
            <span>{{ $t('You have to have at least one item here.') }}</span>
            <div style="margin-top: 20px;">
                <el-button @click="showPreventMessage = false">{{ $t('Close') }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import elLabel from '../../includes/el-label.vue'
    import each from "lodash/each";

    export default {
        name: 'conditionalLogics',
        props: ['listItem', 'editItem', 'form_items'],
        components: {
            elLabel
        },
        data() {
            return {
                inputs: null,
                conditionalSupportedFields: [
                    'input_hidden',
                    'address',
                    'input_name',
                    'select',
                    'ratings',
                    'net_promoter',
                    'textarea',
                    'input_url',
                    'input_text',
                    'input_date',
                    'input_email',
                    'input_radio',
                    'input_number',
                    'select_country',
                    'input_checkbox',
                    'input_password',
                    'terms_and_condition',
                    'gdpr_agreement',
                    'phone',
                    'rangeslider',
                    'net_promoter_score',
                    'post_title',
                    'post_content',
                    'post_excerpt',
                    'taxonomy',
                    'input_image',
                    'input_file',
                    'chained_select',
                    'payment_method',
                    'custom_payment_component',
                    'multi_payment_component',
                    'item_quantity_component',
                    'cpt_selection',
                    'subscription_payment_component'
                ],
                showPreventMessage: false,
                emptyRules: { field: '', value: '', operator: '' }
            }
        },
        computed: {
            conditional_logics: {
                get() {
                    return this.editItem.settings.conditional_logics;
                },
                set(defaultObj) {
                    this.editItem.settings.conditional_logics = defaultObj;
                }
            },

            /**
             * Conditions of one element can possibly
             * depend on those elements
             * @return {Object}
             */
            dependencies() {
                let dependencies = {};
                this.mapElements(this.form_items, (formItem) => {
                    if (this.conditionalSupportedFields.includes(formItem.element)) {
                        if (this.editItem.uniqElKey != formItem.uniqElKey) {
                            if (['terms_and_condition', 'gdpr_agreement'].includes(formItem.element)) {
                                dependencies[formItem.attributes.name] = {
                                    options: {'on': 'Checked'},
                                    field_label: formItem.settings.label
                                }
                            } else if (['address', 'input_name'].includes(formItem.element)) {
                                this.mapElements(formItem.fields, item => {
                                    if (item.settings.visible) {
                                        let name = formItem.attributes.name + '[' + item.attributes.name + ']';
                                        dependencies[name] = {
                                            options: item.options,
                                            field_label: formItem.attributes.name + '[' + item.settings.label + ']'
                                        };
                                        if (item.element == 'select_country') {
                                            dependencies[name]['options'] = window.FluentFormApp.countries;
                                        }
                                    }
                                });
                            } else if (formItem.element === 'chained_select') {
                                this.mapElements(formItem.settings.data_source.headers, item => {
                                    let name = formItem.attributes.name + '[' + item + ']';
                                    dependencies[name] = {
                                        options: formItem.options || null,
                                        field_label: formItem.attributes.name + '[' + item + ']'
                                    };
                                });
                            } else if (formItem.element == 'select_country') {
                                dependencies[formItem.attributes.name] = {
                                    options: window.FluentFormApp.countries,
                                    field_label: formItem.settings.label
                                };
                            } else if (['input_radio', 'select', 'input_checkbox'].includes(formItem.element)) {
                                let options = formItem.options;
                                if (!options) {
                                    options = {};
                                    each(formItem.settings.advanced_options, (optionItem) => {
                                        options[optionItem.value] = optionItem.label;
                                    });
                                }
                                dependencies[formItem.attributes.name] = {
                                    options: options,
                                    field_label: formItem.settings.label
                                }
                            } else if (formItem.element == 'payment_method') {
                                let options = {};
                                each(formItem.settings.payment_methods, (optionItem, itemName) => {
                                    options[itemName] = optionItem.title;
                                });
                                dependencies[formItem.attributes.name] = {
                                    options: options,
                                    field_label: formItem.settings.label
                                }
                            } else if (formItem.element == 'multi_payment_component') {
                                if (formItem.attributes.type == 'single') {
                                    dependencies[formItem.attributes.name] = {
                                        options: null,
                                        field_label: formItem.settings.label
                                    }
                                } else {
                                    let options = {};
                                    each(formItem.settings.pricing_options, (optionItem) => {
                                        options[optionItem.label] = optionItem.label;
                                    });

                                    dependencies[formItem.attributes.name] = {
                                        options: options,
                                        field_label: formItem.settings.label
                                    }
                                }
                            } else {
                                if (formItem.attributes.name) {
                                    dependencies[formItem.attributes.name] = {
                                        options: formItem.options || null,
                                        field_label: formItem.settings.label
                                    }
                                }
                            }
                        }
                    }
                });

                return dependencies;
            }
        },
        methods: {
            decreaseLogic(index) {
                if (this.conditional_logics.conditions.length > 1) {
                    return this.conditional_logics.conditions.splice(index, 1);
                }
                this.conditional_logics.conditions = [this.emptyRules];
            },
            bootConditionals() {
                if (_ff.isEmpty(this.conditional_logics)) {
                    this.conditional_logics = {
                        type: 'any',
                        status: false,
                        conditions: [this.emptyRules]
                    };
                }
                if (!this.conditional_logics.conditions.length) {
                    this.conditional_logics.conditions.push(this.emptyRules);
                }
            }
        },
        beforeMount() {
            this.bootConditionals();
            FluentFormEditorEvents.$on('onElRemoveSuccess', () => {
                if (!this.conditional_logics.conditions.length) {
                    this.conditional_logics.conditions.push(this.emptyRules);
                }
            });
        }
    }
</script>
