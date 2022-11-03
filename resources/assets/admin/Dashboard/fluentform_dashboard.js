import Vue from 'vue';
import locale from 'element-ui/lib/locale';
import lang from 'element-ui/lib/locale/lang/en';

import {
    Button,
    ButtonGroup,
    RadioGroup,
    RadioButton,
    Input,
    Checkbox,
    Select,
    Option,
    Radio,
    Table,
    TableColumn,
    Switch,
    Pagination,
    Loading,
    Message,
    Notification,
    DatePicker,
    Card,
    Row
} from 'element-ui';

Vue.use(Loading.directive);
Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;
Vue.prototype.$notify = Notification;


Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Switch);
Vue.use(Checkbox);
Vue.use(Pagination);
Vue.use(Select);
Vue.use(Option);
Vue.use(RadioGroup);
Vue.use(RadioButton);
Vue.use(Radio);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
Vue.use(Row)
Vue.use(Card)
locale.use(lang);

Vue.mixin({
    filters: {
        ucFirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        _startCase(string) {
            return _ff.startCase(string);
        }
    },
    methods: {
        $t(str) {

            return str;
        },
    },
});


import App from './App.vue';

new Vue({
    el: "#ff_admin_dashboard",
    components: {
        'ff-admin-dashboard': App
    }
});
