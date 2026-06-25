const STORAGE = {
  reviews: "tvlog_reviews_ver1",
  liked: "tvlog_liked_ver1",
  customPrograms: "tvlog_custom_programs_ver1"
};

const weeklyTemplates = [
  { dow: 0, time: "07:30", title: "シューイチ", station: "日本テレビ系", genre: "情報" },
  { dow: 0, time: "19:00", title: "ザ！鉄腕！DASH!!", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 0, time: "19:58", title: "世界の果てまでイッテQ！", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 0, time: "21:00", title: "日曜劇場", station: "TBS系", genre: "ドラマ" },
  { dow: 0, time: "22:00", title: "Mr.サンデー", station: "フジテレビ系", genre: "報道・情報" },
  { dow: 0, time: "23:00", title: "情熱大陸", station: "MBS/TBS系", genre: "ドキュメンタリー" },

  { dow: 1, time: "19:00", title: "有吉ゼミ", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 1, time: "20:00", title: "世界まる見え！テレビ特捜部", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 1, time: "21:00", title: "しゃべくり007", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 1, time: "21:54", title: "報道ステーション", station: "テレビ朝日系", genre: "報道" },
  { dow: 1, time: "23:00", title: "news zero", station: "日本テレビ系", genre: "報道" },

  { dow: 2, time: "20:55", title: "マツコの知らない世界", station: "TBS系", genre: "バラエティ" },
  { dow: 2, time: "21:00", title: "ザ！世界仰天ニュース", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 2, time: "21:54", title: "報道ステーション", station: "テレビ朝日系", genre: "報道" },
  { dow: 2, time: "23:00", title: "news zero", station: "日本テレビ系", genre: "報道" },

  { dow: 3, time: "19:00", title: "世界くらべてみたら", station: "TBS系", genre: "バラエティ" },
  { dow: 3, time: "20:00", title: "有吉の壁", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 3, time: "21:00", title: "上田と女が吠える夜", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 3, time: "22:00", title: "水曜日のダウンタウン", station: "TBS系", genre: "バラエティ" },
  { dow: 3, time: "21:54", title: "報道ステーション", station: "テレビ朝日系", genre: "報道" },
  { dow: 3, time: "23:00", title: "news zero", station: "日本テレビ系", genre: "報道" },

  { dow: 4, time: "19:00", title: "プレバト!!", station: "MBS/TBS系", genre: "バラエティ" },
  { dow: 4, time: "19:00", title: "突破ファイル", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 4, time: "22:00", title: "櫻井・有吉THE夜会", station: "TBS系", genre: "バラエティ" },
  { dow: 4, time: "21:54", title: "報道ステーション", station: "テレビ朝日系", genre: "報道" },
  { dow: 4, time: "23:00", title: "news zero", station: "日本テレビ系", genre: "報道" },

  { dow: 5, time: "20:00", title: "それSnow Manにやらせて下さい", station: "TBS系", genre: "バラエティ" },
  { dow: 5, time: "20:00", title: "沸騰ワード10", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 5, time: "23:00", title: "A-Studio+", station: "TBS系", genre: "トーク" },
  { dow: 5, time: "21:54", title: "報道ステーション", station: "テレビ朝日系", genre: "報道" },
  { dow: 5, time: "23:30", title: "news zero", station: "日本テレビ系", genre: "報道" },

  { dow: 6, time: "19:00", title: "嗚呼!!みんなの動物園", station: "日本テレビ系", genre: "バラエティ" },
  { dow: 6, time: "21:00", title: "出没！アド街ック天国", station: "テレビ東京系", genre: "情報・街" },
  { dow: 6, time: "22:00", title: "情報7daysニュースキャスター", station: "TBS系", genre: "報道・情報" }
];

let state = {
  view: "schedule",
  scheduleMode: "now",
  programs: [],
  reviews: [],
  liked: [],
  selectedProgramId: null,
  selectedEpisodeId: null
};

function init() {
  state.programs = buildPrograms().concat(loadCustomPrograms());
  state.reviews = readJson(STORAGE.reviews, []);
  state.liked = readJson(STORAGE.liked, []);

  bindEvents();
  renderAll();
}

