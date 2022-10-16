<template>
    <div class="ff_payment_item_wrapper">
        <el-form-item>
            <elLabel
                    slot="label"
                    :label="$t('Subscription Type')"
                    :helpText="$t('Select your subscription plan type')"
            />

            <el-radio-group
                    size="small"
                    @change="checkPricingPlans()"
                    v-model="editItem.attributes.type"
            >
                <el-radio-button label="single">
                    {{ $t('Single Recurring Plan') }}
                </el-radio-button>

                <el-radio-button label="multiple">
                    {{ $t('Multiple Pricing Plans') }}
                </el-radio-button>
            </el-radio-group>
        </el-form-item>

        <el-form-item v-if="editItem.attributes.type === 'multiple'">
            <elLabel
                    slot="label"
                    :label="$t('Plan Display Type')"
                    :helpText="$t('Select how you want to display the plan options')"
            />

            <el-radio-group
                    size="small"
                    v-model="editItem.settings.selection_type"
            >
                <el-radio-button label="radio">
                    {{ $t('Radio input field') }}
                </el-radio-button>

                <el-radio-button label="select">
                    {{ $t('Select input field') }}
                </el-radio-button>
            </el-radio-group>
        </el-form-item>

        <p>
            <strong>
                {{ $t('Pricing Plans') }}
            </strong>
        </p>

        <div
                class="subscription-field-options"
                v-for="(item, index) in editItem.settings.subscription_options"
        >
            <div class="plan_header">
                <div class="plan_label">
                    #{{ index + 1 }}: {{ item.name }}
                </div>

                <div class="plan_actions">
                    <template v-if="editItem.attributes.type !== 'single'">
                        Default:

                        <el-switch
                                v-model="item.is_default"
                                active-value="yes"
                                inactive-value="no"
                                @change="changeDefaultItem(index)"
                        />
                    </template>

                    <el-button
                            size="mini"
                            type="danger"
                            icon="el-icon-delete"
                            @click="deleteItem(index)"
                            v-show="editItem.settings.subscription_options.length > 1"
                    />
                </div>
            </div>

            <div class="plan_body">
                <el-form-item>
                    <elLabel
                            slot="label"
                            :label="$t('Plan Name')"
                    />

                    <el-input
                            size="mini"
                            type="text"
                            v-model="item.name"
                            :placeholder="$t('Plan Name')"
                    />
                </el-form-item>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item>
                            <elLabel
                                slot="label"
                                :label="$t('Price')"
                            />

                            <el-input-number
                                :min="0"
                                size="mini"
                                v-model="item.subscription_amount"
                                :disabled="item.user_input === 'yes'"
                            />
                        </el-form-item>
                        <el-form-item>
                            <el-checkbox
                                true-label="yes"
                                false-label="no"
                                v-model="item.user_input"
                            >
                                {{ $t('Enable User Input Amount') }}
                            </el-checkbox>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item>
                            <elLabel
                                slot="label"
                                :label="$t('Billing Interval')"
                            />

                            <el-select
                                size="mini"
                                :placeholder="$t('Select')"
                                v-model="item.billing_interval"
                            >
                                <el-option
                                    v-for="(label,value) in interval_options"
                                    :key="value"
                                    :label="label"
                                    :value="value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <template v-if="item.user_input === 'yes'">
                    <el-form-item>
                        <elLabel
                            slot="label"
                            :label="$t('User Input Amount label')"
                        />

                        <el-input
                            type="text"
                            size="mini"
                            v-model="item.user_input_label"
                            :placeholder="$t('ex: Please Provide amount/interval')"
                        />
                    </el-form-item>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item>
                                <elLabel
                                    slot="label"
                                    :label="$t('Minimum Amount')"
                                />

                                <el-input-number
                                    size="mini"
                                    v-model="item.user_input_min_value"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item>
                                <elLabel
                                    slot="label"
                                    :label="$t('Default Amount')"
                                />

                                <el-input-number
                                    size="mini"
                                    v-model="item.user_input_default_value"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </template>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item>
                            <elLabel
                                slot="label"
                                :label="$t('Has Signup Fee?')"
                            />

                            <el-switch
                                active-value="yes"
                                inactive-value="no"
                                v-model="item.has_signup_fee"
                                :disabled="item.has_trial_days === 'yes'"
                            />

                            <el-input-number
                                :min="0"
                                size="mini"
                                :placeholder="$t('Signup Fee')"
                                v-model="item.signup_fee"
                                v-if="item.has_signup_fee === 'yes'"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item>
                            <elLabel
                                slot="label"
                                :label="$t('Has Trial Days? (in days)')"
                            />

                            <el-switch
                                active-value="yes"
                                inactive-value="no"
                                v-model="item.has_trial_days"
                                :disabled="item.has_signup_fee === 'yes'"
                            />

                            <el-input-number
                                :min="0"
                                size="mini"
                                :placeholder="$t('Trial Days')"
                                v-model="item.trial_days"
                                v-if="item.has_trial_days === 'yes'"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item>
                    <elLabel
                            slot="label"
                            :label="$t('Total Billing times')"
                    />

                    <el-input-number
                            :min="0"
                            size="mini"
                            v-model="item.bill_times"
                            :placeholder="$t('times')"
                    />

                    <p>
                        {{ $t('Keep blank or 0 for billing unlimited period of times') }}
                    </p>
                </el-form-item>
            </div>

            <div class="plan_footer">
                <span v-html="getAdvancedText(item)"></span>
            </div>
        </div>

        <div
                class="wpf_plan_actions"
                style="text-align: right;"
                v-if="editItem.attributes.type !== 'single'"
        >
            <el-button @click="add" size="mini">
                {{ $t('Add New Plan') }}
            </el-button>
        </div>
    </div>
