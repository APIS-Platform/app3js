/* jshint ignore:start */
Package.describe({
    name: 'apisplatform:app3js',
    version: '0.9.3-7',
});

// Npm.depends({
//     "xmlhttprequest": "1.7.0"
// });


Package.onUse(function(api) {
    api.versionsFrom('0.9.3-7');

    api.addFiles('dist/app3.js', ['client']); // 'server'
});

/* jshint ignore:end */