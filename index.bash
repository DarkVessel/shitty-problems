#! /usr/bin/env bash

# Цвета.
COLOR_RED="\e[31m"
COLOR_GREEN="\e[32m"
COLOR_YELLOW="\e[33m"
ENDCOLOR="\e[0m"

# Массив, из недостающих зависимостей.
declare -a missingDependencies

# Проверка, присутствует ли команда.
function check {
    if ! command -v $1 $> /dev/null; then
        missingDependencies+=("$2")
    fi
}

echo -e "> ${COLOR_YELLOW}Проверяю, все ли зависимости установлены... ${ENDCOLOR}"

# Проверка, присутствует ли pacman
if ! command -v pacman &> /dev/null; then
    echo -e "${COLOR_RED}У вас отсутствует пакетный менеджер 'pacman'.
Я, я не вижу его...я не смогу без него продолжать работу, простите, мне, нужно осмыслить свою жизнь... ${ENDCOLOR}"
    echo "";
    echo "K I L L E D"
fi

# Проверка.
check "git" "git"
check "node" "nodejs"

# Если элементов в массиве больше 0
if [ ${#missingDependencies[@]} -gt 0 ]; then
    echo -e "Буду установлены следующие зависимости: ${COLOR_YELLOW}${missingDependencies[@]} ${ENDCOLOR}"
    sudo pacman -S ${missingDependencies[@]}
    echo ""
fi

# Если не обнаружен npm
if ! command -v npm &> /dev/null; then
    echo -e "Не обнаружен ${COLOR_YELLOW}npm${ENDCOLOR}, доустанавливаю..."
    sudo pacman -S npm
fi

echo -e "${COLOR_GREEN}Все зависимости установлены!${ENDCOLOR}"
echo ""

echo -e "${COLOR_YELLOW}> Проверка обновлений...${ENDCOLOR}"
git pull
echo ""

echo -e "${COLOR_YELLOW}> Запуск.....${ENDCOLOR}"
echo -e "${COLOR_GREEN}node index.js${ENDCOLOR}"
node index.js