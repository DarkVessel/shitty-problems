const child_process = require("child_process");
const colors = {
    RED: "31",
    YELLOW: "33",
    GREEN: "32"
};

const formatColor = (type, text) => `\x1b[${colors[type]}m${text}\x1b[0m`;

console.log();
console.log(">", formatColor("YELLOW", 'Проверка наличие модуля "enquirer"'))

let enquirer;
new Promise(resolve => {
    try {
        enquirer = require("enquirer");
        resolve();
    } catch {
        console.log("Модуль отсутствует, установка...");
        console.log(formatColor("GREEN", "npm i"));

        child_process.execSync("npm i");
        enquirer = require("enquirer");
        console.log();

        resolve();
    }
}).then(async () => {
    const info = require("./scripts/info.json");
    console.clear();

    const prompt = new enquirer.Select({
        name: 'menu',
        message: 'Выберите пункт',
        choices: Object.keys(info).map(k => info[k])
    });

    prompt.run()
        .then(answer => console.log('Answer:', answer))
        .catch(console.error);
})