// server.js – მშენსერვისი (back-end)
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me-123"; // აუცილებლად შეცვალე!

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// 1 კვ.მ-ის საშუალო ფასი კალკულატორისთვის (₾)
const PRICE_PER_M2 = 350;

// სერვისები (გამოჩნდება მთავარ გვერდზე და შეკვეთის ფორმაში)
const SERVICES = [
  {
    id: "laminate",
    icon: "layers",
    title: "ლამინატის და იატაკის დაგება",
    priceFrom: 12,
    description:
      "მაღალი სიზუსტის მონტაჟი, თბოიზოლაციის ფენის მოწყობა და ხმის იზოლაცია იდეალური ზედაპირისთვის.",
    feature: "მომზადება + დაგება",
  },
  {
    id: "gypsum",
    icon: "layout-grid",
    title: "გიფსოკარდონის კონსტრუქციები და ჭერი",
    priceFrom: 18,
    description:
      "მრავალდონიანი შეკიდული ჭერები, ტიხრების ამოყვანა, ხმოვანი იზოლაცია და ფარული განათების ნიშები.",
    feature: "ლაზერული გასწორება",
  },
  {
    id: "paint",
    icon: "paint-roller",
    title: "სამღებრო სამუშაოები & შპაკლი",
    priceFrom: 14,
    description:
      "ზედაპირის იდეალური გრუნტვა, შპაკლვა და შეღებვა ეკოლოგიურად სუფთა პრემიუმ საღებავებით.",
    feature: "ულტრა-გლუვი ეფექტი",
  },
  {
    id: "tile",
    icon: "grid-3x3",
    title: "კაფელ-მეტლახისა და ფილის დაგება",
    priceFrom: 25,
    description:
      "დიდი ფორმატის კერამოგრანიტის ჭრა 45 გრადუსიანი კუთხით, ჰიდროიზოლაცია და ეპოქსიდური ფუგა.",
    feature: "45° იდეალური ჩამოჭრა",
  },
];
const OTHER_SERVICE = { id: "other", title: "სხვა / კონსულტაცია" };

// ---------- დამხმარე ფუნქციები ----------
function readJSON(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return fallback;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) writeJSON(ORDERS_FILE, []);

// მარტივი დაცვა სპამისგან: ერთი IP-დან 10 წუთში მაქსიმუმ 5 შეკვეთა
const recentOrders = new Map();
function tooManyRequests(ip) {
  const now = Date.now();
  const list = (recentOrders.get(ip) || []).filter(
    (t) => now - t < 10 * 60 * 1000,
  );
  if (list.length >= 5) return true;
  list.push(now);
  recentOrders.set(ip, list);
  return false;
}

const clean = (value, max) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

// ---------- middleware ----------
app.use(express.json({ limit: "50kb" }));
app.use(express.static(PUBLIC_DIR));

// ---------- გვერდები ----------
// "/" ავტომატურად იხსნება public/index.html-დან
const pages = { "/projects": "projects.html", "/order": "order.html" };
Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(PUBLIC_DIR, file)));
});

// ---------- API ----------

// სერვისების სია
app.get("/api/services", (req, res) => {
  res.json({ ok: true, services: SERVICES, other: OTHER_SERVICE });
});

// პროექტების სია (არასავალდებულო ფილტრი: /api/projects?category=gypsum)
app.get("/api/projects", (req, res) => {
  let projects = readJSON(PROJECTS_FILE);
  const { category } = req.query;
  if (category) projects = projects.filter((p) => p.category === category);
  res.json({ ok: true, projects });
});

// სწრაფი კალკულატორი: /api/calc?area=65
app.get("/api/calc", (req, res) => {
  const area = Number(req.query.area);
  if (!Number.isFinite(area) || area < 1 || area > 10000) {
    return res.status(400).json({ ok: false, error: "ფართობი არასწორია" });
  }
  res.json({
    ok: true,
    area,
    pricePerM2: PRICE_PER_M2,
    total: Math.round(area * PRICE_PER_M2),
  });
});

// ახალი შეკვეთა
app.post("/api/orders", (req, res) => {
  const body = req.body || {};

  // "ხაფანგი" ბოტებისთვის: ადამიანი ამ დამალულ ველს არ ავსებს
  if (body.website) return res.json({ ok: true });

  if (tooManyRequests(req.ip)) {
    return res
      .status(429)
      .json({ ok: false, error: "ძალიან ბევრი მცდელობაა, სცადეთ მოგვიანებით" });
  }

  const serviceId = clean(body.service, 30);
  const service =
    serviceId === OTHER_SERVICE.id
      ? OTHER_SERVICE
      : SERVICES.find((s) => s.id === serviceId);

  const order = {
    id: Date.now(),
    name: clean(body.name, 80),
    phone: clean(body.phone, 20),
    service: service ? service.title : "",
    address: clean(body.address, 150),
    area: Number(body.area) > 0 ? Number(body.area) : null,
    comment: clean(body.comment, 1000),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  const errors = {};
  if (order.name.length < 2) errors.name = "გთხოვთ, მიუთითოთ სახელი და გვარი";
  if (!/^\+?[0-9\s()-]{9,18}$/.test(order.phone))
    errors.phone = "გთხოვთ, მიუთითოთ სწორი ტელეფონის ნომერი";
  if (!service) errors.service = "გთხოვთ, აირჩიოთ მომსახურება";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const orders = readJSON(ORDERS_FILE);
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);

  console.log("ახალი შეკვეთა:", order.name, order.phone, "-", order.service);
  res.status(201).json({ ok: true, message: "თქვენი მოთხოვნა მიღებულია" });
});

// შეკვეთების ნახვა (მხოლოდ პაროლით). სხვა გზა: პირდაპირ გახსენი data/orders.json
app.get("/api/orders", (req, res) => {
  if (req.get("x-admin-password") !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "წვდომა აკრძალულია" });
  }
  res.json({ ok: true, orders: readJSON(ORDERS_FILE) });
});

// უცნობი API მისამართი
app.use("/api", (req, res) => {
  res.status(404).json({ ok: false, error: "ვერ მოიძებნა" });
});

// საერთო შეცდომების დამჭერი
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, error: "სერვერის შეცდომა" });
});

app.listen(PORT, () => {
  console.log(`სერვერი მუშაობს: http://localhost:${PORT}`);
});
