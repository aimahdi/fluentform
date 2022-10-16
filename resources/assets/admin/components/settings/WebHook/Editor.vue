<template>
    <el-form v-if="editing_item" label-position="left" label-width="205px">
        <!--Name-->
        <el-form-item required>
            <template slot="label">
                {{ $t('Name') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Name') }}</h3>
                        <p>{{ $t('Enter a feed name to uniquely identify this setup.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <el-input v-model="editing_item.name" :placeholder="$t('WebHook Feed Name')"></el-input>
            <error-view field="name" :errors="errors"></error-view>
        </el-form-item>

        <!--Request URL-->
        <el-form-item required>
            <template slot="label">
                {{ $t('Request URL') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request URL') }}</h3>
                        <p>{{ $t('Enter the URL to be used in the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <el-input v-model="editing_item.request_url" :placeholder="$t('WebHook URL')"></el-input>
            <error-view field="request_url" :errors="errors"></error-view>
        </el-form-item>

        <!--Request Method-->
        <el-form-item>
            <template slot="label">
                {{ $t('Request Method') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request Method') }}</h3>
                        <p>{{ $t('Select the HTTP method used for the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <el-select v-model="editing_item.request_method">
                <el-option
                v-for="method in request_methods"
                :value="method"
                :label="method"
                :key="method"
                ></el-option>
            </el-select>
        </el-form-item>

        <!--Request Format-->
        <el-form-item>
            <template slot="label">
                {{ $t('Request Format') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request Format') }}</h3>
                        <p>{{ $t('Select the format for the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <el-select v-model="editing_item.request_format">
                <el-option
                v-for="format in ['FORM', 'JSON']"
                :value="format"
                :label="format"
                :key="format"
                ></el-option>
            </el-select>
        </el-form-item>

        <!--Request Header-->
        <el-form-item>
            <template slot="label">
                {{ $t('Request Header') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request Header') }}</h3>
                        <p>{{ $t('Select with headers if any headers should be sent with the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <template>
                <el-radio v-model="editing_item.with_header" label="nop">{{ $t('No Headers') }}</el-radio>
                <el-radio v-model="editing_item.with_header" label="yup">{{ $t('With Headers') }}</el-radio>
            </template>
            <error-view field="with_header" :errors="errors"></error-view>
        </el-form-item>

        <!--Request Headers-->
        <el-form-item required v-if="editing_item.with_header=='yup'">
            <template slot="label">
                {{ $t('Request Headers') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request Headers') }}</h3>
                        <p>{{ $t('Setup the HTTP headers to be sent with the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <table width="100%">
                <thead>
                    <tr>
                        <th class="text-left" width="50%">{{ $t('Header Name') }}</th>
                        <th class="text-left">{{ $t('Header Value') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(headerValue, headerKey) in editing_item.request_headers">
                        <td>
                            <el-select
                            clearable
                            style="width:80%"
                            :placeholder="$t('Select Header')"
                            v-model="editing_item.request_headers[headerKey].key"
                            v-if="!editing_item.custom_header_keys[headerKey]"
                            @change="addCustomHeaderKeyInput(headerKey, $event)">
                                <el-option
                                v-for="(header, index) in request_headers"
                                :value="header.value"
                                :label="header.label"
                                :key="index"
                                ></el-option>
                            </el-select>

                            <el-input
                            style="width:81%"
                            :placeholder="$t('Enter Custom Header')"
                            v-if="editing_item.custom_header_keys[headerKey]"
                            v-model="editing_item.request_headers[headerKey].key">
                                <el-button
                                slot="append"
                                icon="el-icon-close"
                                @click="hideCustomHeaderKeyInput(headerKey)"></el-button>
                            </el-input>
                        </td>
                        <td>
                            <el-select
                            clearable
                            style="width:80%"
                            :placeholder="$t('Select Value')"
                            class="action-add-field-select"
                            v-if="!editing_item.custom_header_values[headerKey]"
                            v-model="editing_item.request_headers[headerKey].value"
                            @change="addCustomHeaderValueInput(headerKey, $event)">
                                <el-option-group
                                v-for="group in getHeaderShortCodes(headerKey)"
                                :key="group.title"
                                :label="group.title">
                                    <el-option
                                    v-if="index!='{all_data}'"
                                    v-for="(value, index) in group.shortcodes"
                                    :value="index"
                                    :label="value"
                                    :key="index"
                                    ></el-option>
                                </el-option-group>
                            </el-select>

                            <el-input
                            style="width:81%"
                            :placeholder="$t('Enter Value')"
                            v-if="editing_item.custom_header_values[headerKey]"
                            v-model="editing_item.request_headers[headerKey].value">
                                <el-button
                                slot="append"
                                icon="el-icon-close"
                                @click="hideCustomHeaderValueInput(headerKey)"></el-button>
                            </el-input>

                            <span class="action-add-field-row">
                                <i
                                @click="addHeaderRow(headerKey)"
                                style="cursor:pointer"
                                class="el-icon-circle-plus el-text-success"></i>

                                <i
                                @click="removeHeaderRow(headerKey)"
                                style="cursor:pointer"
                                class="el-icon-circle-close el-text-danger"
                                v-if="editing_item.request_headers.length > 1"></i>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <error-view :errors="errors" field="headers"></error-view>
        </el-form-item>

        <!--Request Body-->
        <el-form-item required>
            <template slot="label">
                {{ $t('Request Body') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request Body') }}</h3>
                        <p>{{ $t('Select if all fields or select fields should be sent with the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <template>
                <el-radio v-model="editing_item.request_body" label="all_fields">{{ $t('All Fields') }}</el-radio>
                <el-radio v-model="editing_item.request_body" label="selected_fields">{{ $t('Selected Fields') }}</el-radio>
            </template>
            <error-view field="request_body" :errors="errors"></error-view>
        </el-form-item>

        <!--Request Fields-->
        <el-form-item required v-if="editing_item.request_body=='selected_fields'">
            <template slot="label">
                {{ $t('Request Fields') }}
                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Request Fields') }}</h3>
                        <p>{{ $t('Setup the fields to be sent in the webhook request.') }}</p>
                    </div>
                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </template>

            <table width="100%">
                    <thead>
                        <tr>
                            <th class="text-left" width="50%">{{ $t('Field Name') }}</th>
                            <th class="text-left">{{ $t('Field Value') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(mappedField, mappedKey) in editing_item.fields">
                            <td>
                                <el-input
                                clearable
                                style="width:80%"
                                v-model="editing_item.fields[mappedKey].key"
                                :placeholder="$t('Enter Name')"></el-input>
                            </td>
                            <td>
                                <div>
                                    <el-select
                                    filterable
                                    allow-create
                                    class="action-add-field-select"
                                    style="width:80%"
                                    v-model="editing_item.fields[mappedKey].value"
                                    :placeholder="$t('Select Value')">
                                        <el-option-group
                                        v-for="group in editor_Shortcodes"
                                        :key="group.title"
                                        :label="group.title">
                                            <el-option
                                            v-if="index!='{all_data}'"
                                            v-for="(value, index) in group.shortcodes"
                                            :value="index"
                                            :label="value"
                                            :key="index"
                                            ></el-option>
                                        </el-option-group>
                                    </el-select>

                                    <span class="action-add-field-row">
                                        <i
                                        @click="addFieldRow(mappedKey)"
                                        style="cursor:pointer"
                                        class="el-icon-circle-plus el-text-success"></i>

                                        <i
                                        @click="removeFieldRow(mappedKey)"
                                        style="cursor:pointer"
                                        class="el-icon-circle-close el-text-danger"
                                        v-if="editing_item.fields.length > 1"></i>
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
            </table>

            <error-view field="fields" :errors="errors"></error-view>
        </el-form-item>

        <!-- Conditional Logics -->
            <el-form-item>
                <template slot="label">
                    {{ $t('Conditional Logics') }}

                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <h3>{{ $t('Conditional Logics') }}</h3>

                            <p>{{ $t('Allow WebHook to take action conditionally') }}</p>
                        </div>

                        <i class="el-icon-info el-text-info" />
                    </el-tooltip>
                </template>

                <FilterFields
                :fields="fields"
                :disabled="!has_pro"
                :conditionals="editing_item.conditionals"/>

            </el-form-item>
            
            <el-button :loading="saving" @click="saveWebHook" type="primary">
                <span v-if="selected_id">{{ $t('Update WebHook Feed') }}</span>
                <span v-else>{{ $t('Create WebHook Feed') }}</span>
            </el-button>

    </el-form>
</template>

<script>
    import Errors from "../../../../common/Errors";
    import inputPopover from '../../input-popover.vue';
    import ErrorView from '../../../../common/errorView';
    import FilterFields from '../Includes/FilterFields.vue';

    export default {
        name: 'Editor',
        components: {
            ErrorView,
            inputPopover,
            FilterFields
        },
        props: {
            ajax_actions: {
                type: Object,
                required: true
            },
            selected_index: {
              default() {
                  return 1;
              }  
            },
            form_id: {
                required: true
            },
            selected_id: {
              default() {
                  return 0;
              }
            },
            setSelectedId: {
                type: Function,
                required: true
            },
            edit_item: {
               default() {
                  return null;
              }  
            },
            fields: {
                type: Object,
                required: true
            },
            request_headers: {
                type: Array,
                required: true
            },
            has_pro: {
                type: Boolean,
                default: false
            },
            editor_Shortcodes: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                request_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                header_shortcodes: [],
                errors: new Errors(),
                editing_item: false,
                saving: false
            }
        },
        methods: {
            saveWebHook() {
                this.saving = true;

                let data = {
                    form_id: this.form_id,
                    notification_id: this.selected_id,
                    action: this.ajax_actions.saveFeed,
                    notification: JSON.stringify(this.editing_item)
                };

                this.errors.record({});
                FluentFormsGlobal.$post(data)
                .then(response => {
                    this.setSelectedId(response.data.notification_id);
                    this.$notify.success({
                        offset: 30,
                        title: 'Success!',
                        message: response.data.message
                    });
                })
                .fail(error => {
                    this.errors.record(error.responseJSON.data.errors);
                    this.$notify.error({
                        offset: 30,
                        title: 'Oops!',
                        message: error.responseJSON.data.message
                    });
                })
                .always(() => this.saving = false);
            },
            loadApp() {
                if (this.edit_item) {
                    this.editing_item = Object.assign({}, this.editing_item, this.edit_item);
                    for (let i = 0, l = this.editing_item.request_headers.length; i < l; i++) {
                        this.header_shortcodes[i] = this.cloneheaderShortCodes();
                        this.addCustomHeaderKeyInput(i, this.editing_item.request_headers[i].key);
                    }
                } else {
                    this.header_shortcodes[0] = this.headerShortCodes;
                    this.editing_item = {
                        name: '',
                        request_url: '',
                        with_header: 'nop',
                        request_method: 'GET',
                        request_format: 'FORM',
                        request_body: 'all_fields',
                        custom_header_keys: [false],
                        custom_header_values: [false],
                        fields: [{key:null, value:null}],
                        request_headers: [{key: null, value: null}],
                        conditionals: {
                            status: false,
                            type: 'all',
                            conditions: [
                                {
                                    field: null,
                                    operator: '=',
                                    value: null
                                }
                            ]
                        },
                        enabled: true
                    };
                }
            },
            addFieldRow(mapIndex) {
                let index = mapIndex + 1;
                this.editing_item.fields.splice(index, 0, {
                    key: null,
                    value: null
                });
            },
            removeFieldRow(mapIndex) {
                this.editing_item.fields.splice(mapIndex, 1);
            },
            addHeaderRow(headerKey) {
                let index = headerKey + 1;
                this.editing_item.request_headers.splice(index, 0, {
                    key: null,
                    value: null
                });
                this.editing_item.custom_header_keys.splice(index, 0, false);
                this.editing_item.custom_header_values.splice(index, 0, false);

                this.header_shortcodes[index] = this.cloneheaderShortCodes();
            },
            removeHeaderRow(headerKey) {
                this.editing_item.request_headers.splice(headerKey, 1);
                this.editing_item.custom_header_keys.splice(headerKey, 1);
                this.editing_item.custom_header_values.splice(headerKey, 1);

                this.header_shortcodes.splice(headerKey, 1);
            },
            addCustomHeaderKeyInput(headerKey, val) {
                let header;
                if (val == '__webhook_custom_header__') {
                    this.editing_item.custom_header_keys[headerKey] = true;
                    this.editing_item.request_headers[headerKey].key = null;
                } else if (header = this.request_headers.find(h => h.value == val)) {
                    if (header.hasOwnProperty('possible_values')) {
                        let shortcodes = this.cloneheaderShortCodes();
                        shortcodes.unshift(header.possible_values);
                        this.header_shortcodes[headerKey] = shortcodes;
                    } else {
                        this.header_shortcodes[headerKey] = this.cloneheaderShortCodes();
                    }
                } else {
                    this.header_shortcodes[headerKey] = this.cloneheaderShortCodes();
                }
            },
            hideCustomHeaderKeyInput(headerKey) {
                this.editing_item.custom_header_keys.splice(headerKey, 1, false);
                this.editing_item.request_headers[headerKey].key = null;
            },
            addCustomHeaderValueInput(headerKey, val) {
                if (val == '__webhook_custom_header_value__') {
                    this.editing_item.custom_header_values[headerKey] = true;
                    this.editing_item.request_headers[headerKey].value = null;
                }
            },
            hideCustomHeaderValueInput(headerKey) {
                this.editing_item.custom_header_values.splice(headerKey, 1, false);
                this.editing_item.request_headers[headerKey].value = null;
            },
            getHeaderShortCodes(headerKey) {
                return this.header_shortcodes[headerKey];
            },
            cloneheaderShortCodes() {
                return this.headerShortCodes.map(item => Object.assign({}, item));
            }
        },
        computed: {
            headerShortCodes() {
                // Get a copy of editor_Shortcodes (An array of objects)
                let shortCodes = this.editor_Shortcodes.map(o => Object.assign({}, o));
                shortCodes.push({title:'', shortcodes:{
                    '__webhook_custom_header_value__': 'Add Custom Value'
                }});
                return shortCodes;
            }
        },
        mounted() {
            this.loadApp();
        }
    }
</script>


