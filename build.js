const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const fs = require("fs")

fs.writeFileSync('./static/css/out.css', "");

fs.readdirSync('./static/css', 'utf8').forEach(css => {

    const f = fs.readFileSync("./static/css/" + css);
    postcss([ autoprefixer ]).process(f).then(result => {
        result.warnings().forEach(warn => {
          console.warn(warn.toString())
        })

        fs.writeFileSync('./static/css/out.css', result.css, {flag:'a+'});
      })
});



