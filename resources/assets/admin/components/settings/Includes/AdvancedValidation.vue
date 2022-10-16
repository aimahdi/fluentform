<template>
    <div class="ff_advanced_validation_wrapper">
        <el-form :data="settings" label-width="205px" label-position="left">
            <el-form-item>
                <template slot="label">
                    Status
                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <p>
                                {{ $t('Enable / Disable Advanced Form Validation Rules.') }}
                            </p>
                        </div>
                        <i class="el-icon-info el-text-info" />
                    </el-tooltip>
                </template>
                <filter-fields :labels="labels" :disabled="!hasPro" :conditionals="settings" :fields="inputs"></filter-fields>
            </el-form-item>
            <template v-if="settings.status">
                <el-form-item>
                    <template slot="label">
                        {{ $t('Validation Type') }}
                        <el-tooltip class="item" placement="bottom-start" effect="light">
                            <div slot="content">
                                <p>
                                    {{ $t('Please select how the validation will apply.') }}
                                </p>
                            </div>
                            <i class="el-icon-info el-text-info" />
                        </el-tooltip>
                    </template>
                    <el-radio-group v-model="settings.validation_type">
                        <el-radio v-for="(result_type, typeName) in result_types" :key="typeName" :label="typeName">{{result_type}}</el-radio>
                    </el-radio-group>
                    <br />
                    <p v-if="settings.validation_type == 'fail_on_condition_met'">{{
                            $t('Based on your selection, submission ')}}<b>{{ $t('will be rejected ') }}</b> {{ $t('if ') }} {{ settings.type }} {{ $t('conditions are met') }}</p>
                    <p v-else>{{ $t('Based on your selection, submission ') }}<b>{{ $t('will be valid ') }}</b> {{ $t('if ') }} {{settings.type}} {{ $t('conditions are met') }}</p>
                </el-form-item>
                <el-form-item>
                    <template slot="label">
                        {{ $t('Error Message') }}
                        <el-tooltip class="item" placement="bottom-start" effect="light">
                            <div slot="content">
                                <p>
                                    {{ $t('Please write the error message if the form submission get invalid.') }}
                                </p>
                            </div>
                            <i class="el-icon-info el-text-info" />
                        </el-tooltip>
                    </template>
                    <el-input :placeholder="$t('Error Message on Failed submission')" type="textarea" v-model="settings.error_message"/>
                </el-form-item>
            </template>
        </el-form>
    </div>
</template>
<script type="text/babel">
    import FilterFields from './FilterFields.vue';
    export default {
        name: 'ExportDefaults',
        components: {
            FilterFields
        },
        props: ['settings', 'inputs'],
        data() {
            return {
                labels: {
                    status_label: 'Enabled Advanced Form Validation',
                    notification_if_start: 'Proceed/Fail form submission if',
                    notification_if_end: 'of the following match:'
                },
                hasPro: !!window.FluentFormApp.hasPro,
                result_types: {
                    fail_on_condition_met: 'Fail the submission if conditions met',
                    success_on_condition_met: 'Let Submit the form if conditions are met'
                }
            }
        }
    }
</script>
