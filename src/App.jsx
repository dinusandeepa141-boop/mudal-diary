import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, X, Wallet, Sun, Moon, Languages } from "lucide-react";
import { storage } from "./storage.js";

const SIN_MONTHS = ["ජනවාරි","පෙබරවාරි","මාර්තු","අප්‍රේල්","මැයි","ජූනි","ජූලි","අගෝස්තු","සැප්තැම්බර්","ඔක්තෝබර්","නොවැම්බර්","දෙසැම්බර්"];
const SIN_MONTHS_SHORT = ["ජන","පෙබ","මාර්","අප්‍රේ","මැයි","ජූනි","ජූලි","අගෝ","සැප්","ඔක්","නොවැ","දෙසැ"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EN_MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DEFAULT_EXP_CATS = ["කෑම", "ගමන්වීම", "බිල්පත්"];
const DEFAULT_INC_CATS = ["වැටුප"];

// UI text for both languages. Category names / notes the user types in are
// left exactly as typed - only the app's own labels are translated here.
const STRINGS = {
  si: {
    appName: "මුදල් ඩයරිය",
    loading: "පූරණය වෙමින්...",
    balanceLabel: "මෙම මාසයේ ශේෂය",
    incomeLbl: "ආදායම්",
    expenseLbl: "වියදම්",
    targetLabel: "වියදම් ඉලක්කය",
    change: "වෙනස් කරන්න",
    save: "සුරකින්න",
    overBudget: (amt) => `ඉලක්කයට වඩා ${amt} වැඩිපුර වියදම් කර ඇත`,
    remaining: (amt) => `ඉතිරි ${amt} වියදම් කළ හැක`,
    expenseTab: "වියදමක්",
    incomeTab: "ආදායමක්",
    amountPlaceholder: "මුදල",
    manageCats: "+ ප්‍රවර්ග",
    closeCats: "✕",
    newCatPlaceholder: "අලුත් ප්‍රවර්ගයක් (උදා: බෙහෙත්)",
    add: "එකතු කරන්න",
    notePlaceholder: "සටහනක් (විකල්ප)",
    addExpense: "වියදම එකතු කරන්න",
    addIncome: "ආදායම එකතු කරන්න",
    emptyState: "තවම ගනුදෙනු නැත. ඉහළින් එකක් එකතු කරන්න.",
    saving: "සුරකිමින්...",
    autosave: "දත්ත ස්වයංක්‍රීයව සුරකිනු ලැබේ",
    currency: "රු. ",
    months: SIN_MONTHS,
    monthsShort: SIN_MONTHS_SHORT,
    langBtn: "EN",
  },
  en: {
    appName: "Money Diary",
    loading: "Loading...",
    balanceLabel: "This month's balance",
    incomeLbl: "Income",
    expenseLbl: "Expenses",
    targetLabel: "Spending target",
    change: "change",
    save: "Save",
    overBudget: (amt) => `${amt} over your target`,
    remaining: (amt) => `${amt} left to spend`,
    expenseTab: "Expense",
    incomeTab: "Income",
    amountPlaceholder: "Amount",
    manageCats: "+ Categories",
    closeCats: "✕",
    newCatPlaceholder: "New category (e.g. Medicine)",
    add: "Add",
    notePlaceholder: "Note (optional)",
    addExpense: "Add expense",
    addIncome: "Add income",
    emptyState: "No transactions yet. Add one above.",
    saving: "Saving...",
    autosave: "Data saves automatically",
    currency: "Rs. ",
    months: EN_MONTHS,
    monthsShort: EN_MONTHS_SHORT,
    langBtn: "සිං",
  },
};

function fmtMoney(n, currency) {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(Math.round(n));
  return sign + currency + v.toLocaleString("en-US");
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function fmtDate(dateStr, monthsShort) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [expCats, setExpCats] = useState(DEFAULT_EXP_CATS);
  const [incCats, setIncCats] = useState(DEFAULT_INC_CATS);
  const [target, setTarget] = useState(30000);
  const [lang, setLang] = useState("si"); // si | en
  const [theme, setTheme] = useState("light"); // light | dark

  const [tab, setTab] = useState("expense"); // expense | income
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(DEFAULT_EXP_CATS[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayStr());
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showTargetEdit, setShowTargetEdit] = useState(false);
  const [targetInput, setTargetInput] = useState("30000");

  const t = STRINGS[lang];

  // load
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("mudal-diary-data");
        if (res && res.value) {
          const data = JSON.parse(res.value);
          if (data.transactions) setTransactions(data.transactions);
          if (data.expCats) setExpCats(data.expCats);
          if (data.incCats) setIncCats(data.incCats);
          if (typeof data.target === "number") {
            setTarget(data.target);
            setTargetInput(String(data.target));
          }
          if (data.lang === "si" || data.lang === "en") setLang(data.lang);
          if (data.theme === "light" || data.theme === "dark") setTheme(data.theme);
        }
      } catch (e) {
        // no existing data yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // persist
  useEffect(() => {
    if (!loaded) return;
    const save = async () => {
      setSaving(true);
      try {
        await storage.set(
          "mudal-diary-data",
          JSON.stringify({ transactions, expCats, incCats, target, lang, theme })
        );
      } catch (e) {
        console.error("save failed", e);
      } finally {
        setSaving(false);
      }
    };
    save();
  }, [transactions, expCats, incCats, target, lang, theme, loaded]);

  useEffect(() => {
    setCategory(tab === "expense" ? expCats[0] || "" : incCats[0] || "");
  }, [tab, expCats, incCats]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.slice(0, 7) === monthKey),
    [transactions, monthKey]
  );

  const totalIncome = useMemo(
    () => monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [monthTx]
  );
  const totalExpense = useMemo(
    () => monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [monthTx]
  );
  const balance = totalIncome - totalExpense;
  const progressPct = target > 0 ? Math.min(100, (totalExpense / target) * 100) : 0;
  const overBudget = totalExpense > target;

  const grouped = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
    const map = {};
    for (const t of sorted) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    return Object.entries(map);
  }, [transactions]);

  function addTransaction() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !category) return;
    const t = {
      id: Date.now(),
      type: tab,
      amount: amt,
      category,
      note: note.trim(),
      date,
    };
    setTransactions((prev) => [...prev, t]);
    setAmount("");
    setNote("");
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function addCategory() {
    const name = newCatName.trim();
    if (!name) return;
    if (tab === "expense") {
      if (!expCats.includes(name)) setExpCats((p) => [...p, name]);
    } else {
      if (!incCats.includes(name)) setIncCats((p) => [...p, name]);
    }
    setNewCatName("");
  }

  function removeCategory(name) {
    if (tab === "expense") setExpCats((p) => p.filter((c) => c !== name));
    else setIncCats((p) => p.filter((c) => c !== name));
  }

  function saveTarget() {
    const v = parseFloat(targetInput);
    if (!isNaN(v) && v >= 0) setTarget(v);
    setShowTargetEdit(false);
  }

  const activeCats = tab === "expense" ? expCats : incCats;

  if (!loaded) {
    return (
      <div data-theme={theme} style={{ ...styles.page, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>{t.loading}</div>
        <StyleBlock />
      </div>
    );
  }

  return (
    <div data-theme={theme} style={styles.page}>
      <StyleBlock />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerRow}>
          <div style={styles.brand}>
            <Wallet size={18} color="var(--gold)" strokeWidth={2.2} />
            <span style={styles.brandText}>{t.appName}</span>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.monthPill}>{t.months[now.getMonth()]} {now.getFullYear()}</div>
            <button
              style={styles.iconBtn}
              onClick={() => setLang((l) => (l === "si" ? "en" : "si"))}
              aria-label="toggle language"
              title={lang === "si" ? "Switch to English" : "සිංහල භාවිතා කරන්න"}
            >
              <Languages size={14} />
              <span style={styles.iconBtnLabel}>{t.langBtn}</span>
            </button>
            <button
              style={styles.iconBtnRound}
              onClick={() => setTheme((th) => (th === "light" ? "dark" : "light"))}
              aria-label="toggle dark mode"
              title={theme === "light" ? "Dark mode" : "Light mode"}
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </div>

        {/* Hero balance */}
        <div style={styles.hero}>
          <div style={styles.heroLabel}>{t.balanceLabel}</div>
          <div style={{ ...styles.heroAmount, color: balance < 0 ? "var(--expense)" : "#fff" }}>
            {fmtMoney(balance, t.currency)}
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStatItem}>
              <TrendingUp size={14} color="var(--income)" />
              <span style={{ color: "var(--income)", fontWeight: 600 }}>{fmtMoney(totalIncome, t.currency)}</span>
              <span style={styles.heroStatLabel}>{t.incomeLbl}</span>
            </div>
            <div style={styles.heroDivider} />
            <div style={styles.heroStatItem}>
              <TrendingDown size={14} color="var(--expense)" />
              <span style={{ color: "var(--expense)", fontWeight: 600 }}>{fmtMoney(totalExpense, t.currency)}</span>
              <span style={styles.heroStatLabel}>{t.expenseLbl}</span>
            </div>
          </div>
        </div>

        {/* Target progress */}
        <div style={styles.card}>
          <div style={styles.targetRow}>
            <div style={styles.targetLabel}>{t.targetLabel}</div>
            {!showTargetEdit ? (
              <button
                style={styles.linkBtn}
                onClick={() => {
                  setTargetInput(String(target));
                  setShowTargetEdit(true);
                }}
              >
                {fmtMoney(target, t.currency)} · {t.change}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  style={styles.inlineInput}
                  autoFocus
                />
                <button style={styles.smallBtn} onClick={saveTarget}>{t.save}</button>
              </div>
            )}
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progressPct}%`,
                background: overBudget ? "var(--expense)" : "var(--primary)",
              }}
            />
          </div>
          <div style={styles.progressCaption}>
            {overBudget
              ? t.overBudget(fmtMoney(totalExpense - target, t.currency))
              : t.remaining(fmtMoney(target - totalExpense, t.currency))}
          </div>
        </div>

        {/* Add transaction */}
        <div style={styles.card}>
          <div style={styles.tabRow}>
            <button
              style={{ ...styles.tabBtn, ...(tab === "expense" ? styles.tabBtnActiveExp : {}) }}
              onClick={() => setTab("expense")}
            >
              {t.expenseTab}
            </button>
            <button
              style={{ ...styles.tabBtn, ...(tab === "income" ? styles.tabBtnActiveInc : {}) }}
              onClick={() => setTab("income")}
            >
              {t.incomeTab}
            </button>
          </div>

          <div style={styles.formGrid}>
            <input
              type="number"
              placeholder={t.amountPlaceholder}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.amountInput}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          <div style={styles.chipRow}>
            {activeCats.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  ...styles.chip,
                  ...(category === c
                    ? tab === "expense"
                      ? styles.chipActiveExp
                      : styles.chipActiveInc
                    : {}),
                }}
              >
                {c}
              </button>
            ))}
            <button style={styles.chipManage} onClick={() => setShowCatManager((s) => !s)}>
              {showCatManager ? t.closeCats : t.manageCats}
            </button>
          </div>

          {showCatManager && (
            <div style={styles.catManager}>
              <div style={styles.catManagerList}>
                {activeCats.map((c) => (
                  <div key={c} style={styles.catManagerItem}>
                    <span>{c}</span>
                    <button style={styles.catRemoveBtn} onClick={() => removeCategory(c)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  placeholder={t.newCatPlaceholder}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  style={styles.catInput}
                />
                <button style={styles.smallBtn} onClick={addCategory}>{t.add}</button>
              </div>
            </div>
          )}

          <input
            placeholder={t.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.noteInput}
          />

          <button
            style={{
              ...styles.addBtn,
              background: tab === "expense" ? "var(--expense)" : "var(--income)",
            }}
            onClick={addTransaction}
          >
            <Plus size={16} strokeWidth={2.5} />
            {tab === "expense" ? t.addExpense : t.addIncome}
          </button>
        </div>

        {/* Transaction list */}
        <div style={styles.listSection}>
          {grouped.length === 0 && (
            <div style={styles.emptyState}>{t.emptyState}</div>
          )}
          {grouped.map(([d, items]) => (
            <div key={d} style={{ marginBottom: 18 }}>
              <div style={styles.dateHeader}>{fmtDate(d, t.monthsShort)}</div>
              {items.map((tx) => (
                <div key={tx.id} style={styles.txRow}>
                  <div style={styles.txLeft}>
                    <div style={styles.txCategory}>{tx.category}</div>
                    {tx.note && <div style={styles.txNote}>{tx.note}</div>}
                  </div>
                  <div style={styles.txRight}>
                    <span
                      style={{
                        color: tx.type === "income" ? "var(--income)" : "var(--expense)",
                        fontWeight: 700,
                      }}
                    >
                      {tx.type === "income" ? "+" : "-"}{fmtMoney(tx.amount, t.currency).replace("-", "")}
                    </span>
                    <button style={styles.deleteBtn} onClick={() => deleteTransaction(tx.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.footerNote}>{saving ? t.saving : t.autosave}</div>
      </div>
    </div>
  );
}

function StyleBlock() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&display=swap');
      :root, [data-theme="light"] {
        --bg: #F3F6F1;
        --surface: #FFFFFF;
        --ink: #1C2321;
        --ink-soft: #62726A;
        --primary: #1F4B43;
        --primary-soft: #2E6357;
        --gold: #C9A24B;
        --income: #3F7A5B;
        --expense: #A8402F;
        --border: #E1E7DE;
      }
      [data-theme="dark"] {
        --bg: #12181A;
        --surface: #1B2224;
        --ink: #ECF1EE;
        --ink-soft: #8FA098;
        --primary: #2E6357;
        --primary-soft: #3F7A6C;
        --gold: #D9B968;
        --income: #55A57C;
        --expense: #D9705B;
        --border: #2A3436;
      }
      * { box-sizing: border-box; font-family: 'Noto Sans Sinhala', sans-serif; }
      input:focus { outline: 2px solid var(--primary-soft); outline-offset: 1px; }
      button:focus-visible { outline: 2px solid var(--primary-soft); outline-offset: 2px; }
      button { cursor: pointer; font-family: 'Noto Sans Sinhala', sans-serif; }
      input { background: var(--surface); color: var(--ink); }
      input::placeholder { color: var(--ink-soft); opacity: 0.8; }
    `}</style>
  );
}

