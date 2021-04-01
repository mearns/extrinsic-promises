const match = /^v([0-9]+)\.([0-9]+)\.([0-9]).*$/.exec(process.version);
if (!match) {
    process.exitCode = 2;
}
const [, major] = match;
const majorVersion = parseInt(major);
if (majorVersion >= 10) {
    process.exitCode = 0;
} else {
    process.exitCode = 1;
}
