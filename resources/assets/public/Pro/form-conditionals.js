import ConditionApp from "./_ConditionClass";

const formConditional = function ($, $theForm, form) {
    /**
     * Container to store all conditional
     *  logics recieved from the server
     *
     * @type {Object}
     */
    let formSelector = '.' + form.form_instance;

    const formCondition = function () {

        const watchableFields = {};

        let formData = {};

        const getTheForm = function () {
            return $(formSelector);
        };

        /**
         * Register all the required handlers
         * for elements those, who have conditions
         *
         * @return void
         */
        const init = function () {
            if (!form.conditionals) {
                return;
            }
            $.each(form.conditionals, function (fieldName, field) {
                if (!fieldName) {
                    return;
                }
                $.each(field.conditions, function (index, condition) {
                    let el = getElement(condition.field);
                    watchableFields[el.prop('name')] = el;
                });
            });

            formData = getFormData();
            const conditionAppInstance = new ConditionApp(form.conditionals, formData);

            $.each(watchableFields, (name, el) => {
                el.on('change', () => {
                    formData = getFormData();
                    conditionAppInstance.setFormData(formData);
                    hideShowElements(conditionAppInstance.getCalculatedStatuses());
                });
            });

            hideShowElements(conditionAppInstance.getCalculatedStatuses());
        };

        const hideShowElements = function (items) {
            $.each(items, (itemName, status) => {
                const el = getElement(itemName);
                let $parent = el.closest('.has-conditions');
                if (status) {
                    if ($parent.css('height') == '0px') {
                        $parent.attr("style", "");
                    }
                    $parent.removeClass('ff_excluded')
                        .addClass('ff_cond_v')
                        .slideDown(200);
                } else {
                    $parent.removeClass('ff_cond_v')
                        .addClass('ff_excluded')
                        .slideUp(200);
                }
            });
            $theForm.trigger('do_calculation');
        };

        const getFormData = function () {
            const data = {};
            $.each(watchableFields, (name, el) => {
                let type = el.prop('type') || el.attr('data-type');
                if (type == 'radio') {
                    data[name] = '';
                    el.each((index, item) => {
                        if ($(item).is(':checked')) {
                            data[name] = $(item).val();
                        }
                    });
                } else if (type == 'checkbox') {
                    name = name.replace('[]', '');
                    data[name] = [];
                    el.each((index, item) => {
                        if ($(item).is(':checked')) {
                            data[name].push($(item).val());
                        }
                    });
                } else if (type == 'select-multiple') {
                    name = name.replace('[]', '');
                    let val = el.val();
                    if (val) {
                        data[name] = val;
                    } else {
                        data[name] = [];
                    }
                } else if(type == 'file') {
                    let file_urls = '';
                    let $el = $theForm.find('input[name='+name+']')
                    $el
                        .closest('.ff-el-input--content')
                        .find('.ff-uploaded-list')
                        .find('.ff-upload-preview[data-src]')
                        .each(function (i, div) {
                            file_urls += $(this).data('src');
                        });
                    data[name] = file_urls;
                } else {
                    data[name] = el.val();
                }
            });


            return data;
        };

        /**
         * Resolve a dom element as jQuery object
         *
         * @param  string name
         * @return jQuery instance
         */
        const getElement = function (name) {
            let $theform = getTheForm();
            var el = $("[data-name='" + name + "']", $theform);
            el = el.length ? el : $("[name='" + name + "']", $theform);
            return el.length ? el : $("[name='" + name + "[]']", $theform);
        };

        return {init};
    };
    formCondition().init();
};

export default formConditional;