const styles = {
  page: {
    background: "var(--bg)",
    minHeight: "100%",
    width: "100%",
    padding: "20px 14px 40px",
    transition: "background 0.2s ease",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandText: { fontSize: 17, fontWeight: 700, color: "var(--primary)", letterSpacing: 0.2 },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  monthPill: {
    fontSize: 12.5,
    color: "var(--ink-soft)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "5px 12px",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "var(--ink-soft)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "6px 10px",
  },
  iconBtnLabel: { lineHeight: 1 },
  iconBtnRound: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    color: "var(--ink-soft)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "50%",
    padding: 0,
  },
  hero: {
    background: "var(--primary)",
    borderRadius: 18,
    padding: "22px 20px",
    marginBottom: 14,
    color: "#fff",
  },
  heroLabel: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 6 },
  heroAmount: { fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 16 },
  heroStats: { display: "flex", alignItems: "center", gap: 14 },
  heroStatItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, background: "rgba(255,255,255,0.08)", padding: "6px 10px", borderRadius: 10 },
  heroStatLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  heroDivider: { width: 1, height: 14, background: "rgba(255,255,255,0.2)" },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  targetRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 },
  targetLabel: { fontSize: 14, fontWeight: 600, color: "var(--ink)" },
  linkBtn: { background: "none", border: "none", color: "var(--primary-soft)", fontSize: 12.5, fontWeight: 600, padding: 0 },
  progressTrack: { height: 9, background: "var(--bg)", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" },
  progressFill: { height: "100%", borderRadius: 6, transition: "width 0.4s ease" },
  progressCaption: { fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 },
  inlineInput: { width: 100, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 },
  smallBtn: { background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600 },
  tabRow: { display: "flex", gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, padding: "9px 0", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--ink-soft)", fontSize: 14, fontWeight: 600 },
  tabBtnActiveExp: { background: "var(--expense)", color: "#fff", borderColor: "var(--expense)" },
  tabBtnActiveInc: { background: "var(--income)", color: "#fff", borderColor: "var(--income)" },
  formGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 8, marginBottom: 10 },
  amountInput: { padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 15, fontWeight: 600, color: "var(--ink)" },
  dateInput: { padding: "10px 10px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, color: "var(--ink-soft)" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 },
  chip: { padding: "6px 13px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--ink-soft)", fontSize: 13 },
  chipActiveExp: { background: "var(--expense)", color: "#fff", borderColor: "var(--expense)" },
  chipActiveInc: { background: "var(--income)", color: "#fff", borderColor: "var(--income)" },
  chipManage: { padding: "6px 13px", borderRadius: 20, border: "1px dashed var(--border)", background: "transparent", color: "var(--primary-soft)", fontSize: 12.5, fontWeight: 600 },
  catManager: { background: "var(--bg)", borderRadius: 12, padding: 12, marginBottom: 10 },
  catManagerList: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 },
  catManagerItem: { display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 6px 5px 12px", fontSize: 12.5 },
  catRemoveBtn: { background: "var(--border)", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" },
  catInput: { flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 },
  noteInput: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13.5, marginBottom: 12 },
  addBtn: { width: "100%", padding: "12px 0", borderRadius: 12, border: "none", color: "#fff", fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 },
  listSection: { marginTop: 4 },
  emptyState: { textAlign: "center", color: "var(--ink-soft)", fontSize: 13.5, padding: "30px 0" },
  dateHeader: { fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8, paddingLeft: 2 },
  txRow: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", marginBottom: 7 },
  txLeft: { display: "flex", flexDirection: "column", gap: 2 },
  txCategory: { fontSize: 14, fontWeight: 600, color: "var(--ink)" },
  txNote: { fontSize: 12, color: "var(--ink-soft)" },
  txRight: { display: "flex", alignItems: "center", gap: 10 },
  deleteBtn: { background: "none", border: "none", color: "var(--ink-soft)", padding: 4, display: "flex" },
  footerNote: { textAlign: "center", fontSize: 11.5, color: "var(--ink-soft)", marginTop: 10, opacity: 0.7 },
};
