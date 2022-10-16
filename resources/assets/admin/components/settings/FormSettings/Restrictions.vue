<template>
    <el-form ref="form-bottom" label-width="220px" label-position="left">
        <!--Limit Number of Entries-->
        <el-form-item>
            <div slot="label">
                {{ $t('Maximum Number of Entries') }}

                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Maximum Number of Entries') }}</h3>

                        <p>
                            {{ $t('Enter a number in the input box below to limit ')}}<br>
                            {{ $t('the number of entries allowed for this form. The ')}}<br>
                            {{ $t('form will become inactive when that number is reached.') }}
                        </p>
                    </div>

                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </div>

            <el-switch active-color="#13ce66" v-model="form.limitNumberOfEntries.enabled"></el-switch>
        </el-form-item>

        <!--Additional fields when limit number of entries enabled-->
        <transition name="slide-down">
            <div v-if="form.limitNumberOfEntries.enabled" class="conditional-items">
                <el-form-item :label="$t('Maximum Entries')">
                    <el-col :md="6">
                        <el-input-number :min="0"
                                         v-model="form.limitNumberOfEntries.numberOfEntries"
                        ></el-input-number>
                    </el-col>

                    <el-col :md="12">
                        <span>/</span>
                        <el-select style="min-width: 300px" v-model="form.limitNumberOfEntries.period">
                            <el-option v-for="(label, period) in entryPeriodOptions" :key="period"
                                       :label="label" :value="period"
                            ></el-option>
                        </el-select>
                    </el-col>
                </el-form-item>

                <el-form-item class="label-lh-1-5" :label="$t('Message Shown on Reaching Max Entries')" key="limit-reached-msg">
                    <el-input v-model="form.limitNumberOfEntries.limitReachedMsg" type="textarea"></el-input>
                </el-form-item>
            </div>
        </transition>

        <!--Schedule Form-->
        <el-form-item>
            <div slot="label">
                {{ $t('Form Scheduling') }}

                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Form Scheduling') }}</h3>

                        <p>
                            {{ $t('Schedule a time period the form is active.') }}
                        </p>
                    </div>

                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </div>

            <el-switch active-color="#13ce66" v-model="form.scheduleForm.enabled"></el-switch>
        </el-form-item>

        <!--Additional fields when form sheduling enabled-->
        <transition name="slide-down">
            <div v-if="form.scheduleForm.enabled" class="conditional-items">
                <el-row>
                    <el-form-item :label="$t('Select Weekdays')" v-if="form.scheduleForm.enabled">

                        <el-checkbox   :indeterminate="isIndeterminate" v-model="checkAllWeekday"  @change="handleCheckAllChange">{{ $t('Check all') }}</el-checkbox>
                        <br>
                        <el-checkbox-group v-model="selectedDays">

                            <el-checkbox   v-for="weekday in weekdays" :key="weekday" @change="handleCheckedDayChange" :label="weekday"></el-checkbox>

                        </el-checkbox-group>

                    </el-form-item>
                </el-row>
                <el-row :gutter="30">
                    <el-col :md="12">
                        <el-form-item :label="$t('Submission Starts')" v-if="form.scheduleForm.enabled">
                            <el-date-picker
                                    class="el-fluid"
                                    style="width: 100%;"
                                    v-model="form.scheduleForm.start"
                                    type="datetime"
                                    :placeholder="$t('Select date and time')"
                            >
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-form labelWidth="160px">
                        <el-col :md="12">
                            <el-form-item :label="$t('Submission Ends')">
                                <el-date-picker
                                        class="el-fluid"
                                        style="width: 100%;"
                                        v-model="form.scheduleForm.end"
                                        type="datetime"
                                        :placeholder="$t('Select date and time')"
                                        :picker-options="datePickerOptions">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-form>
                </el-row>

                <el-form-item :label="$t('Form Waiting Message')">
                    <el-input v-model="form.scheduleForm.pendingMsg" type="textarea"></el-input>
                </el-form-item>

                <el-form-item :label="$t('Form Expired Message')">
                    <el-input v-model="form.scheduleForm.expiredMsg" type="textarea"></el-input>
                </el-form-item>
            </div>
        </transition>

        <!--Require user to be logged in-->
        <h4>{{ $t('Login Requirement Settings') }}</h4>
        <el-form-item>
            <div slot="label">
                {{ $t('Require user to be logged in') }}

                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Require user to be logged in') }}</h3>

                        <p>
                            {{ $t('Check this option to require a user to be ')}}<br>
                            {{ $t('logged in to view this form.') }}
                        </p>
                    </div>

                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </div>

            <el-switch active-color="#13ce66" v-model="form.requireLogin.enabled"></el-switch>
        </el-form-item>

        <!--Additional fields when user logged in is enabled-->
        <transition name="slide-down">
            <div v-if="form.requireLogin.enabled" class="conditional-items">
                <el-form-item>
                    <template slot="label">
                        {{ $t('Require Login Message') }}

                        <el-tooltip class="item" placement="bottom-start" effect="light">
                            <div slot="content">
                                <h3>{{ $t('Require Login Message') }}</h3>

                                <p>
                                    {{ $t('Enter a message to be displayed to users who ') }} <br>
                                    {{ $t('are not logged in (shortcodes and HTML are supported).') }}
                                </p>
                            </div>

                            <i class="el-icon-info el-text-info"></i>
                        </el-tooltip>
                    </template>
                    <el-input type="textarea" v-model="form.requireLogin.requireLoginMsg"></el-input>
                </el-form-item>
            </div>
        </transition>

        <!--Allow empty form submission-->
        <h4>{{ $t('Empty Submission Blocking') }}</h4>
        <el-form-item>
            <div slot="label">
                {{ $t('Deny empty submission') }}

                <el-tooltip class="item" placement="bottom-start" effect="light">
                    <div slot="content">
                        <h3>{{ $t('Deny empty submission') }}</h3>

                        <p>
                            {{ $t('Enabling this won\'t allow users to submit empty ') }} <br>
                            {{ $t('forms when there are no required form fields.') }}
                        </p>
                    </div>

                    <i class="el-icon-info el-text-info"></i>
                </el-tooltip>
            </div>

            <el-switch active-color="#13ce66" v-model="form.denyEmptySubmission.enabled"></el-switch>
        </el-form-item>

        <!--Additional fields when empty form submission is not allowed-->
        <transition name="slide-down">
            <div v-if="form.denyEmptySubmission.enabled" class="conditional-items">
                <el-form-item label-width="255px" class="label-lh-1-5">
                    <template slot="label">
                        {{ $t('Message Shown Against on Empty Submission') }}

                        <el-tooltip class="item" placement="bottom-start" effect="light">
                            <div slot="content">
                                <h3>{{ $t('Message Shown Against on Empty Submission') }}</h3>

                                <p>
                                    {{ $t('Enter a message to be displayed to users ')}}<br>
                                    {{ $t('when they try to submit an empty form.') }}
                                </p>
                            </div>

                            <i class="el-icon-info el-text-info"></i>
                        </el-tooltip>
                    </template>

                    <el-input type="textarea" v-model="form.denyEmptySubmission.message"></el-input>
                </el-form-item>
            </div>
        </transition>

    </el-form>
