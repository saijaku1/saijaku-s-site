const notices = [
  {
    title: "二代目mysiteが遂に完成！",
    date: "2025-06-21",
    category: "更新情報",
    content:
      "二代目mysiteが遂に完成しました！開発期間<b>半年</b>...めっちゃつらかった...でも、これでやっと新しいスタートが切れます！",
    },
    {
        title: "初代と二代目の違い",
        date: "2025-06-23",
        category: "変更点",
        content: "初代mysiteと二代目mysiteの違い(変更点)について紹介します。<br>二代目と初代で以下のように名前が変更されました<br><b>最弱が作ったサイト</b>→<b>じゃくのツール箱</b><br><b>じゃくのアニメサイト</b>→<b>茶番</b><br> また、デザインも一新され、よりモダンで使いやすくなりました。<br>今後ともmysiteをよろしくお願いします！",
    }
];

function formatDate(dateString) {
  const [year, month, day] = dateString
    .split("-")
    .map((num) => String(num).padStart(2, "0"));
  return `${year}-${month}-${day}`;
}

function displayNotices(filterDate = "", filterCategory = "") {
  const noticeList = document.getElementById("noticeList");
  noticeList.innerHTML = "";

  const filteredNotices = notices
    .filter((notice) => {
      const formattedDate = formatDate(notice.date);
      return (
        (!filterDate || formattedDate === filterDate) &&
        (!filterCategory || notice.category === filterCategory)
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filteredNotices.length === 0) {
    const noNotices = document.createElement("div");
    noNotices.textContent = "記事がありません。";
    noticeList.appendChild(noNotices);
  }

  filteredNotices.forEach((notice) => {
    const card = document.createElement("div");
    card.classList.add("notice-card");

    card.innerHTML = `
          <h2>${notice.title}</h2>
          <p class="date">${formatDate(notice.date)}</p>
          <p>${notice.content}</p>
        `;

    noticeList.appendChild(card);
  });
}

document.getElementById("dateFilter").addEventListener("change", (e) => {
  displayNotices(
    e.target.value,
    document.getElementById("categoryFilter").value
  );
});
displayNotices();

document.getElementById("categoryFilter").addEventListener("change", (e) => {
  displayNotices(document.getElementById("dateFilter").value, e.target.value);
});

document.getElementById("toggleDarkMode").addEventListener("click", () => {
  const isDarkMode = document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode");

  if (isDarkMode) {
    document.getElementById("toggleDarkMode").textContent =
      "ダークモードに切り替え";
  } else {
    document.getElementById("toggleDarkMode").textContent =
      "ライトモードに切り替え";
  }
});

function back() {
  window.history.back();
  // window.history.go(-1); // これでも戻れます
  // window.history.go(-2); // 2つ前に戻ります
  // window.history.go(1); // 進む
  // window.history.go(2); // 2つ進みます
  // window.history.go(0); // リロード
}
