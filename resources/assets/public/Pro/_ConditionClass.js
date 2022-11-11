class ConditionApp {

    constructor(fields, formData) {
        this.fields = fields;
        this.formData = formData;
        this.counter = 0;
        this.field_statues = {};
    }

    setFields(fields) {
        this.fields = fields;
    }

    setFormData(data) {
        this.formData = data;
    }

    getCalculatedStatuses() {
        for (const key of Object.keys(this.fields)) {
            let item = this.fields[key];
            this.field_statues[key] = this.evaluate(item, key);
        }
        return this.field_statues;
    }

    evaluate(item, key) {
        let mainResult = false;
        if (item.status) {
            this.counter++;
            let type = item.type;
            let result = 1;
            if (type == 'any') {
                result = 0;
            }
            item.conditions.forEach(condition => {
                let evalValue = this.getItemEvaluateValue(condition, this.formData[condition.field]);

                if (evalValue && this.fields[condition.field] && condition.field != key) {
                    evalValue = this.evaluate(this.fields[condition.field], condition.field);
                }

                if (type == 'any') {
                    if (evalValue) {
                        result = 1;
                    }
                } else {
                    // For All
                    if (!evalValue && result) {
                        result = false;
                    }
                }
            });
            mainResult = result == 1;
        }

        if(item.status && item.conditions.length && !mainResult) {
            return mainResult;
        }

        if (item.container_condition) {
            mainResult = this.evaluate(item.container_condition);
        }
        return mainResult;
    }

    getItemEvaluateValue(item, val) {
        val = val || null;
        
        const $el = jQuery(`[name='${item.field}']`);

        if (item.operator == '=') {

            //when condition value is empty
            if (item.value === '') {
                return val === null;
            }
            // this value can be array or string
            if (typeof val == 'object') {
                return val !== null && val.indexOf(item.value) != -1;
            }

            if ($el.hasClass('ff_numeric') ) {
                return this.parseFormattedNumericValue($el, val) == this.parseFormattedNumericValue($el, item.value);
            }

            return val == item.value;
        } else if (item.operator == '!=') {
            if (typeof val == 'object') {
                return val !== null && val.indexOf(item.value) == -1;
            }
            
            if ($el.hasClass('ff_numeric') ) {
                return this.parseFormattedNumericValue($el, val) != this.parseFormattedNumericValue($el, item.value);
            }

            return val != item.value;
        } else if (item.operator == '>') {
            return val && this.parseFormattedNumericValue($el, val) > this.parseFormattedNumericValue($el, item.value);
        } else if (item.operator == '<') {
            return val && this.parseFormattedNumericValue($el, val) < this.parseFormattedNumericValue($el, item.value);
        } else if (item.operator == '>=') {
            return val && this.parseFormattedNumericValue($el, val) >= this.parseFormattedNumericValue($el, item.value);
        } else if (item.operator == '<=') {
            return val && this.parseFormattedNumericValue($el, val) <= this.parseFormattedNumericValue($el, item.value);
        } else if (item.operator == 'startsWith') {
            return val && val.startsWith(item.value);
        } else if (item.operator == 'endsWith') {
            return val && val.endsWith(item.value);
        } else if (item.operator == 'contains') {
            return val !== null && val.indexOf(item.value) != -1;
        } else if (item.operator == 'doNotContains') {
            return val !== null && val.indexOf(item.value) == -1;
        } else if(item.operator == 'test_regex') {
            const globalRegex = this.stringToRegex(item.value);
            val = val || '';
            return  globalRegex.test(val);
        }
        return false;
    }

    stringToRegex(regex) {
        let {
            body,
            flags,
        } = String(regex)
            .match(/^\/(?<body>.*)\/(?<flags>[gimsuy]*)$/)
            ?.groups || {};
        if (body) {
            flags = flags ? flags : 'g';
            return RegExp(body, flags);
        }
        return new RegExp(regex, 'g');
    }

    parseFormattedNumericValue($el, val) {
        if ($el.hasClass('ff_numeric') ) {
            let formatConfig = JSON.parse($el.attr('data-formatter'));
            
            return currency(val, formatConfig).value;
        }

        return Number(val) || 0;
    }
}

export default ConditionApp;