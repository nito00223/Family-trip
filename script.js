// =====================================
// 家族旅行しおり
// script.js
// =====================================

/* 目次
=====================================
① 定数・データ
=====================================

② 共通関数

③ カウントダウン

④ スケジュール一覧

⑤ スケジュールHTML生成 

⑥ 次の予定

⑦ 実行
*/

// =====================================
// ①定数、データ
// =====================================
//旅行日
const tripDate = new Date("2026-09-06");

//スケジュール
const schedule = [
  {
    time: "08:00",
    icon: "🚗",
    title: "自宅出発",
    place: "愛知県稲沢市",
    map: "https://maps.app.goo.gl/2rKxkCM38HiJTF3t7?g_st=ic",
  },
  {
    time: "09:30",
    icon: "🚻",
    title: "SA",
    place: "長野県",
    map: "",
  },
  {
    time: "11:30",
    icon: "🍜",
    title: "そばランチ",
    place: "長野県",
    map: "",
  },
  {
    time: "17:00",
    icon: "🏨",
    title: "ホテル到着",
    place: "蓼科市",
    map: "https://maps.app.goo.gl/AkGp89AT7Zc4cxZ26?g_st=ic",
  },
];

//持ち物リスト
let packingList = [
  {
    name: "財布",
    checked: false,
    importance: 5,
  },
  {
    name: "鍵",
    checked: false,
    importance: 5,
  },
  {
    name: "ETCカード",
    checked: false,
    importance: 5,
  },
  {
    name: "日傘",
    checked: false,
    importance: 3,
  },
  {
    name: "扇風機",
    checked: false,
    importance: 2,
  },
  {
    name: "飲み物",
    checked: false,
    importance: 4,
  },
  {
    name: "軽食",
    checked: false,
    importance: 2,
  },
  {
    name: "エコバッグ",
    checked: false,
    importance: 3,
  },
];

// =====================================
// ホテルデータ
// =====================================

const hotel = {
  name: "蓼科グランドホテル滝の湯",
  image: "hotel.jpeg",
  rating: 4.5,
  price: 13000,
  checkIn: "15:00",
  checkOut: "10:00",
  parking: "無料",
  map: "https://maps.app.goo.gl/aVvpKkNnyJMt2NP59?g_st=ic",
};

// =====================================
// 費用データ
// =====================================
const expenses = [
  {
    name: "高速代",
    price: 8500,
  },
  {
    name: "ガソリン代",
    price: 6200,
  },
  {
    name: "ホテル代",
    price: 36000,
  },
  {
    name: "昼食",
    price: 5000,
  },
];

// =====================================
// 編集中の費用番号
// =====================================
let editingExpenseIndex = -1;

// =====================================
// 天気名変換テーブル
// =====================================
const weatherMap = {
  Sunny: "晴れ",
  Clear: "快晴",
  "Partly cloudy": "晴れ時々曇り",
  Cloudy: "曇り",
  Overcast: "曇り",
  Mist: "霧",
  Fog: "霧",
  "Patchy rain nearby": "近くでにわか雨",
  "Light rain": "小雨",
  "Moderate rain": "雨",
  "Heavy rain": "大雨",
  "Patchy snow nearby": "近くで雪",
  "Light snow": "小雪",
  "Moderate snow": "雪",
  "Heavy snow": "大雪",
  "Thundery outbreaks nearby": "雷の可能性",
};

// =====================================
// Supabase の接続設定
// =====================================
const SUPABASE_URL = "https://jkcqrfxnvydadlfzhjgb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3FyZnhudnlkYWRsZnpoamdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTM5MzEsImV4cCI6MjEwMDQ2OTkzMX0.U-QHGN82izvOjWdBKIWCJ6Zc-0StyMw7yHaWILskn2o";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 観光地データ（初期値）
let spots = [];
let myVotes = [];

// 自分の投票履歴はブラウザ側に保存（誰がどのボタンを押したかの個人管理用）
function loadMyVotes() {
  const savedVotes = localStorage.getItem("myVotes");
  if (savedVotes) {
    myVotes = JSON.parse(savedVotes);
  }
}
function saveMyVotes() {
  localStorage.setItem("myVotes", JSON.stringify(myVotes));
}

