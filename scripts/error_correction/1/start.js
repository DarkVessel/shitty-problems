const Enquirer = require("enquirer");
const enquirer = new Enquirer();
const child_process = require("child_process");
const { readFileSync } = require("fs");
module.exports = new Promise(async resolve => {
    const df = child_process.execSync("df -h").toString().split("\n");
    const promptFolder = await questionSelect({
        name: "input",
        message: `> Выберите раздел`,
        choices: df
    }, [{ check: (d) => d === df[0].message }]);

    let folder = promptFolder.split(" ").slice(-1)[0]
    console.clear();
    console.log("> Папка монтирования: ", formatColor("YELLOW", folder));

    const users = readFileSync("/etc/passwd")
        .toString()
        .split("\n")
        .map(str => str.split(":"))
        .filter(arr => arr[2] >= 1000 && arr[0] !== "nobody")
        .map(arr => arr[0]);
    users.push("root");

    const username = await new Enquirer.Select({
        name: "username",
        message: `> Выберите своего пользователя`,
        choices: users
    }).run();

    resolve(`sudo chown ${username} ${folder}\necho -e "> \\e[32mСкрипт завершил свою работу!\\e[0m"`);
});