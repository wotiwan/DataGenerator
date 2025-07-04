function generateData() {
  const rowCount = parseInt(document.getElementById("rowCount").value, 10) || 10;
  const tableName = document.getElementById("tableName").value;
  const columnDivs = document.querySelectorAll(".column");

  const columns = [];

  columnDivs.forEach(div => {
    const col = {};

    // Безопасное получение типа колонки
    const typeElement = div.querySelector('select[name="type"]') || div.querySelector('input[name="type"]');
    const type = typeElement ? typeElement.value : "unknown";
    col["type"] = type;

    const nameInput = div.querySelector('input[name="name"]');
    col["name"] = nameInput ? nameInput.value : "";

    // Обработка категориальных данных
    if (type === "categorical") {
      const categoryRows = div.querySelectorAll(".category-row");
      const values = [];
      categoryRows.forEach(row => {
        const valueInput = row.querySelector('input[name="category_value"]');
        const probInput = row.querySelector('input[name="category_prob"]');
        if (valueInput && probInput && valueInput.value) {
          const label = valueInput.value.trim();
          const prob = parseFloat(probInput.value);
          if (!isNaN(prob)) {
            values.push([label, prob]);
          }
        }
      });
      col["values"] = values;
    }
    // Обработка остальных типов
    else {
      const inputs = div.querySelectorAll("input, select, textarea");
      inputs.forEach(input => {
        const key = input.name;
        if (!key || key === "name" || key === "type") return;

        // Парсим числовые поля
        if (["min", "max", "avg", "std", "missing_values"].includes(key)) {
          const numValue = parseFloat(input.value);
          if (!isNaN(numValue)) {
            col[key] = numValue;
          }
        }
        // Обрабатываем обычные поля
        else {
          col[key] = input.value;
        }
      });
    }

    columns.push(col);
  });

  const payload = {
    table_name: tableName,
    n_rows: rowCount,
    columns: columns
  };

  console.log("JSON payload:", payload);

  fetch("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableName || "data"}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      document.getElementById("message").textContent = "Файл успешно сгенерирован!";
    })
    .catch(err => {
      console.error("Ошибка при генерации:", err);
      document.getElementById("message").textContent = "Ошибка при генерации файла.";
    });
}