let columnId = 0;

function addColumn(defaultName = "", defaultType = "") {
  const container = document.getElementById("columns");

  // Внешняя обёртка
  const div = document.createElement("div");
  div.className = "column";

  // Внутренний контейнер для всех настроек и полей
  const inner = document.createElement("div");
  inner.className = "column-content";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.placeholder = "Название колонки";
  nameInput.value = defaultName;

  const typeSelect = document.createElement("select");
  typeSelect.name = "type";
  typeSelect.innerHTML = `
    <option value="id">ID</option>
    <option value="name">Имя</option>
    <option value="email">Email</option>
    <option value="address">Адрес</option>
    <option value="phone">Телефон</option>
    <option value="date">Дата</option>
    <option value="number">Число</option>
    <option value="age">Возраст</option>
    <option value="dog_breed">Порода собак</option>
    <option value="categorical">Категориальный</option>
    <option value="lightning">Гроза</option>
    <option value="rainfall">Осадки</option>
  `;
  typeSelect.value = defaultType || "name";
  nameInput.value = typeSelect.value;
  typeSelect.onchange = () => updateSettings(typeSelect);

  const settingsDiv = document.createElement("div");
  settingsDiv.className = "extra-settings";

  // Кнопка "Удалить"
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Удалить";
  removeBtn.type = "button";
  removeBtn.className = "delete-btn";
  removeBtn.onclick = () => div.remove();

  // Вкладываем элементы
  inner.appendChild(nameInput);
  inner.appendChild(typeSelect);
  inner.appendChild(settingsDiv);

  // Добавляем внутренний и кнопку в основной блок
  div.appendChild(inner);
  div.appendChild(removeBtn);
  container.appendChild(div);

  // Обновление настроек через микрозадержку
  setTimeout(() => updateSettings(typeSelect), 0);
}




