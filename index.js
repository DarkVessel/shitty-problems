const child_process = require("child_process");
const fs = require("fs");
const colors = {
    RED: "31",
    YELLOW: "33",
    GREEN: "32"
};

// Возвращает цветной текст.
const formatColor = (type, text) => `\x1b[${colors[type]}m${text}\x1b[0m`;

console.log("\n>", formatColor("YELLOW", 'Проверка наличие модуля "enquirer"'));

// Проходится по папкам и собирает всю нужную инфу, такую как: 
// Меню и путь до папок.
function processFolder(info, folder) {

    const menu = {};

    for (const key in info) {
        menu[info[key]] = {
            folderName: key,
            folder,
        };

        // Проверяем наличие файла "info.json"
        if (fs.existsSync(folder + key + "/info.json")) {
            const data = require(folder + key + "/info.json");
            menu[info[key]].menu = processFolder(data, folder + key + "/"); // Обрабатываем ещё одно меню
        };
    };

    return menu;
};

// "key.key2" => obj["key"]["key2"]
function getValue(obj, key) {
    if (!key.length) return obj;

    let tmp = obj;
    for (let i = 0; i < key.length; i++) {
        if ((key.length - 1) == i) {
            return tmp[key[i]] // Последний ключ.
        };
        tmp = tmp[key[i]].menu;
    };
};

// path - Массив из подменюшек.
// currentMenu - Текущее меню ( processFolder )
// menu - Оригинальное меню.
// Функция генерирует меню и обрабатывает скрипты.
function generateMenu(path, currentMenu, menu) {
    console.log();
    const choices = (path.length ? ["> Назад"] : [])
        .concat(Object.keys(currentMenu));

    const prompt = new enquirer.Select({
        name: path[path.length - 1] || "start",
        message: `> ${path.join("/")}\nВыберите пункт...`,
        choices
    });

    prompt.run()
        .then((d) => {
            // Если назад - удаляем последний элемент.
            if (d === "> Назад") path.pop();
            else path.push(d);

            // Получаем менюшку.
            const value = getValue(menu, path);

            if (value.menu || !path.length) {
                generateMenu(path, path.length ? value.menu : value, menu);
            } else {
                const pathScript = `${value.folder}${value.folderName}/start.`;

                if (!fs.existsSync(pathScript + "bash")) {
                    console.log(">", formatColor("RED", `Скрипт ${value.folder}${value.folderName}/start.bash не найден.\nПожалуйста, сообщите об этом в #Issues нашего GitHub-репозитория.`))
                } else if (!fs.existsSync(pathScript + "js")) {
                    console.log(">", formatColor("GREEN", `Выполнится скрипт по адресу ${value.folder}${value.folderName}/start.bash\nВыполнятся такие команды:`));
                    console.log();
                    const code = fs.readFileSync(pathScript + "bash").toString();
                    console.log(code);
                    console.log();

                    const prompt = new enquirer.Toggle({
                        message: 'Запускаю скрипт?',
                        enabled: 'Да!',
                        disabled: 'Не-е-е-т!!!'
                    });

                    prompt.run()
                        .then((bool) => {
                            if (!bool) {
                                console.log(">", formatColor("RED", "Запуск отменён."));
                                console.log();

                                path.pop();
                                const value = getValue(menu, path);
                                generateMenu(path, path.length ? value.menu : value, menu);
                                
                                return;
                            }
                            console.log(">", formatColor("YELLOW", "Создаю start.bash..."));
                            fs.writeFileSync("./start.bash", code);
                            console.log(">", formatColor("YELLOW", "Запускаю start.bash..."));
                        }).catch(console.error);
                } else {
                    require(pathScript + "js");
                }
            };
        }).catch(console.error);
}

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
    const path = [];
    const info = require("./scripts/info.json");
    const menu = processFolder(info, "./scripts/");

    console.clear();

    generateMenu(path, getValue(menu, path), menu);
})