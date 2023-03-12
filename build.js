const { stderr } = require('process');
const fs = require("fs")
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')

function buildCSS(moduleList) {
  console.log("running task: buildCSS");

  fs.writeFileSync('./static/css/out.css', "");

  moduleList.forEach(module => {
    const path = "./ui/" + module + "/css"
    console.log(path);

    if (!fs.existsSync(path)) {
      return;
    }

    const cssFiles = fs.readdirSync(path, 'utf8');
    cssFiles.forEach(css => {
      const f = fs.readFileSync(path + "/" + css);

      postcss([autoprefixer]).process(f).then(result => {
        result.warnings().forEach(warn => {
          console.warn(warn.toString())
        });

        fs.writeFileSync('./static/css/out.css', result.css, { flag: 'a+' });
      });
    });
  });
}



function buildTypescript() {
  const childProccess = require('child_process');

  console.log("running task: buildTypescript");

  childProccess.exec("tsc --build", (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout:\n${stdout}`);

  });
}

const moduleList = fs.readdirSync('./ui', 'utf8');

buildTypescript();
buildCSS(moduleList);