// =====================================
// ②共通関数
// =====================================
// "11:30" → 690 に変換
function convertTimeToMinutes(time) {
  const [hour, minute] = time.split(":");

  return Number(hour) * 60 + Number(minute);
}

// =====================================
// ③カウントダウン表示
// =====================================
function showCountdown() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const trip = new Date(tripDate);
  trip.setHours(0, 0, 0, 0);

  const diff = trip.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const countdownElement = document.getElementById("countdown");

  if (days > 0) {
    countdownElement.textContent = `旅行まであと ${days} 日！`;
  } else if (days === 0) {
    countdownElement.textContent = `いよいよ今日出発！🚗`;
  } else {
    countdownElement.textContent = `旅行の思い出を振り返ろう✨`;
  }
}

// =====================================
// ④スケジュール一覧表示
// =====================================
function showSchedule() {
  const scheduleList = document.getElementById("schedule-list");

  scheduleList.innerHTML = "";

  for (const item of schedule) {
    scheduleList.innerHTML += createScheduleHtml(item);
  }
}

// =====================================
// ⑤スケジュールHTML生成
// =====================================
function createScheduleHtml(item) {
  return `
    <div class="schedule-item">

      <div class="schedule-header">
        <span class="schedule-icon">${item.icon}</span>
        <span class="schedule-time">${item.time}</span>
      </div>

      <div class="schedule-title">
        ${item.title}
      </div>

      <div class="schedule-place">
        📍 ${item.place}
      </div>

      <a
        class="map-button"
        href="${item.map}"
        target="_blank"
      >
        🗺 Googleマップを開く
      </a>
    </div>
  `;
}

// =====================================
// ⑥次の予定表示
// =====================================
function showNextSchedule() {
  const nextSchedule = document.getElementById("next-schedule");
  const today = new Date();

  // 日付だけ比較する
  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);
  const trip = new Date(tripDate);
  trip.setHours(0, 0, 0, 0);
  let nextItem = null;

  // =====================
  // 旅行前
  // =====================
  if (todayDate < trip) {
    nextItem = schedule[0];
  }

  // =====================
  // 旅行当日
  // =====================
  else if (todayDate.getTime() === trip.getTime()) {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    for (const item of schedule) {
      const scheduleMinutes = convertTimeToMinutes(item.time);
      if (scheduleMinutes > nowMinutes) {
        nextItem = item;
        break;
      }
    }
  }

  // =====================
  // 旅行後
  // =====================
  else {
    nextSchedule.innerHTML = "旅行は終了しました😊";
    return;
  }

  // =====================
  // 今日の予定終了
  // =====================
  if (!nextItem) {
    nextSchedule.innerHTML = "本日の予定は終了しました🎉";
    return;
  }
  nextSchedule.innerHTML = createScheduleHtml(nextItem);
}

// =====================================
// 持ち物一覧表示
// =====================================
function showPackingList() {
  const packing = document.getElementById("packing-list");
  packing.innerHTML = "";

  for (let i = 0; i < packingList.length; i++) {
    packing.innerHTML += createPackingListHtml(packingList[i], i); // i(インデックス)を渡す
  }
}

// =====================================
// 持ち物HTML生成（削除ボタン追加 ＆ 取り消し線）
// =====================================
function createPackingListHtml(item, index) {
  // チェックされていたら文字をグレーにして取り消し線を引くスタイル
  const textStyle = item.checked
    ? "text-decoration: line-through; color: gray;"
    : "";

  return `
    <div class="packing-item">
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
        <input
          type="checkbox"
          ${item.checked ? "checked" : ""}
          onchange="togglePackingItem(${index})"
        >
        <span style="${textStyle}">
          ${item.name}
        </span>
      </label>

      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="importance">
          ${"★".repeat(item.importance)}
        </span>
        <!-- 👇 削除ボタンを追加 -->
        <button onclick="deletePackingItem(${index})" style="background: none; color: #f44336; padding: 5px; font-size: 18px;">🗑</button>
      </div>
    </div>
  `;
}

// =====================================
// 持ち物を追加する
// =====================================
function addPackingItem() {
  const name = document.getElementById("packing-name").value;
  const importance = Number(
    document.getElementById("packing-importance").value
  );

  if (name === "") {
    alert("持ち物の名前を入力してください");
    return;
  }

  // リストに追加
  packingList.push({
    name: name,
    checked: false,
    importance: importance,
  });

  savePackingList();
  showPackingList();

  // 入力欄をリセット
  document.getElementById("packing-name").value = "";
  document.getElementById("packing-importance").value = "3";
}