</template>

<script type="text/babel">
    import each from "lodash/each";
    import elLabel from '../../includes/el-label.vue'

    export default {
        name: 'subscription-options',
        props: ['editItem', 'listItem'],
        components: {
            elLabel
        },
        data() {
            return {
                interval_options: {
                    day: 'Daily',
                    week: 'Weekly',
                    month: 'Monthly',
                    year: 'Yearly'
                }
            }
        },
        methods: {
            deleteItem(index) {
                this.editItem.settings.subscription_options.splice(index, 1);
            },

            add() {
                this.editItem.settings.subscription_options.push({
                    name: 'Plan Name Here',
                    trial_days: 0,
                    has_trial_days: 'no',
                    trial_preriod_days: 0,
                    billing_interval: 'month',
                    bill_times: 0,
                    has_signup_fee: 'no',
                    signup_fee: 0,
                    subscription_amount: '19.99',
                    plan_features: []
                });
            },

            getAdvancedText(item) {
                let billAmount = item.subscription_amount;

                if (item.user_input === 'yes') {
                    billAmount = 'USER_INPUT_AMOUNT';
                }

                let text = `Price <b>${billAmount}/${item.billing_interval}</b> `;

                if (item.has_trial_days === 'yes') {
                    text += `with ${item.trial_days} trial days `;
                }

                if (item.has_signup_fee === 'yes') {
                    text += `and Inital <b>Signup Fee ${item.signup_fee}</b> `;
                }

                if (parseInt(item.bill_times)) {
                    text += `and Total <b>Billing times ${item.bill_times}</b> `;
                } else {
                    text += `and will be billed untill cancel`;
                }

                return this.$t(text);
            },

            changeDefaultItem(index) {
                each(this.editItem.settings.subscription_options, (option, itemIndex) => {
                    if (itemIndex !== index) {
                        option.is_default = 'no';
                    }
                });
            },

            checkPricingPlans() {
                if (
                        this.editItem.attributes.type === 'single'
                        && this.editItem.settings.subscription_options.length > 1
                ) {
                    this.editItem.settings.subscription_options = [this.editItem.settings.subscription_options[0]];
                }
            }
        }
    };
</script>
