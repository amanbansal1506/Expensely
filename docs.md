# Expense Tracker — Code Structure & Notes

## Data Model
Each transaction:
```js
{ id, type: 'income' | 'expense', date: 'YYYY-MM-DD', description, category, amount: number }
```

## Storage
- Persisted in `localStorage` under the key `transactions`.
- `getStore()` / `setStore()` helpers manage read/write.

## UI Flow
- **Form** handles add/update (`upsertTransaction()`); hidden input `#edit-id` tracks editing state.
- **Reset** restores form to add mode.
- **Table** renders from filtered transactions; provides Edit/Delete actions.
- **Summary** computes totals over all transactions.
- **Filters**: type, category, and search text (description match).
- **Chart**: pie of expenses by category; rebuilt on each render.

## Validation
- Required fields: type, date, description, category, amount > 0.
- Inline error spans show per-field errors.

## Import/Export
- Export: downloads a `transactions-YYYY-MM-DD.json` file.
- Import: validates basic structure before replacing store.

## Responsiveness
- Grid collapses on smaller screens via media queries.
- Cards and panels share a consistent dark theme and elevation.
