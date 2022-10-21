<template>
<el-form-item class="repeat-field" :class="{ 'is-required': !isMultiCol && required, ['ff-el-form-'+item.settings.label_placement]: item.settings.label_placement }">
    <elLabel slot="label" :label="item.settings.label"></elLabel>
    <div class="repeat-field--item">
        <el-form-item v-for="(field, key, i) in item.fields" :key="i" :class="{ 'is-required' : field.settings.validation_rules.required.value }">
            <elLabel v-if="isMultiCol" slot="label"
                     :label="field.settings.label">
            </elLabel>
            <el-input v-if="field.element != 'select' && field.element != 'input_radio' && field.element != 'input_checkbox'"
                      :value="field.attributes.value"
                      :placeholder="field.attributes.placeholder">
            </el-input>
            <div v-else-if="field.element == 'select'">
                <el-select :placeholder="field.attributes.placeholder"></el-select>
            </div>
            <div v-else-if="field.element == 'input_radio' || field.element == 'input_checkbox'">
                <input-checkable :item="field"></input-checkable>
            </div>
        </el-form-item>
    </div>
    <div :class="{'repeat-field-actions': isMultiCol }">
        <i class="icon icon-plus-circle"></i>
        <i class="icon icon-minus-circle"></i>
    </div>
</el-form-item>
</template>

<script>
import elLabel from '../includes/el-label.vue'
import inputCheckable from './inputCheckable.vue'
import InputCheckable from './inputCheckable';

export default {
    name: 'repeat_fields',
    props: ['item'],
    components: {
        InputCheckable,
        elLabel
    },
    computed: {
        firstField() {
            return this.item.fields[0];
        },
        isMultiCol() {
            return this.item.fields.length > 1;
        },
        required() {
            return this.firstField.settings.validation_rules.required.value;
        }
    },
}
</script>