// =====================================
// 持ち物を削除する
// =====================================
function deletePackingItem(index) {
  const result = confirm(
    `「${packingList[index].name}」をリストから削除しますか？`
  );
  if (!result) return;

  // リストから1つ削除
  packingList.splice(index, 1);
  savePackingList();
  showPackingList();
}

// =====================================
// 持ち物データ読み込み（追加・削除に対応）
// =====================================
function loadPackingList() {
  const savedPacking = localStorage.getItem("packingList");
  if (savedPacking) {
    // 保存されているデータで丸ごと上書きする
    packingList = JSON.parse(savedPacking);
  }
}

// =====================================
// 持ち物データ保存
// =====================================
function savePackingList() {
  localStorage.setItem("packingList", JSON.stringify(packingList));
}

// =====================================
// 持ち物チェック切替
// =====================================
function togglePackingItem(index) {
  packingList[index].checked = !packingList[index].checked;
  savePackingList();
}

// =====================================
// 費用データ読み込み
// =====================================
function loadExpenses() {
  const savedExpenses = localStorage.getItem("expenses");

  if (savedExpenses) {
    const data = JSON.parse(savedExpenses);
    expenses.length = 0;
    expenses.push(...data);
  }
}

// =====================================
// 費用データ保存
// =====================================
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// =====================================
// 観光地データの読み込み（Supabaseから取得）
// =====================================
async function loadSpots() {
  loadMyVotes();

  const { data, error } = await supabaseClient.from("spots").select("*");

  if (error) {
    console.error("データ取得エラー:", error);
    return;
  }

  // もしSupabaseにデータがまだ1件も入っていなかったら、初期データを登録する
  if (data && data.length === 0) {
    await supabaseClient.from("spots").insert([
      {
        name: "白樺湖",
        place: "長野県立科町",
        description: "ボート・遊覧船・遊歩道",
        recommendation: 5,
        map: "https://maps.app.goo.gl/yEXw7VpbKLQssge28?g_st=ic",
        image: "shirakabako.jpeg",
        votes: 0,
      },
      {
        name: "御射鹿池",
        place: "長野県茅野市",
        description: "東山魁夷の作品のモデルになった池",
        recommendation: 5,
        map: "https://maps.app.goo.gl/oySZK25KzSkiV2jg6?g_st=ic",
        image: "misyakaike.jpeg",
        votes: 0,
      },
    ]);
    loadSpots(); // 再読み込み
    return;
  }

  spots = data;
  showSpots();
}

// =====================================
// 観光地データ保存
// =====================================
function saveSpots() {
  localStorage.setItem("spots", JSON.stringify(spots));
  localStorage.setItem("myVotes", JSON.stringify(myVotes)); // 投票履歴も保存
}

// =====================================
// 画像を小さく圧縮する関数（容量オーバー対策）
// =====================================
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400; // 横幅を最大400pxに縮小
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // JPEG形式で画質を少し落として軽くする
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// =====================================
// 観光地を追加する（Supabaseに保存）
// =====================================
async function addSpot() {
  const name = document.getElementById("spot-name").value;
  const desc = document.getElementById("spot-desc").value;
  const mapUrl = document.getElementById("spot-map").value;
  const recommendation = Number(
    document.getElementById("spot-recommendation").value
  );
  const fileInput = document.getElementById("spot-image");

  if (name === "") {
    alert("場所の名前を入力してください");
    return;
  }

  // 既に同じ名前がないかチェック
  if (spots.some((spot) => spot.name === name)) {
    alert("その場所はすでに追加されています");
    return;
  }

  // 👇 画像が選ばれていたら圧縮処理を待つ
  let imageData = "";
  if (fileInput.files.length > 0) {
    imageData = await compressImage(fileInput.files[0]);
  }

  const newSpot = {
    name: name,
    place: "追加された候補",
    description: desc,
    recommendation: recommendation,
    map: mapUrl,
    image: imageData, //圧縮した画像データ
    votes: 1,
  };

  // Supabaseにデータを追加
  const { error } = await supabaseClient.from("spots").insert([newSpot]);

  if (error) {
    alert("追加に失敗しました");
    console.error(error);
    return;
  }

  myVotes.push(name);
  saveMyVotes();

  // 入力欄リセット
  document.getElementById("spot-name").value = "";
  document.getElementById("spot-desc").value = "";
  document.getElementById("spot-map").value = "";
  fileInput.value = "";

  loadSpots(); // 最新データを再取得して画面更新
}

