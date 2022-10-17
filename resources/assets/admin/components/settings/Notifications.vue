<template>
    <div>
        <el-row class="setting_header">
            <el-col :md="12">
                <h2>{{ $t('Email Notifications') }}</h2>
            </el-col>

            <!--Save settings-->
            <el-col :md="12" class="action-buttons clearfix mb15 text-right">
                <template v-if="selected">
                    <el-button @click="discard"
                               icon="el-icon-arrow-left"
                               size="small"
                    >
                        {{ $t('Back') }}
                    </el-button>
                    <video-doc route_id="conditionalEmailSettings"></video-doc>
                </template>
                <template v-else>
                    <el-button @click="add" type="primary"
                               size="small" icon="el-icon-plus"
                    >{{ $t('Add Notification') }}
                    </el-button>
                    <video-doc route_id="formEmailSettings"></video-doc>
                </template>
            </el-col>
        </el-row>

        <template v-if="!selected">
            <!-- Notification Table: 1 -->
            <el-table v-loading="loading"
                      :element-loading-text="$t('Fetching Notifications...')"
                      :data="notifications"
                      stripe
                      class="el-fluid">

                <el-table-column width="80">
                    <template slot-scope="scope">
                        <el-switch active-color="#13ce66" @change="handleActive(scope.$index)"
                                   v-model="scope.row.value.enabled"
                        ></el-switch>
                    </template>
                </el-table-column>

                <el-table-column width="100" :label="$t('Status')">
                    <template slot-scope="scope">
                        <span v-if="scope.row.value.enabled">Enabled</span>
                        <span v-else style="color:#fa3b3c;">{{ $t('Disabled') }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="value.name" :label="$t('Name')"></el-table-column>

                <el-table-column prop="value.subject" :label="$t('Subject')"></el-table-column>

                <el-table-column width="160" :label="$t('Actions')" class-name="action-buttons">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="light" :content="$t('Duplicate notification settings')" placement="top">
                            <el-button @click="clone(scope.$index)" type="success"
                                       icon="el-icon-plus" size="mini"
                            ></el-button>
                        </el-tooltip>

                        <el-button @click="edit(scope.$index)" type="primary"
                                   icon="el-icon-setting" size="mini"
                        ></el-button>

                        <remove @on-confirm="remove(scope.$index, scope.row.id)"></remove>
                    </template>
                </el-table-column>
            </el-table>

            <div style="margin-top: 50px;" v-if="!has_fluentsmtp && !smtp_closed" class="ff_smtp_suggest">
                <span @click="closeSmtp()" class="ff_smtp_close">x</span>
                <p>{{ $t('For better email deliverability, we recommend to use FluentSMTP Plugin(completely free & Opensource). FluentSMTP connects with your Email Service Provider natively and makes sure your emails including form notifications are being delivered ') }} 💯. {{ $t('Built by Fluent Forms devs for you.') }}</p>
                <a class="el-button el-button--info el-button--small" :href="smtp_page_url">{{ $t('Setup SMTP') }}</a>
            </div>

        </template>


        <!-- Notification Editor -->
        <el-form v-else-if="selected" label-width="205px" label-position="left">

            <!--Notification name-->
            <el-form-item :label="$t('Name')">
                <el-input v-model="selected.value.name"></el-input>
            </el-form-item>

            <!--send to-->
            <el-form-item class="is-required" :class="errors.has('sendTo.type') ? 'is-error' : ''">
                <template slot="label">
                    {{ $t('Send To') }}

                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <h3>{{ $t('Send To Email Address') }}</h3>

                            <p>
                                {{ $t('Enter the email address you would like') }} <br>
                                {{ $t('the notification email sent to.') }}
                            </p>
                        </div>

                        <i class="el-icon-info el-text-info"></i>
                    </el-tooltip>
                </template>

                <el-radio-group v-model="selected.value.sendTo.type">
                    <el-radio label="email">{{ $t('Enter Email') }}</el-radio>
                    <el-radio label="field">{{ $t('Select a Field') }}</el-radio>
                    <el-radio v-if="!!has_pro" label="routing">
                        {{ $t('Configure Routing') }}
                        <el-tooltip class="item" placement="bottom-start" effect="light">
                            <div slot="content">
                                <h3>{{ $t('Routing') }}</h3>

                                <p>
                                    {{ $t('Allows notification to be sent to different email ') }}<br>
                                    {{ $t('addresses depending on values selected in the form.') }}
                                </p>
                            </div>

                            <i class="el-icon-info el-text-info"></i>
                        </el-tooltip>
                    </el-radio>
                </el-radio-group>

                <error-view field="sendTo.type" :errors="errors"></error-view>
            </el-form-item>

            <!--additional field based on the send to selection-->
            <template v-if="selected.value.sendTo.type === 'email'">
                <el-form-item :label="$t('Send to Email')" class="conditional-items"
                              :class="errors.has('sendTo.email') ? 'is-error' : ''"
                >
                    <el-input v-model="selected.value.sendTo.email"></el-input>

                    <error-view field="sendTo.email" :errors="errors"></error-view>
                </el-form-item>
            </template>

            <template v-else-if="selected.value.sendTo.type ==='field'">
                <el-form-item :label="('Send to Field')" class="conditional-items"
                              :class="errors.has('sendTo.field') ? 'is-error' : ''"
                >
                    <el-select v-model="selected.value.sendTo.field" :placeholder="$t('Select an email field')">
                        <el-option
                            v-for="(item, index) in emailFields"
                            :key="index"
                            :label="item.admin_label"
                            :value="item.attributes.name">
                        </el-option>
                    </el-select>

                    <error-view field="sendTo.field" :errors="errors"></error-view>
                </el-form-item>
            </template>

            <div class="conditional-items" v-else-if="selected.value.sendTo.type == 'routing'">
                <routing-filter-fields :fields="inputs"
                                       :routings="selected.value.sendTo.routing"></routing-filter-fields>
                <error-view field="sendTo.routing" :errors="errors"></error-view>
            </div>

            <!--Subject-->
            <el-form-item :label="$t('Subject')" class="is-required" :class="errors.has('subject') ? 'is-error' : ''">

                <input-popover fieldType="text"
                               v-model="selected.value.subject"
                               :data="editorShortcodes"
                ></input-popover>

                <error-view field="subject" :errors="errors"></error-view>
            </el-form-item>

            <!--message-->
            <el-form-item :label="$t('Email Body')" class="is-required" :class="errors.has('message') ? 'is-error' : ''">
                <input-popover :rows="10" v-if="selected.value.asPlainText == 'yes'" fieldType="textarea"
                               v-model="selected.value.message"
                               :placeholder="$t('Email Body HTML')"
                               :data="editorShortcodes"
                ></input-popover>
                <wp_editor
                    v-else
                    :editorShortcodes="emailBodyeditorShortcodes"
                    :height="300"
                    v-model="selected.value.message">
                </wp_editor>
                <error-view field="message" :errors="errors"></error-view>
                <el-checkbox style="margin-bottom: 10px;" true-label="yes" false-label="no" v-model="selected.value.asPlainText">
                    {{ $t('Send Email as RAW HTML Format') }}
                </el-checkbox>
            </el-form-item>

            <!-- FilterFields -->
            <el-form-item>
                <template slot="label">
                    {{ $t('Conditional Logics') }}

                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <h3>{{ $t('Conditional Logics') }}</h3>
                            <p>
                                {{ $t('Allow this feed conditionally') }}
                            </p>
                        </div>

                        <i class="el-icon-info el-text-info"></i>
                    </el-tooltip>
                </template>
                <FilterFields :fields="inputs" :conditionals="selected.value.conditionals"
                              :disabled="!has_pro"></FilterFields>
            </el-form-item>
            <el-form-item v-if="attachmentFields.length && selected.value.attachments">
                <template slot="label">
                    {{ $t('Email Attachments') }}
                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <h3>{{ $t('Email Attachments') }}</h3>
                            <p>
                                {{ $t('Select the field that you want to attach in the email') }}
                            </p>
                        </div>
                        <i class="el-icon-info el-text-info"></i>
                    </el-tooltip>
                </template>

                <el-checkbox-group v-model="selected.value.attachments">
                    <el-checkbox v-for="attachmentField in attachmentFields" :key="attachmentField.attributes.name"
                                 :label="attachmentField.attributes.name">
                        {{attachmentField.admin_label}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <!-- Media Attachments -->
            <el-form-item>
                <template slot="label">
                    {{ $t('Media File Attachments') }}
                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            {{ $t('Add Additional Media File Attachments for the email') }}
                        </div>
                        <i class="el-icon-info el-text-info"></i>
                    </el-tooltip>
                </template>
                <el-button type="primary"
                           :disabled="!has_pro"
                           plain
                           icon="el-icon-upload"
                           size="small"
                           @click="mediaAttachments()"
                >
                    {{$t('Upload')}} <span v-if="!has_pro">{{ $t('(Require Pro Version)') }}</span>
                </el-button>

                <li v-if="selected.value.media_attachments.length" v-for="(attachment,index) in selected.value.media_attachments" :key="index">
                    {{attachment.name}}
                    <span>
                         <el-button type="danger"
                                    plain
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeMediaAttachments(index)"
                         ></el-button>

                    </span>
                </li>

            </el-form-item>

            <el-form-item v-if="pdf_feeds.length">
                <template slot="label">
                    {{ $t('PDF Attachments') }}
                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <h3>{{ $t('PDF Attachments') }}</h3>
                            <p>
                                {{ $t('You can select PDF attachments from your created PDF templates') }}
                            </p>
                        </div>
                        <i class="el-icon-info el-text-info"></i>
                    </el-tooltip>
                </template>

                <el-checkbox-group v-model="selected.value.pdf_attachments">
                    <el-checkbox v-for="feed in pdf_feeds" :key="feed.id" :label="feed.id">{{ feed.label }}
                    </el-checkbox>
                </el-checkbox-group>

            </el-form-item>
            <p v-show="hasAttachment">{{ $t('You should use SMTP so send attachment via email otherwise, It may go to spam') }}</p>

            <el-form-item v-if="hasPaymentField">
                <template slot="label">
                    {{ $t('Send Email') }}
                    <el-tooltip class="item" placement="bottom-start" effect="light">
                        <div slot="content">
                            <h3>{{ $t('Send Email') }}</h3>
                            <p>{{ $t('Please Select when the email will be sent for Payment Forms') }}</p>
                        </div>
                        <i class="el-icon-info el-text-info"></i>
                    </el-tooltip>
                </template>

                    <el-radio-group v-model="selected.value.feed_trigger_event">
                        <el-radio label="payment_success">{{ $t('After Payment Success') }}</el-radio>
                        <el-radio label="payment_form_submit">{{ $t('After Form Submit') }}</el-radio>
                    </el-radio-group>

                <p>{{ $t('Please Note, for offline payment this settings will not work.Pending offline payment form notifications is sent instantly, we will remove this after our next major release, so this settings will also work for offline payments.') }}</p>

            </el-form-item>
            <p><br/></p>
            <el-collapse class="el-collapse-settings" v-model="activeNotificationCollapse">
                <el-collapse-item :title="$t('Advanced')" name="advanced">
                    <!--from name-->
                    <el-form-item>
                        <template slot="label">
                            {{ $t('From Name') }}

                            <el-tooltip class="item" placement="bottom-start" effect="light">
                                <div slot="content">
                                    <h3>{{ $t('From Name') }}</h3>

                                    <p>
                                        {{ $t('Enter the name you would like the notification email ') }}<br>
                                        {{ $t('sent from, or select the name from available name fields.') }}
                                    </p>
                                </div>

                                <i class="el-icon-info el-text-info"></i>
                            </el-tooltip>
                        </template>

                        <input-popover fieldType="text"
                                       v-model="selected.value.fromName"
                                       :data="editorShortcodes"
                        ></input-popover>
                        <p v-if="selected.value.fromName"> {{
                                $t('It will only be visible in the email if \"From Email\" value is available')
                            }}</p>
                    </el-form-item>

                    <!--from email-->
                    <el-form-item>
                        <template slot="label">
                            {{ $t('From Email') }}

                            <el-tooltip class="item" placement="bottom-start" effect="light">
                                <div slot="content">
                                    <h3>{{ $t('From Email Address') }}</h3>
                                    <p>
                                        {{ $t('Enter the email address you would like the ')}}<br>
                                        {{ $t('notification email sent from, or select the ') }}<br>
                                        {{ $t('email from available email form fields.') }}
                                    </p>
                                </div>
                                <i class="el-icon-info el-text-info"></i>
                            </el-tooltip>
                        </template>

                        <input-popover fieldType="text"
                                       v-model="selected.value.fromEmail"
                                       :data="fromEmailShortcodes"
                        ></input-popover>
                        <p v-if="selected.value.fromEmail">{{
                                ('It\'s not recommended to change from email. Please use your domain\'s email / SMTP main email. Otherwise email may failed to send.')
                            }}</p>
                    </el-form-item>

                    <!--reply to-->
                    <el-form-item>
                        <template slot="label">
                            {{ $t('Reply To') }}

                            <el-tooltip class="item" placement="bottom-start" effect="light">
                                <div slot="content">
                                    <h3>{{ $t('Reply To') }}</h3>

                                    <p>
                                        {{ $t('Enter the email address you would like to be ')}}<br>
                                        {{ $t('used as the reply to address for the notification email.') }}
                                    </p>
                                </div>

                                <i class="el-icon-info el-text-info"></i>
                            </el-tooltip>
                        </template>

                        <input-popover fieldType="text"
                                       v-model="selected.value.replyTo"
                                       :data="emailShortcodes"
                        ></input-popover>
                    </el-form-item>

                    <!--BCC-->
                    <el-form-item>
                        <template slot="label">
                            BCC

                            <el-tooltip class="item" placement="bottom-start" effect="light">
                                <div slot="content">
                                    <h3>{{ $t('Blind Carbon Copy Addresses') }}</h3>

                                    <p>
                                        {{ $t('Enter a comma separated list of email addresses ') }}<br>
                                        {{ $t('you would like to receive a BCC of the notification email.') }}
                                    </p>
                                </div>

                                <i class="el-icon-info el-text-info"></i>
                            </el-tooltip>
                        </template>
                        <input-popover fieldType="text"
                                       v-model="selected.value.bcc"
                                       :data="emailShortcodes"
                        ></input-popover>
                    </el-form-item>
                    <!--CC-->
                    <el-form-item>
                        <template slot="label">
                            {{ $t('CC') }}

                            <el-tooltip class="item" placement="bottom-start" effect="light">
                                <div slot="content">
                                    <h3>{{ $t('Carbon Copy Addresses') }}</h3>

                                    <p>
                                        {{ $t('Enter a comma separated list of email addresses ')}}<br>
                                        {{ $t('you would like to receive a CC of the notification email.') }}
                                    </p>
                                </div>

                                <i class="el-icon-info el-text-info"></i>
                            </el-tooltip>
                        </template>

                        <input-popover fieldType="text"
                                       v-model="selected.value.cc"
                                       :data="emailShortcodes"
                        ></input-popover>
                    </el-form-item>
                </el-collapse-item>

            </el-collapse>

            <div class="text-right">
                <el-button
                    :loading="loading"
                    @click="store"
                    size="medium"
                    type="success"
                    icon="el-icon-success">
                    {{loading ? $t('Saving ') : $t('Save ')}} {{ $t('Notification') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script type="text/babel">
import remove from '../confirmRemove.vue';
import inputPopover from '../input-popover.vue';
import wpEditor from '../../../common/_wp_editor';
import FilterFields from './Includes/FilterFields.vue';
import RoutingFilterFields from './Includes/RoutingFilterFields';
import ErrorView from '../../../common/errorView.vue';
import VideoDoc from '@/common/VideoInstruction.vue';

export default {
    name: 'EmailNotifications',
    props: ['form_id', 'inputs', 'has_pro', 'has_pdf', 'editorShortcodes'],
    components: {
        remove,
        inputPopover,
        FilterFields,
        ErrorView,
        'wp_editor': wpEditor,
        RoutingFilterFields,
        VideoDoc
    },
    data() {
        return {
            loading: true,
            selected: null,
            selectedIndex: null,
            notifications: [],
            pdf_feeds: [],
            extra_attachment:[],
            mock: {
                value: {
                    name: 'New Notification',
                    sendTo: {
                        type: 'email',
                        email: null,
                        field: null,
                        routing: [
                            {
                                input_value: '',
                                field: null,
                                operator: '=',
                                value: null
                            }
                        ],
                    },
                    fromName: '',
                    fromEmail: '',
                    replyTo: '',
                    bcc: '',
                    subject: '',
                    message: '',
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
                    enabled: true,
                    pdf_attachments: [],
                    attachments: [],
                    media_attachments: [],
                    feed_trigger_event : 'payment_success'

                }
            },
            errors: new Errors,
            // emailShortcodes: [],
            activeNotificationCollapse: '',
            has_fluentsmtp: !!window.FluentFormApp.has_fluent_smtp,
            smtp_page_url: window.FluentFormApp.fluent_smtp_url,
            smtp_closed: false
        }
    },
    computed: {
        emailFields() {
            return _ff.filter(this.inputs, (input) => {
                return input.attributes.type === 'email';
            });
        },

        attachmentFields() {
            return _ff.filter(this.inputs, (input) => {
                return input.attributes && input.attributes.type === 'file';
            });
        },

        emailShortcodes() {
            const inputEmails = {
                title: 'Input Emails',
                shortcodes: {}
            };
            _ff.each(this.inputs, (input, key) => {
                const code = `{inputs.${key}}`;
                if (input.attributes.type === 'email') {
                    inputEmails.shortcodes[code] = input.admin_label;
                }
            });

            return [inputEmails];
        },

        fromEmailShortcodes() {
            const freshCopy = _ff.cloneDeep(this.emailShortcodes);
            freshCopy[0].shortcodes = {
                '{admin_email}': 'Admin Email',
                ...freshCopy[0].shortcodes
            };
            return freshCopy;
        },
        emailBodyeditorShortcodes() {
            const freshCopy = _ff.cloneDeep(this.editorShortcodes);
            freshCopy[0].shortcodes = {
                ...freshCopy[0].shortcodes,
                '{all_data}': 'All Data',
                '{all_data_without_hidden_fields}' : 'All Data Without Hidden Fields'
            };
            return freshCopy;
        },
        hasAttachment(){
            let pdfAttachment = this.selected.value.pdf_attachments && this.selected.value.pdf_attachments.length
            let inputAttachment = this.selected.value.attachments && this.selected.value.attachments.length;
            let fileAttachment = this.selected.value.media_attachments && this.selected.value.media_attachments.length;
            return !!inputAttachment || !!  fileAttachment || !!pdfAttachment;
        },
        hasPaymentField() {
            let inputs = _ff.filter(this.inputs, (input) => {
                return input.element === 'payment_method';
            });
            return !!inputs.length;
        },
    },
    methods: {
        removeMediaAttachments(index){
            this.selected.value.media_attachments.splice(index, 1);
        },
        mediaAttachments(){
            if ( typeof wp !== 'undefined' && wp.media && wp.media.editor) {
                wp.media.editor.send.attachment  = (props, attachment) =>   {
                    if(attachment.url){
                        this.selected.value.media_attachments.push({
                            name: attachment.filename,
                            url:attachment.url
                        })
                    }
                };
                wp.media.editor.open();
                return false;
            }
        },
        add() {
            this.selectedIndex = this.notifications.length;
            this.selected = _ff.cloneDeep(this.mock);
        },
        clone(index) {
            let freshCopy = _ff.cloneDeep(this.notifications[index]);

            freshCopy.value.name = null;
            freshCopy.id = null;

            if (!freshCopy.value.conditionals
                || !freshCopy.value.conditionals.conditions
                || !freshCopy.value.conditionals.conditions.length
            ) {
                freshCopy.value.conditionals = this.mock.value.conditionals;
            }

            if (!freshCopy.value.pdf_attachments) {
                freshCopy.value.pdf_attachments = [];
            }

            if (!freshCopy.value.attachments) {
                freshCopy.value.attachments = [];
            }
            if (!freshCopy.value.media_attachments) {
                freshCopy.value.media_attachments = [];
            }
            if (!freshCopy.value.feed_trigger_event) {
                freshCopy.value.feed_trigger_event = 'payment_success';
            }

            this.selected = freshCopy;
            this.selectedIndex = index + 1;
	        this.notifications.splice(index + 1, 0, freshCopy);
        },
        edit(index) {
            let notification = this.notifications[index];
            if (!notification.value || !notification.value.name || !notification.value.sendTo) {
                this.selected = _ff.cloneDeep(this.mock);
                this.selectedIndex = index;
                return;
            }

            this.selected = notification;

            if (!this.selected.value.attachments) {
                this.$set(this.selected.value, 'attachments', []);
            }
            if (!this.selected.value.media_attachments) {
                this.$set(this.selected.value, 'media_attachments', []);
            }
            if (!this.selected.value.pdf_attachments) {
                this.$set(this.selected.value, 'pdf_attachments', []);
            }
            if (!this.selected.value.feed_trigger_event) {
                this.$set(this.selected.value, 'feed_trigger_event', 'payment_success');
            }

            this.selectedIndex = index;
        },
        discard() {
            this.selected = null;
            this.selectedIndex = null;
            this.errors.clear();
        },
        handleActive(index) {
            let notification = this.notifications[index];

            let id = notification.id;

            delete (notification.id);

            let data = {
                form_id: this.form_id,
                meta_key: 'notifications',
                value: JSON.stringify(notification.value),
                id,
                action: 'fluentform-settings-formSettings-store'
            };

            FluentFormsGlobal.$post(data)
                .done(response => {
                    notification.id = response.data.id;

                    let handle = notification.value.enabled ? 'enabled' : 'disabled';

                    this.$notify.success({
                        title: 'Success',
                        message: 'Successfully ' + handle + ' the notification.',
                        offset: 30
                    });
                })
                .fail(e => {
                    notification.id = id;
                });
        },
        remove(index, id) {
            FluentFormsGlobal.$post({
                action: 'fluentform-settings-formSettings-remove',
                id,
                form_id: this.form_id
            })
                .done(response => {
                    this.notifications.splice(index, 1);
                    this.$notify.success({
                        title: 'Success',
                        message: 'Successfully removed the notification.',
                        offset: 30
                    });
                })
                .fail(e => {
                });
        },
        fetchNotifications() {
            let data = {
                form_id: this.form_id,
                meta_key: 'notifications',
                is_multiple: true,
                action: 'fluentform-settings-formSettings'
            };

            FluentFormsGlobal.$get(data)
                .then(response => {
                    this.notifications = response.data.result;
                })
                .fail(e => {
                })
                .always(_ => {
                    this.loading = false;
                });
        },
        fetchEmailTemplates() {
            FluentFormsGlobal.$get({
                action: 'fluentform_pdf_admin_ajax_actions',
                form_id: window.FluentFormApp.form_id,
                route: 'feed_lists'
            })
                .then(response => {
                    this.pdf_feeds = response.data.pdf_feeds;
                })
                .fail(error => console.log(error));
        },
        store() {
            this.loading = true;
            this.errors.clear();

            let id = this.selected.id;

            delete (this.selected.id);

            let data = {
                form_id: this.form_id,
                meta_key: 'notifications',
                value: JSON.stringify(this.selected.value),
                id,
                action: 'fluentform-settings-formSettings-store'
            };

            FluentFormsGlobal.$post(data)
                .done(response => {
                    this.selected.id = response.data.id;

                    this.notifications.splice(this.selectedIndex, 1, this.selected);

                    this.$notify.success({
                        title: 'Success',
                        message: 'Successfully saved the notification.',
                        offset: 30
                    });

                    this.selected = null;

                    this.selectedIndex = null;
                })
                .fail(errors => {
                    this.errors.record(errors.responseJSON.data.errors);

                    this.selected.id = id;
                })
                .always(_ => this.loading = false);
        },
        closeSmtp() {
            this.smtp_closed = true;
            if(localStorage) {
                localStorage.setItem('fluentsmtp_closed', 'yes');
            }

        }
    },

    mounted() {
        // Back to all notifications by clicking on menu item
        jQuery('[data-hash="email_notifications"]').on('click', this.discard);
        jQuery('head title').text('Email Notifications - Fluent Forms');
        if(localStorage) {
            this.smtp_closed = !!localStorage.getItem('fluentsmtp_closed');
        }
    },
    beforeMount() {
        this.fetchNotifications();
        this.has_pdf && this.fetchEmailTemplates();
    },
    beforeCreate() {
        ffSettingsEvents.$emit('change-title', 'Email Notification Settings');
    }
};
</script>
