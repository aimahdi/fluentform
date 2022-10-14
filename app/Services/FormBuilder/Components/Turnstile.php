<?php

namespace FluentForm\App\Services\FormBuilder\Components;

class Turnstile extends BaseComponent
{
    /**
     * Compile and echo the html element
     *
     * @param array     $data [element data]
     * @param \stdClass $form [Form Object]
     *
     * @return void
     */
    public function compile($data, $form)
    {
        $elementName = $data['element'];
        $data = apply_filters('fluentform_rendering_field_data_' . $elementName, $data, $form);

        $key = get_option('_fluentform_turnstile_details');

        if ($key && isset($key['siteKey'])) {
            $siteKey = $key['siteKey'];
        } else {
            $siteKey = '';
        }

        if (! $siteKey) {
            return false;
        }

        add_filter('fluent_form_html_attributes', function ($atts) use ($siteKey) {
            $atts['data-turnstile_key'] = $siteKey;
            return $atts;
        });

        wp_enqueue_script(
            'turnstile',
            'https://challenges.cloudflare.com/turnstile/v0/api.js',
            [],
            FLUENTFORM_VERSION,
            true
        );

        $turnstileBlock = "<div
		data-sitekey='" . esc_attr($siteKey) . "'
		id='fluentform-turnstile-{$form->id}'
		class='ff-el-turnstile cf-turnstile'
		data-callback='turnstileCallback'></div>";

        $label = '';
        if (! empty($data['settings']['label'])) {
            $label = "<div class='ff-el-input--label'><label>" . fluentform_sanitize_html($data['settings']['label']) . '</label></div>';
        }

        $containerClass = '';
        if (! empty($data['settings']['label_placement'])) {
            $containerClass = 'ff-el-form-' . $data['settings']['label_placement'];
        }

        $el = "<div class='ff-el-input--content'><div data-fluent_id='" . $form->id . "' name='cf-turnstile-response'>{$turnstileBlock}</div></div>";

        $html = "<div class='ff-el-group " . esc_attr($containerClass) . "' >{$label}{$el}</div>";

        $this->printContent('fluentform_rendering_field_html_' . $elementName, $html, $data, $form);
    }
}