// =====================================
// 投票する / 取り消す（Supabaseの数字を更新）
// =====================================
async function toggleVote(index) {
  const spot = spots[index];
  const voteIndex = myVotes.indexOf(spot.name);

  let newVotes = spot.votes || 0;

  if (voteIndex >= 0) {
    // 投票済み -> 取り消し（-1）
    newVotes -= 1;
    myVotes.splice(voteIndex, 1);
  } else {
    // 未投票 -> 投票（+1）
    newVotes += 1;
    myVotes.push(spot.name);
  }

  // Supabase側のデータを更新
  const { error } = await supabaseClient
    .from("spots")
    .update({ votes: newVotes })
    .eq("id", spot.id); // Supabaseが自動で振ってくれるidで特定する

  if (error) {
    console.error("投票エラー:", error);
    return;
  }

  saveMyVotes();
  loadSpots(); // 最新データを再取得
}

// =====================================
// ★ リアルタイムリスナー（誰かが変更したら自動で画面を更新する魔法の機能）
// =====================================
supabaseClient
  .channel("public:spots")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "spots" },
    (payload) => {
      // 誰かが追加したり投票したりしたら、自動的に最新データを読み込み直す！
      loadSpots();
    }
  )
  .subscribe();

// =====================================
// 観光地一覧表示
// =====================================
function showSpots() {
  const spotList = document.getElementById("spot-list");
  spotList.innerHTML = "";

  // 投票数(votes)が多い順に並び替え
  const sortedSpots = [...spots].sort(
    (a, b) => (b.votes || 0) - (a.votes || 0)
  );

  for (const item of sortedSpots) {
    // 元の配列でのインデックスを探す（投票処理のため）
    const originalIndex = spots.indexOf(item);
    spotList.innerHTML += createSpotHtml(item, originalIndex);
  }
}

// =====================================
// 観光地HTML生成
// =====================================
function createSpotHtml(item, index) {
  const imgHtml = item.image
    ? `<img class="spot-image" src="${item.image}" alt="${item.name}">`
    : "";
  const mapHtml = item.map
    ? `<a class="map-button" href="${item.map}" target="_blank">🗺 マップ</a>`
    : "";

  const starsHtml =
    item.recommendation > 0
      ? `<div class="spot-star" style="color: orange; margin-top: 8px;">オススメ度: ${"★".repeat(
          item.recommendation
        )}</div>`
      : "";

  const isVoted = myVotes.includes(item.name);
  const btnColor = isVoted ? "#e91e63" : "#03a9f4";
  const btnText = isVoted
    ? `💖 投票済み (${item.votes || 0})`
    : `🤍 いいね (${item.votes || 0})`;

  return `
    <div class="spot-item">
      ${imgHtml}
      <div class="spot-name">📍 ${item.name}</div>
      <div class="spot-place">${item.place}</div>
      ${starsHtml}
      <div class="spot-description" style="margin-top: 8px;">${item.description}</div>
      <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
        ${mapHtml}
        <button onclick="toggleVote(${index})" style="padding: 10px 16px; background: ${btnColor}; color: white; border-radius: 20px;">
          ${btnText}
        </button>
      </div>
    </div>
  `;
}

// =====================================
// ホテル表示
// =====================================
function showHotel() {
  const hotelArea = document.getElementById("hotel");
  hotelArea.innerHTML = createHotelHtml(hotel);
}

// =====================================
// ホテルHTML生成
// =====================================
function createHotelHtml(item) {
  return `

  <div class="hotel-item">
    <img
      class="hotel-image"
      src="${item.image}"
      alt="${item.name}"
    >

    <div class="hotel-name">
      🏨 ${item.name}
    </div>
    <div>⭐ ${item.rating}</div>
    <div>💰 ¥${item.price.toLocaleString()} / 人</div>
    <div>🕒 Check In ${item.checkIn}</div>
    <div>🕚 Check Out ${item.checkOut}</div>
    <div>🅿️ ${item.parking}</div>
    <a
      class="map-button"
      href="${item.map}"
      target="_blank"
    >
      🗺 Googleマップ
    </a>
  </div>
  `;
}