function updateSettings(selectElement) {
  const type = selectElement.value;
  const nameInput = selectElement.parentElement.querySelector('input[name="name"]');
if (nameInput) {
  nameInput.value = type;
}
  const settingsDiv = selectElement.parentElement.querySelector(".extra-settings");
  const columnDiv = settingsDiv.parentElement;
  console.log(columnDiv);
  settingsDiv.innerHTML = "";
  settingsDiv.style.display = "none";

  if (type === "name") {
    settingsDiv.style.display = "block";

    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Тип: ";

    const typeSelect = document.createElement("select");
    typeSelect.name = "type";
    typeSelect.innerHTML = `
      <option value="name">ФИО</option>
      <option value="last_name">Фамилия</option>
      <option value="first_name">Имя</option>
      <option value="middle_name">Отчество</option>
    `;

    const genderLabel = document.createElement("label");
    genderLabel.textContent = "Пол: ";

    const genderSelect = document.createElement("select");
    genderSelect.name = "gender";
    genderSelect.innerHTML = `
      <option value="">Любой</option>
      <option value="_male">Мужской</option>
      <option value="_female">Женский</option>
    `;

    settingsDiv.appendChild(typeLabel);
    settingsDiv.appendChild(typeSelect);
    settingsDiv.appendChild(genderLabel);
    settingsDiv.appendChild(genderSelect);
  }

if (type === "number") {
  settingsDiv.style.display = "block";

  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Тип: ";

  const typeSelect = document.createElement("select");
  typeSelect.name = "num_type";
  typeSelect.innerHTML = `
    <option value="continuous">Непрерывный</option>
    <option value="discrete">Дискретный</option>
  `;

  const distLabel = document.createElement("label");
  distLabel.textContent = "Распределение: ";

  const distSelect = document.createElement("select");
  distSelect.name = "distribution";
  distSelect.innerHTML = `
    <option value="normal">Нормальное</option>
    <option value="uniform">Равномерное</option>
  `;

  const numericSettingsDiv = document.createElement("div");
  numericSettingsDiv.className = "numeric-settings";

  const fields = [
    { name: "min", placeholder: "min" },
    { name: "max", placeholder: "max" },
    { name: "avg", placeholder: "avg" },
    { name: "std", placeholder: "std" },
    { name: "missing_values", placeholder: "missing (0–1)" }
  ];

  fields.forEach(f => {
    const input = document.createElement("input");
    input.name = f.name;
    input.type = "number";
    input.placeholder = f.placeholder;
    input.step = "any";
    numericSettingsDiv.appendChild(input);
  });

  settingsDiv.appendChild(typeLabel);
  settingsDiv.appendChild(typeSelect);
  settingsDiv.appendChild(distLabel);
  settingsDiv.appendChild(distSelect);
  columnDiv.appendChild(numericSettingsDiv);
}


if (type === "dog_breed" || type === "rainfall") {
  settingsDiv.style.display = "block";

  const dependentsDiv = document.createElement("div");
  dependentsDiv.className = "dependents";

  const label = document.createElement("label");
  label.textContent = "Добавить зависимую колонку: ";

  const dependentSelect = document.createElement("select");

  // Разные опции в зависимости от типа родительской колонки
  if (type === "dog_breed") {
    dependentSelect.innerHTML = `
      <option value="">-- выбрать --</option>
      <option value="age">Возраст</option>
      <option value="weight">Вес</option>
    `;
  } else if (type === "rainfall") {
    const missingValuesDiv = document.createElement("div");
    missingValuesDiv.className = "missing-values";

    const missingLabel = document.createElement("label");
    missingLabel.textContent = "Пропущенные значения: ";

    const missingInput = document.createElement("input");
    missingInput.type = "number";
    missingInput.name = "missing_values";
    missingInput.placeholder = "0-1";
    missingInput.min = "0";
    missingInput.max = "1";
    missingInput.step = "0.01";
    missingInput.value = "0";

    missingValuesDiv.appendChild(missingLabel);
    missingValuesDiv.appendChild(missingInput);
    settingsDiv.appendChild(missingValuesDiv);
    dependentSelect.innerHTML = `
      <option value="">-- выбрать --</option>
      <option value="lightning_type">Тип молнии</option>
      <option value="lightning_terrain">Местность молнии</option>
    `;
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "Добавить";
  addBtn.type = "button";
  addBtn.onclick = () => {
    const selected = dependentSelect.value;
    if (!selected) return;

    const parentName = selectElement.parentElement.querySelector('input[name="name"]').value ||
                      (type === "dog_breed" ? "breed" : "rainfall");

    // Создаём зависимую колонку
    const container = document.getElementById("columns");
    const div = document.createElement("div");
    div.className = "column";

    // Название (можно редактировать)
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.placeholder = "Название колонки";
    nameInput.value = selected;

    // Тип (фиксированный, скрыт)
    const typeInput = document.createElement("input");
    typeInput.type = "hidden";
    typeInput.name = "type";
    typeInput.value = selected;

    // depends_on (фиксированный, скрыт)
    const dependsInput = document.createElement("input");
    dependsInput.type = "hidden";
    dependsInput.name = "depends_on";
    dependsInput.value = parentName;

    // Для lightning_type и lightning_terrain не добавляем distribution
    let distributionInput = null;
    if (type === "dog_breed") {
      distributionInput = document.createElement("input");
      distributionInput.type = "hidden";
      distributionInput.name = "distribution";
      distributionInput.value = "normal";
    }

    // Настройки (пусто, скрыто)
    const settings = document.createElement("div");
    settings.className = "extra-settings";

    const info = document.createElement("div");
    info.textContent = `Зависит от: ${parentName}`;
    info.style.fontSize = "12px";
    info.style.color = "#555";
    info.style.marginTop = "4px";

    // Кнопка удаления
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Удалить";
    removeBtn.type = "button";
    removeBtn.onclick = () => div.remove();

    // Собираем колонку
    div.appendChild(nameInput);
    div.appendChild(typeInput);
    div.appendChild(dependsInput);
    if (distributionInput) div.appendChild(distributionInput);
    div.appendChild(settings);
    div.appendChild(info);
    div.appendChild(removeBtn);

    container.appendChild(div);
    dependentSelect.value = ""; // сброс
  };

  dependentsDiv.appendChild(label);
  dependentsDiv.appendChild(dependentSelect);
  dependentsDiv.appendChild(addBtn);
  settingsDiv.appendChild(dependentsDiv);
  }

if (type === "categorical") {
  settingsDiv.style.display = "block";

  const instructions = document.createElement("p");
  instructions.textContent = "Укажите категории и их вероятности:";

  const listContainerWrapper = document.createElement("div");
  listContainerWrapper.className = "category-wrapper";

  const listContainer = document.createElement("div");
  listContainer.className = "category-list";
  listContainerWrapper.appendChild(listContainer);

  const addRow = () => {
    const row = document.createElement("div");
    row.className = "category-row";

    const valueInput = document.createElement("input");
    valueInput.name = "category_value";
    valueInput.placeholder = "Категория";
    valueInput.type = "text";

    const probInput = document.createElement("input");
    probInput.name = "category_prob";
    probInput.type = "number";
    probInput.step = "any";
    probInput.placeholder = "Вероятность (напр. 0.3)";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.type = "button";
    removeBtn.onclick = () => row.remove();

    row.appendChild(valueInput);
    row.appendChild(probInput);
    row.appendChild(removeBtn);
    listContainer.appendChild(row);  // 🔽 добавляется вниз
  };

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "Добавить категорию";
  addBtn.onclick = addRow;

  addRow(); // первая строка по умолчанию

  settingsDiv.appendChild(instructions);
  settingsDiv.appendChild(listContainerWrapper); // отдельный контейнер снизу
  settingsDiv.appendChild(addBtn);
}


  if (type === "date") {
  settingsDiv.style.display = "block";

  const startLabel = document.createElement("label");
  startLabel.textContent = "Начальная дата и время: ";

  const startInput = document.createElement("input");
  startInput.type = "datetime-local";
  startInput.name = "start_date";

  const endLabel = document.createElement("label");
  endLabel.textContent = "Конечная дата и время: ";

  const endInput = document.createElement("input");
  endInput.type = "datetime-local";
  endInput.name = "end_date";

  settingsDiv.appendChild(startLabel);
  settingsDiv.appendChild(startInput);
  settingsDiv.appendChild(endLabel);
  settingsDiv.appendChild(endInput);
}


  // Здесь можно добавить обработку других типов, например "number"
  // if (type === "number") { ... }
}

// Если хочешь — можно сразу добавить одну колонку по умолчанию:
document.addEventListener("DOMContentLoaded", () => {
  addColumn("id", "id");
});
