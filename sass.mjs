import * as sass from 'sass';
import fs from 'fs';

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Configs
var configs = {
    name: 'BuildToolsCookbook',
    files: ['main.scss'],
    pathIn: 'src/scss',
    pathOut: 'dist/css',
    minify: true,
    sourceMap: false
};

// Banner
var banner = `/*! ${configs.name ? configs.name : pkg.name} v${pkg.version} | (c) ${new Date().getFullYear()} ${pkg.author.name} | ${pkg.license} License | ${pkg.repository.url} */`;

var writeFile = function (pathOut, fileName, fileData, printBanner) {
    if (printBanner === undefined) printBanner = true;
    fs.mkdir(pathOut, { recursive: true }, function (err) {
        if (err) throw err;

        var content = (printBanner ? banner + '\n' : '') + fileData;
        fs.writeFile(`${pathOut}/${fileName}`, content, function (err) {
            if (err) throw err;
            console.log(`Compiled ${pathOut}/${fileName}`);
        });
    });
};

var parseSass = function (file, minify) {
    var filename = `${file.slice(0, file.length - 5)}${minify ? '.min' : ''}.css`;
    var filePath = `${configs.pathIn}/${file}`;
    try {
        var result = sass.compile(filePath, {
            sourceMap: configs.sourceMap,
            style: minify ? 'compressed' : 'expanded'
        });
        writeFile(configs.pathOut, filename, result.css);

        if (configs.sourceMap && result.sourceMap) {
            writeFile(configs.pathOut, filename + '.map', result.sourceMap, false);
        }
    } catch (err) {
        console.error(err.formatted);
        process.exit(1);
    }
};

configs.files.forEach(function (file) {
    parseSass(file);
    if (configs.minify) {
        parseSass(file, true);
    }
});