// =====================================
// 費用一覧表示
// =====================================
function showExpenses() {
  const expenseList = document.getElementById("expense-list");

  expenseList.innerHTML = "";

  let total = 0;

  for (const item of expenses) {
    expenseList.innerHTML += createExpenseHtml(item);
    total += item.price;
  }

  document.getElementById("total-expense").innerHTML = `
    <strong>
      合計：¥${total.toLocaleString()}
    </strong>
  `;
}

// =====================================
// 費用HTML生成
// =====================================
function createExpenseHtml(item) {
  return `
    <div class="expense-item">

      <span>
        ${item.name}
      </span>

      <div>

        <span>
          ¥${item.price.toLocaleString()}
        </span>

        <button
          onclick="editExpense(${expenses.indexOf(item)})"
        >
          ✏️
        </button>

        <button
          onclick="deleteExpense(${expenses.indexOf(item)})"
        >
          🗑
        </button>

      </div>

    </div>
  `;
}
// =====================================
// 費用追加
// =====================================
function addExpense() {
  const name = document.getElementById("expense-name").value;

  const price = Number(document.getElementById("expense-price").value);

  // 入力チェック
  if (name === "" || price <= 0) {
    alert("項目名と金額を入力してください");
    return;
  }

  // 新しい費用データを作成
  const newExpense = {
    name: name,
    price: price,
  };

  // 編集中なら更新
  if (editingExpenseIndex >= 0) {
    expenses[editingExpenseIndex] = newExpense;
    editingExpenseIndex = -1;
    document.getElementById("expense-button").textContent = "＋追加";
  } else {
    // 新規追加
    expenses.push(newExpense);
  }

  // 保存
  saveExpenses();

  // 再表示
  showExpenses();

  // 入力欄クリア
  document.getElementById("expense-name").value = "";
  document.getElementById("expense-price").value = "";

  // 項目名へカーソル
  document.getElementById("expense-name").focus();
}

// =====================================
// 費用削除
// =====================================
function deleteExpense(index) {
  const result = confirm(`「${expenses[index].name}」を削除しますか？`);

  if (!result) {
    return;
  }

  expenses.splice(index, 1);
  saveExpenses();
  showExpenses();
}

// =====================================
// 費用編集
// =====================================
function editExpense(index) {
  editingExpenseIndex = index;

  document.getElementById("expense-name").value = expenses[index].name;
  document.getElementById("expense-price").value = expenses[index].price;
  document.getElementById("expense-name").focus();
  document.getElementById("expense-button").textContent = "✏️更新";
}

// =====================================
// 天気表示
// =====================================
async function showWeather() {
  try {
    // APIから取得
    const response = await fetch("https://wttr.in/Nagano?format=j1");

    // HTTPエラー
    if (!response.ok) {
      throw new Error("天気情報を取得できませんでした");
    }

    const data = await response.json();
    // APIから取得した英語
    const weatherEn = data.current_condition[0].weatherDesc[0].value;
    // 日本語へ変換
    const weather = weatherMap[weatherEn] ?? weatherEn;
    const temperature = data.current_condition[0].temp_C;
    const humidity = data.current_condition[0].humidity;
    document.getElementById("weather").innerHTML = createWeatherHtml(
      weather,
      temperature,
      humidity
    );
  } catch (error) {
    console.error(error);

    document.getElementById("weather").innerHTML = `
      <div class="weather-item">
        天気情報を取得できませんでした😢
      </div>
    `;
  }
}

// =====================================
// 天気HTML生成
// =====================================
function createWeatherHtml(weather, temperature, humidity) {
  return `
    <div class="weather-item">

      <div class="weather-title">
        🌤 現在の天気
      </div>

      <div class="weather-info">
        ☀️ ${weather}
      </div>

      <div class="weather-info">
        🌡 ${temperature}℃
      </div>

      <div class="weather-info">
        💧 ${humidity}%
      </div>

    </div>
  `;
}

// =====================================
// ⑦関数の実行
// =====================================
loadPackingList();
loadExpenses();
loadSpots();

showCountdown();
showSchedule();
showNextSchedule();
showPackingList();
//showSpots();
showHotel();
showExpenses();
showWeather();
