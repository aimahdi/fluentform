let mix = require('laravel-mix');
const exec = require('child_process').exec;
const path = require('path');

mix.setPublicPath('public');
mix.setResourceRoot('../');

if (!mix.inProduction()) {
    mix.webpackConfig({
        devtool: 'source-map'
    }).sourceMaps(false);
} else {
    // During production build we'll remove the existing public
    // directory so that the source-maps are deleted as well.
    let fs = require('fs-extra');
    fs.remove('public');
}

mix.webpackConfig({
    resolve: {
        alias: {
            '@': path.resolve('resources/assets')
        }
    }
});

// mix.js('resources/assets/admin/editor_app.js', `public/js/fluent-forms-editor.js`);
// return;


mix
    .js('resources/assets/admin/fluent_forms_global.js', `public/js/fluent_forms_global.js`)
    .js('resources/assets/admin/settings/settings.js', `public/js/fluentform-global-settings.js`)
    .js('resources/assets/admin/transfer/transfer.js', `public/js/fluentform-transfer.js`)
    .js('resources/assets/admin/form_settings_app.js', `public/js/form_settings_app.js`)
    .js('resources/assets/admin/editor_app.js', `public/js/fluent-forms-editor.js`)
    .js('resources/assets/admin/form_entries_app.js', `public/js/form_entries.js`)
    .js('resources/assets/admin/all_forms_app.js', `public/js/fluent-all-forms-admin.js`)
    .js('resources/assets/public/fluentform-advanced.js', `public/js/fluentform-advanced.js`)
    .js('resources/assets/public/form-submission.js', `public/js/form-submission.js`)
    .js('resources/assets/public/form-save-progress.js', `public/js/form-save-progress.js`)
    .js('resources/assets/admin/fluentform_editor_script.js', `public/js/fluentform_editor_script.js`)
    .js('resources/assets/admin/copier.js', `public/js/copier.js`)
    .js('resources/assets/admin/admin_notices.js', `public/js/admin_notices.js`)
    .js('resources/assets/admin/modules.js', `public/js/modules.js`)
    .js('resources/assets/admin/AllEntries/all-entries.js', `public/js/all_entries.js`)
    .js('resources/assets/admin/conversion_templates/conversational_design.js', `public/js/conversational_design.js`)
    .js('resources/assets/admin/Dashboard/fluentform_dashboard.js', `public/js/fluentform_dashboard.js`)
    .vue({
        version: 2,
        extractStyles: true
    })

    .sass('resources/assets/admin/css/element-ui-css.scss', `public/css/element-ui-css.css`)
    .sass('resources/assets/admin/css/fluent-forms-admin.scss', `public/css/fluent-forms-admin-sass.css`)
    .sass('resources/assets/admin/css/settings_global.scss', `public/css/settings_global.css`)
    .sass('resources/assets/admin/css/fluent-all-forms.scss', `public/css/fluent-all-forms.css`)
    .sass('resources/assets/admin/css/admin_notices.scss', `public/css/admin_notices.css`)
    .sass('resources/assets/admin/css/admin_docs.scss', `public/css/admin_docs.css`)
    .sass('resources/assets/admin/css/add-ons.scss', 'public/css/add-ons.css')
    .sass('resources/assets/admin/css/fluent_gutenblock.scss', 'public/css/fluent_gutenblock.css')
    .sass('resources/assets/public/scss/fluent-forms-public.scss', `public/css/fluent-forms-public.css`)
    .sass('resources/assets/public/scss/fluentform-public-default.scss', `public/css/fluentform-public-default.css`)
    .sass('resources/assets/preview/preview.scss', `public/css/preview.css`)
    .sass('resources/assets/public/scss/choices.scss', `public/css/choices.css`)
    .sass('resources/assets/elementor/fluent-forms-elementor-widget.scss', `public/css/fluent-forms-elementor-widget.css`)
    .sass('resources/assets/admin/conversion_templates/design_css.scss', `public/css/conversational_design.css`)

    .less('resources/assets/admin/styles/index.less', `public/css/fluent-forms-admin.css`, {
        lessOptions: {
            javascriptEnabled: true
        }
    });

mix.then(() => {
    exec('rtlcss ./public/css/fluent-forms-public.css ./public/css/fluent-forms-public-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    exec('rtlcss ./public/css/fluentform-public-default.css ./public/css/fluentform-public-default-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    exec('rtlcss ./public/css/settings_global.css ./public/css/settings_global_rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    exec('rtlcss ./public/css/element-ui-css.css ./public/css/element-ui-css-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
    
    exec('rtlcss ./public/css/fluent-all-forms.css ./public/css/fluent-all-forms-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
    
    exec('rtlcss ./public/css/fluent-forms-admin-sass.css ./public/css/fluent-forms-admin-sass-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
    
    exec('rtlcss ./public/css/fluent-forms-admin.css ./public/css/fluent-forms-admin-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    exec('rtlcss public/css/add-ons.css ./public/css/add-ons-rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    exec('rtlcss public/css/admin_docs.css ./public/css/admin_docs_rtl.css', (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
});


mix
    .copyDirectory('resources/assets/libs', 'public/libs')
    .copyDirectory('resources/img', 'public/img')
    .copyDirectory('guten_block/public', 'public/js')
    .copy('index.php', 'public/index.php');
