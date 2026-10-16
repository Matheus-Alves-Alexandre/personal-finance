import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Synthetic transactions only. No account access or financial data is read.
const output = fileURLToPath(new URL("../examples/demo/", import.meta.url));
const columns = [
  "date",
  "symbol",
  "instrumentType",
  "quantity",
  "activityType",
  "unitPrice",
  "currency",
  "fee",
  "amount",
  "comment",
];
const accounts = [
  {
    file: "investimentos-br.csv",
    name: "Investimentos Brasil - DEMO",
    currency: "BRL",
    rows: [],
    holdings: {},
    cash: 0,
  },
  {
    file: "investimentos-us.csv",
    name: "Investimentos Exterior - DEMO",
    currency: "USD",
    rows: [],
    holdings: {},
    cash: 0,
  },
  {
    file: "conta-corrente.csv",
    name: "Conta Corrente - DEMO",
    currency: "BRL",
    rows: [],
    holdings: {},
    cash: 0,
  },
];

function add(
  account,
  date,
  activityType,
  amount,
  comment,
  symbol = "",
  quantity = 1,
  unitPrice = 1,
  fee = 0,
) {
  const value = Number(amount.toFixed(2));
  if (activityType === "BUY" || activityType === "SELL") {
    account.holdings[symbol] =
      (account.holdings[symbol] ?? 0) + (activityType === "BUY" ? quantity : -quantity);
    assert.ok(account.holdings[symbol] >= 0, `Negative holding: ${symbol}`);
  }
  const debit = ["BUY", "WITHDRAWAL", "FEE", "TAX"].includes(activityType);
  account.cash = Number((account.cash + (debit ? -value : value) - fee).toFixed(2));
  assert.ok(account.cash >= 0, `Negative cash: ${account.name} on ${date}`);
  assert.ok(date <= "2026-10-16", `Future transaction: ${date}`);
  account.rows.push({
    date,
    symbol,
    instrumentType: symbol ? "EQUITY" : "",
    quantity,
    activityType,
    unitPrice,
    currency: account.currency,
    fee,
    amount: value,
    comment: `DADO FICTICIO - ${comment}`,
  });
}

add(accounts[0], "2025-04-01", "DEPOSIT", 60000, "Saldo inicial de demonstracao");
add(accounts[1], "2025-04-01", "DEPOSIT", 15000, "Saldo inicial de demonstracao");
add(accounts[2], "2025-04-01", "DEPOSIT", 12000, "Saldo inicial de demonstracao");

for (let index = 0; index < 19; index++) {
  const year = 2025 + Math.floor((index + 3) / 12);
  const month = String(((index + 3) % 12) + 1).padStart(2, "0");
  const date = (day) => `${year}-${month}-${String(day).padStart(2, "0")}`;
  add(accounts[0], date(2), "DEPOSIT", 3000, "Aporte mensal");
  for (const [symbol, quantity, initialPrice] of [
    ["PETR4.SA", 20, 36],
    ["VALE3.SA", 10, 57],
    ["ITUB4.SA", 15, 31],
    ["BOVA11.SA", 5, 128],
    ["HGLG11.SA", 4, 159],
  ]) {
    const price = Number((initialPrice * (1 + index * 0.004 + Math.sin(index) * 0.035)).toFixed(2));
    add(
      accounts[0],
      date(5),
      "BUY",
      quantity * price,
      "Compra simulada",
      symbol,
      quantity,
      price,
      1.5,
    );
  }
  add(
    accounts[0],
    date(10),
    "DIVIDEND",
    (index + 1) * 4 * 1.1,
    "Rendimento simulado de FII",
    "HGLG11.SA",
  );
  if (index % 3 === 2)
    add(accounts[0], date(12), "DIVIDEND", 85 + index * 3, "Dividendos simulados", "PETR4.SA");
  if (index === 9 || index === 15)
    add(accounts[0], date(13), "SELL", 10 * 39, "Venda parcial simulada", "PETR4.SA", 10, 39, 1.5);

  add(accounts[1], date(2), "DEPOSIT", 1000, "Aporte mensal em dolar");
  for (const [symbol, quantity, initialPrice] of [
    ["AAPL", 2, 195],
    ["MSFT", 1, 415],
    ["VOO", 1, 515],
  ]) {
    const price = Number(
      (initialPrice * (1 + index * 0.006 + Math.sin(index + 1) * 0.025)).toFixed(2),
    );
    add(
      accounts[1],
      date(6),
      "BUY",
      quantity * price,
      "Compra simulada no exterior",
      symbol,
      quantity,
      price,
    );
  }
  if (index % 3 === 2)
    add(accounts[1], date(12), "DIVIDEND", 12 + index, "Dividendo trimestral simulado", "VOO");

  add(accounts[2], date(2), "DEPOSIT", 8500, "Salario ficticio");
  const expenses = [
    [3, 2300, "Aluguel"],
    [4, 760 + (index % 4) * 32, "Supermercado"],
    [5, 180, "Energia eletrica"],
    [6, 119.9, "Internet"],
    [7, 280 + (index % 3) * 25, "Transporte"],
    [8, 310 + (index % 4) * 20, "Restaurantes"],
    [9, 149.9, "Academia"],
    [10, 89.9, "Assinaturas"],
    [11, 220, "Farmacia e saude"],
    [13, 240 + (index % 5) * 30, "Lazer"],
  ];
  for (const [day, amount, description] of expenses)
    add(accounts[2], date(day), "WITHDRAWAL", amount, description);
  add(accounts[2], date(14), "INTEREST", 38 + index * 1.5, "Rendimento ficticio de saldo");
}

mkdirSync(output, { recursive: true });
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
for (const account of accounts) {
  const content =
    [
      columns.join(","),
      ...account.rows.map((row) => columns.map((column) => escape(row[column])).join(",")),
    ].join("\n") + "\n";
  writeFileSync(`${output}/${account.file}`, content, "utf8");
}
const summary = accounts.map(({ name, currency, file, rows, cash, holdings }) => ({
  name,
  currency,
  file,
  transactions: rows.length,
  endingCash: cash,
  holdings,
}));
writeFileSync(
  `${output}/summary.json`,
  JSON.stringify(
    { synthetic: true, start: "2025-04-01", end: "2026-10-14", accounts: summary },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(summary, null, 2));
