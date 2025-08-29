# Expense Tracker

A responsive, user-friendly Expense Tracker web application built with **HTML, CSS, and JavaScript**.  
It enables users to add income and expense transactions, categorize them, see running totals, visualize expense distribution, and persist data to **LocalStorage**.

## Features (Per Requirements)
- Separate **income** and **expense** transactions
- Inputs for **date, description, category, amount**
- **Add / Edit / Delete** transactions
- **Totals**: Total Income, Total Expenses, and **Net Balance**
- **Search & Filters**: by type and category
- **Validation** with inline error messages
- **LocalStorage** persistence
- **Responsive** UI (desktop, tablet, mobile)
- **Export / Import** transactions as JSON
- **Pie Chart** of expenses by category (Chart.js)

## How to Run
1. Download and unzip the project.
2. Open `index.html` in your browser (double-click).
3. Start adding transactions using the form.
4. Use **Export JSON** to download your data; **Import JSON** to load previously saved transactions.

> Note: The chart uses a CDN import of Chart.js. Internet connection is required for the chart. All core functionality works offline.

## Project Structure
```
expense-tracker/
├── index.html     # UI layout + sections
├── style.css      # Styling + responsive design
├── app.js         # App logic, LocalStorage, filters, chart, export/import
└── README.md
```

## Tech Stack
- HTML5
- Modern CSS (responsive, dark theme)
- Vanilla JavaScript (ES6+)
- Chart.js (for pie chart)
