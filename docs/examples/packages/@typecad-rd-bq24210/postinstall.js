const fs = require('node:fs');
let package_json = require('./package.json');
console.log(process.env.INIT_CWD);
fs.cp(
  process.env.INIT_CWD + `/node_modules/${package_json.name}/lib`,      // copy footprint and symbol from the install node_module location
  process.env.INIT_CWD + '/build/lib',                                  // to the typeCAD project folder structure
  { recursive: true },
  (err) => {
    if (err) {
      console.error(err);
    }
  }
);