</template>

<script>
    export default {
        name: 'FormRestrictions',
        props: {
            data: {
                required: true
            }
        },
        data() {
            return {
                isIndeterminate: false,
                checkAllWeekday:'',
                selectedDays:[],
                weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'],
                entryPeriodOptions: {
                    total: 'Total Entries',
                    day: 'Per Day',
                    week: 'Per Week',
                    month: 'Per Month',
                    year: 'Per Year',
                    per_user_ip: 'Per User (IP Address Based)',
                    per_user_id: 'Per User (Logged in ID based)'
                },
                datePickerOptions: {
                    shortcuts: [
                        {
                            text: 'Today',
                            onClick(picker) {
                                picker.$emit('pick', new Date());
                            }
                        },
                        {
                            text: this.$t('Yesterday'),
                            onClick(picker) {
                                const date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', date);
                            }
                        },
                        {
                            text: this.$t('A week ago'),
                            onClick(picker) {
                                const date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', date);
                            }
                        }
                    ]
                }
            }
        },
        methods: {
            handleCheckAllChange(val) {
                this.selectedDays = val ? this.weekdays : [];
                this.form.scheduleForm.selectedDays = this.selectedDays;
                this.isIndeterminate = false;
            },
            handleCheckedDayChange(value) {

                let checkedCount = this.selectedDays.length;
                this.checkAllWeekday = checkedCount === this.weekdays.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.weekdays.length;
                this.form.scheduleForm.selectedDays = this.selectedDays;

            }
        },
        mounted() {
            //if weekdays is not set initially select all weekday
            if(!this.form.scheduleForm.selectedDays){
                this.form.scheduleForm.selectedDays = this.weekdays;
            }
            this.selectedDays    = this.form.scheduleForm.selectedDays ;
            this.checkAllWeekday = this.selectedDays.length === this.weekdays.length;

        },
        computed: {
            form() {
                return this.data;
            }
        }
    }
</script>