function bindEvents() {
  document.querySelectorAll(".tab, .bottom-tab").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.querySelectorAll(".subtab").forEach(button => {
    button.addEventListener("click", () => {
      state.scheduleMode = button.dataset.schedule;
      document.querySelectorAll(".subtab").forEach(b => b.classList.toggle("active", b.dataset.schedule === state.scheduleMode));
      renderSchedule();
    });
  });

  document.getElementById("programSearch").addEventListener("input", renderSuggestions);
  document.getElementById("episodeSelect").addEventListener("change", event => {
    state.selectedEpisodeId = event.target.value;
    renderSelectedBox();
  });
  document.getElementById("submitReview").addEventListener("click", addReview);
  document.getElementById("reviewFilter").addEventListener("input", renderReviews);
  document.getElementById("addProgram").addEventListener("click", addProgram);
  document.getElementById("resetButton").addEventListener("click", resetAll);
}

function switchView(view) {
  state.view = view;

  document.querySelectorAll(".view").forEach(el => el.classList.add("hidden"));
  document.getElementById(`view-${view}`).classList.remove("hidden");

  document.querySelectorAll(".tab, .bottom-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}

function buildPrograms() {
  const today = dateOnly(new Date());
  const map = new Map();

  for (let offset = -7; offset <= 7; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);

    weeklyTemplates
      .filter(template => template.dow === d.getDay())
      .forEach(template => {
        const programId = `p_${slug(template.title)}`;
        if (!map.has(programId)) {
          map.set(programId, {
            id: programId,
            title: template.title,
            station: template.station,
            genre: template.genre,
            episodes: []
          });
        }

        const date = formatDate(d);
        map.get(programId).episodes.push({
          id: `e_${slug(template.title)}_${date}`,
          date,
          time: template.time,
          title: `${labelDate(date)}放送回`
        });
      });
  }

  return Array.from(map.values()).map(program => {
    program.episodes.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    return program;
  });
}

function loadCustomPrograms() {
  return readJson(STORAGE.customPrograms, []);
}

function saveCustomPrograms(customPrograms) {
  localStorage.setItem(STORAGE.customPrograms, JSON.stringify(customPrograms));
}

function renderAll() {
  renderSchedule();
  renderCandidates();
  renderReviews();
  renderRankings();
  renderMaster();
  populateEpisodeSelect();
  renderSelectedBox();
}

function renderSchedule() {
  const target = document.getElementById("scheduleList");
  let episodes = allEpisodes();

  const today = formatDate(new Date());

  if (state.scheduleMode === "now") {
    episodes = episodes.filter(({ episode }) => isOnAirNow(episode));
  }

  if (state.scheduleMode === "today") {
    episodes = episodes.filter(({ episode }) => episode.date === today);
  }

  if (state.scheduleMode === "week") {
    const start = dateOnly(new Date());
    const end = dateOnly(new Date());
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    episodes = episodes.filter(({ episode }) => {
      const d = new Date(`${episode.date}T00:00:00`);
      return d >= start && d <= end;
    });
  }

  if (!episodes.length) {
    target.innerHTML = `<div class="empty">該当する番組がありません。<br>「今日」または「前後1週間」を見てください。</div>`;
    return;
  }

  let currentDate = "";

  target.innerHTML = episodes.map(({ program, episode }) => {
    const episodeReviews = getEpisodeReviews(program.id, episode.id);
    const programReviews = state.reviews.filter(review => review.programId === program.id);
    const dateHead = state.scheduleMode === "week" && currentDate !== episode.date
      ? `<div class="date-head">${labelDate(episode.date)}</div>`
      : "";

    currentDate = episode.date;

    return `${dateHead}
      <div class="program-card" data-program-id="${program.id}" data-episode-id="${episode.id}">
        <div class="program-head">
          <div>
            <div class="program-title">${escapeHtml(episode.time)}　${escapeHtml(program.title)}</div>
            <div class="meta">${escapeHtml(program.station)} ／ ${escapeHtml(program.genre)} ／ ${escapeHtml(episode.title)}</div>
          </div>
          <span class="badge blue">投稿</span>
        </div>
        <div class="stats">
          <span class="badge gold">放送回平均 ${formatAverage(average(episodeReviews))}</span>
          <span class="badge">口コミ ${episodeReviews.length}</span>
          <span class="badge green">番組平均 ${formatAverage(average(programReviews))}</span>
        </div>
      </div>`;
  }).join("");

  target.querySelectorAll(".program-card").forEach(card => {
    card.addEventListener("click", () => selectProgram(card.dataset.programId, card.dataset.episodeId));
  });
}

function renderCandidates() {
  const target = document.getElementById("programCandidates");
  target.innerHTML = state.programs.slice(0, 12).map(program => {
    const programReviews = state.reviews.filter(review => review.programId === program.id);
    return `
      <div class="program-card" data-program-id="${program.id}">
        <div class="program-title">${escapeHtml(program.title)}</div>
        <div class="meta">${escapeHtml(program.station)} ／ ${escapeHtml(program.genre)}</div>
        <div class="stats">
          <span class="badge gold">平均 ${formatAverage(average(programReviews))}</span>
          <span class="badge">口コミ ${programReviews.length}</span>
        </div>
      </div>`;
  }).join("");

  target.querySelectorAll(".program-card").forEach(card => {
    card.addEventListener("click", () => selectProgram(card.dataset.programId));
  });
}

function renderSuggestions() {
  const query = document.getElementById("programSearch").value.trim().toLowerCase();
  const target = document.getElementById("suggestions");

  if (!query) {
    target.style.display = "none";
    return;
  }

  const matches = state.programs
    .filter(program =>
      program.title.toLowerCase().includes(query) ||
      program.station.toLowerCase().includes(query) ||
      program.genre.toLowerCase().includes(query)
    )
    .slice(0, 10);

  target.innerHTML = matches.length
    ? matches.map(program => `
      <div class="suggestion" data-program-id="${program.id}">
        <strong>${escapeHtml(program.title)}</strong><br>
        <span class="meta">${escapeHtml(program.station)} ／ ${escapeHtml(program.genre)}</span>
      </div>`).join("")
    : `<div class="suggestion">候補なし。「番組追加」から追加してください。</div>`;

  target.style.display = "block";

  target.querySelectorAll(".suggestion[data-program-id]").forEach(item => {
    item.addEventListener("click", () => {
      selectProgram(item.dataset.programId);
      target.style.display = "none";
    });
  });
}

function selectProgram(programId, episodeId = null) {
  const program = findProgram(programId);
  if (!program) return;

  state.selectedProgramId = programId;
  state.selectedEpisodeId = episodeId || nearestEpisode(program)?.id || program.episodes[0]?.id;

  document.getElementById("programSearch").value = program.title;
  switchView("post");
  populateEpisodeSelect();
  renderSelectedBox();
}

function populateEpisodeSelect() {
  const select = document.getElementById("episodeSelect");
  const program = findProgram(state.selectedProgramId);

  select.innerHTML = "";

  if (!program) {
    select.innerHTML = `<option value="">先に番組を選択</option>`;
    return;
  }

  program.episodes.forEach(episode => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.date} ${episode.time}　${episode.title}`;
    select.appendChild(option);
  });

  select.value = state.selectedEpisodeId || nearestEpisode(program)?.id || "";
}

function renderSelectedBox() {
  const box = document.getElementById("selectedBox");
  const program = findProgram(state.selectedProgramId);
  const episode = findEpisode(program, state.selectedEpisodeId);

  if (!program || !episode) {
    box.style.display = "none";
    return;
  }

  box.style.display = "block";
  box.innerHTML = `選択中：${escapeHtml(program.title)} ／ ${escapeHtml(episode.date)} ${escapeHtml(episode.time)} ${escapeHtml(episode.title)} <span class="meta">（${escapeHtml(program.station)}）</span>`;
}

function addReview() {
  const program = findProgram(state.selectedProgramId);
  const episode = findEpisode(program, state.selectedEpisodeId);
  const comment = document.getElementById("comment").value.trim();

  if (!program || !episode) {
    alert("番組候補から番組を選択してください。自由入力では投稿できません。");
    return;
  }

  if (!comment) {
    alert("感想を入力してください。");
    return;
  }

  state.reviews.unshift({
    id: `r_${Date.now()}`,
    programId: program.id,
    episodeId: episode.id,
    rating: Number(document.getElementById("rating").value),
    spoiler: document.getElementById("spoiler").value === "true",
    tag: document.getElementById("tag").value,
    comment,
    likes: 0,
    createdAt: new Date().toLocaleString("ja-JP")
  });

  document.getElementById("comment").value = "";
  saveReviews();
  switchView("reviews");
}

function renderReviews() {
  const target = document.getElementById("reviewsList");
  const query = document.getElementById("reviewFilter").value.trim().toLowerCase();

  const filtered = state.reviews.filter(review => {
    const program = findProgram(review.programId);
    return !query ||
      program?.title.toLowerCase().includes(query) ||
      program?.station.toLowerCase().includes(query) ||
      review.tag.toLowerCase().includes(query);
  });

  target.innerHTML = filtered.length
    ? filtered.map(reviewHtml).join("")
    : `<div class="empty">まだ口コミがありません。<br>番組を選んで最初の口コミを書いてください。</div>`;

  target.querySelectorAll(".like-button").forEach(button => {
    button.addEventListener("click", () => toggleLike(button.dataset.reviewId));
  });

  target.querySelectorAll(".spoiler-hidden").forEach(comment => {
    comment.addEventListener("click", () => comment.classList.remove("spoiler-hidden"));
  });
}

function reviewHtml(review) {
  const program = findProgram(review.programId);
  const episode = findEpisode(program, review.episodeId);
  const liked = state.liked.includes(review.id);

  return `
    <article class="review">
      <div class="review-title">
        <div>
          <strong>${escapeHtml(program?.title || "不明な番組")}</strong>
          <div class="meta">${escapeHtml(program?.station || "")} ／ ${escapeHtml(episode?.date || "")} ${escapeHtml(episode?.time || "")} ${escapeHtml(episode?.title || "")}</div>
        </div>
        <span class="stars">${stars(review.rating)}</span>
      </div>
      <div class="stats">
        <span class="badge gold">⭐ ${review.rating}.0</span>
        <span class="badge blue">#${escapeHtml(review.tag)}</span>
        ${review.spoiler ? `<span class="badge red">ネタバレあり</span>` : `<span class="badge green">ネタバレなし</span>`}
      </div>
      <p class="comment ${review.spoiler ? "spoiler-hidden" : ""}">${escapeHtml(review.comment)}</p>
      <button class="like-button ${liked ? "liked" : ""}" data-review-id="${review.id}">❤️ ${review.likes || 0}</button>
      <span class="meta">${escapeHtml(review.createdAt)}</span>
    </article>
  `;
}

function toggleLike(reviewId) {
  const review = state.reviews.find(item => item.id === reviewId);
  if (!review) return;

  if (state.liked.includes(reviewId)) {
    state.liked = state.liked.filter(id => id !== reviewId);
    review.likes = Math.max(0, (review.likes || 0) - 1);
  } else {
    state.liked.push(reviewId);
    review.likes = (review.likes || 0) + 1;
  }

  saveReviews();
  renderAll();
}

function renderRankings() {
  const episodeRanking = getEpisodeRanking();

  document.getElementById("bestRanking").innerHTML = rankingHtml(
    episodeRanking.slice(0, 10),
    item => `<strong>${escapeHtml(item.program.title)}</strong><div class="meta">${escapeHtml(item.episode.date)} ${escapeHtml(item.episode.time)} ／ 平均 ${formatAverage(item.average)} ／ ${item.count}件</div>`
  );

  document.getElementById("tonightRanking").innerHTML = rankingHtml(
    episodeRanking.slice(0, 5),
    item => `<strong>${escapeHtml(item.program.title)}</strong><div class="meta">${escapeHtml(item.episode.date)} ${escapeHtml(item.episode.time)} ／ 平均 ${formatAverage(item.average)} ／ ${item.count}件</div>`
  );

  const countRanking = [...episodeRanking].sort((a, b) => b.count - a.count || b.average - a.average);

  document.getElementById("countRankingSide").innerHTML = rankingHtml(
    countRanking.slice(0, 5),
    item => `<strong>${escapeHtml(item.program.title)}</strong><div class="meta">${escapeHtml(item.episode.date)} ${escapeHtml(item.episode.time)} ／ 口コミ ${item.count}件</div>`
  );

  document.getElementById("countRankingFull").innerHTML = rankingHtml(
    countRanking.slice(0, 10),
    item => `<strong>${escapeHtml(item.program.title)}</strong><div class="meta">${escapeHtml(item.episode.date)} ${escapeHtml(item.episode.time)} ／ 口コミ ${item.count}件</div>`
  );

  const rising = [...episodeRanking].sort((a, b) => (b.average * b.count) - (a.average * a.count));

  document.getElementById("risingRanking").innerHTML = rankingHtml(
    rising.slice(0, 10),
    item => `<strong>${escapeHtml(item.program.title)}</strong><div class="meta">勢い ${(item.average * item.count).toFixed(1)} ／ 平均 ${formatAverage(item.average)} ／ ${item.count}件</div>`
  );

  const likeRanking = [...state.reviews].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10);

  document.getElementById("likeRanking").innerHTML = likeRanking.length
    ? likeRanking.map((review, index) => {
      const program = findProgram(review.programId);
      const episode = findEpisode(program, review.episodeId);
      return `
        <div class="ranking-item">
          <div class="rank">${index + 1}</div>
          <div>
            <strong>${escapeHtml(program?.title || "")}</strong>
            <div class="meta">❤️ ${review.likes || 0} ／ ${escapeHtml(episode?.date || "")} ${escapeHtml(episode?.time || "")} ／ ${stars(review.rating)}</div>
            <div class="meta">${escapeHtml(review.comment).slice(0, 70)}${review.comment.length > 70 ? "…" : ""}</div>
          </div>
        </div>`;
    }).join("")
    : emptyRanking();
}

function getEpisodeRanking() {
  const result = [];

  state.programs.forEach(program => {
    program.episodes.forEach(episode => {
      const reviews = getEpisodeReviews(program.id, episode.id);
      if (reviews.length) {
        result.push({
          program,
          episode,
          count: reviews.length,
          average: average(reviews)
        });
      }
    });
  });

  return result.sort((a, b) => b.average - a.average || b.count - a.count);
}

function rankingHtml(items, body) {
  return items.length
    ? items.map((item, index) => `
      <div class="ranking-item">
        <div class="rank">${index + 1}</div>
        <div>${body(item)}</div>
      </div>`).join("")
    : emptyRanking();
}

function emptyRanking() {
  return `<div class="empty">まだランキングはありません。</div>`;
}

function addProgram() {
  const title = document.getElementById("newTitle").value.trim();
  const station = document.getElementById("newStation").value.trim();
  const genre = document.getElementById("newGenre").value.trim() || "未分類";
  const time = document.getElementById("newTime").value.trim() || "20:00";
  const episodeTitle = document.getElementById("newEpisodeTitle").value.trim() || "最新放送回";

  if (!title || !station) {
    alert("番組名と系列・局を入力してください。");
    return;
  }

  const customPrograms = loadCustomPrograms();
  const id = `custom_${Date.now()}`;
  const today = formatDate(new Date());

  customPrograms.push({
    id,
    title,
    station,
    genre,
    episodes: [{
      id: `episode_${Date.now()}`,
      date: today,
      time,
      title: episodeTitle
    }]
  });

  saveCustomPrograms(customPrograms);
  state.programs = buildPrograms().concat(loadCustomPrograms());

  ["newTitle", "newStation", "newGenre", "newTime", "newEpisodeTitle"].forEach(id => {
    document.getElementById(id).value = "";
  });

  renderAll();
  alert("番組候補に追加しました。");
}

function renderMaster() {
  document.getElementById("masterList").innerHTML = state.programs.map(program => `
    <div class="program-card">
      <div class="program-title">${escapeHtml(program.title)}</div>
      <div class="meta">${escapeHtml(program.station)} ／ ${escapeHtml(program.genre)}</div>
      <div class="meta">放送回：${program.episodes.map(ep => `${escapeHtml(ep.date)} ${escapeHtml(ep.time)}`).join("、")}</div>
    </div>
  `).join("");
}

function resetAll() {
  if (!confirm("投稿・追加番組・いいねを初期化しますか？")) return;

  localStorage.removeItem(STORAGE.reviews);
  localStorage.removeItem(STORAGE.liked);
  localStorage.removeItem(STORAGE.customPrograms);

  state.reviews = [];
  state.liked = [];
  state.programs = buildPrograms();
  state.selectedProgramId = null;
  state.selectedEpisodeId = null;

  renderAll();
}

function allEpisodes() {
  return state.programs
    .flatMap(program => program.episodes.map(episode => ({ program, episode })))
    .sort((a, b) => `${a.episode.date}${a.episode.time}`.localeCompare(`${b.episode.date}${b.episode.time}`));
}

function getEpisodeReviews(programId, episodeId) {
  return state.reviews.filter(review => review.programId === programId && review.episodeId === episodeId);
}

function findProgram(id) {
  return state.programs.find(program => program.id === id);
}

function findEpisode(program, episodeId) {
  return program?.episodes.find(episode => episode.id === episodeId);
}

function nearestEpisode(program) {
  const today = formatDate(new Date());
  return program.episodes.find(episode => episode.date >= today) || program.episodes[program.episodes.length - 1];
}

function isOnAirNow(episode) {
  const now = new Date();
  const start = new Date(`${episode.date}T${episode.time}:00`);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 60);
  return now >= start && now <= end;
}

function average(reviews) {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length;
}

function formatAverage(value) {
  return value ? value.toFixed(1) : "-";
}

function stars(value) {
  const n = Number(value || 0);
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

function saveReviews() {
  localStorage.setItem(STORAGE.reviews, JSON.stringify(state.reviews));
  localStorage.setItem(STORAGE.liked, JSON.stringify(state.liked));
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function dateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function labelDate(dateString) {
  const d = new Date(`${dateString}T00:00:00`);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

function slug(text) {
  return encodeURIComponent(text).replaceAll("%", "").slice(0, 30);
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

init();
