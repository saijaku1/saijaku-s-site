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
        content: "初代mysiteと二代目mysiteの違い(変更点)について紹介します。<br>二代目と初代で以下のように名前が変更されました<br><b>最弱が作ったサイト</b>→<b>じゃくのツール箱</b><br><b>じゃくのアニメサイト</b>→<b>茶番</b><br> また、デザインも一新され、よりモダンで使いやすくなりました。！<br>今後ともmysiteをよろしくお願いします！",
    },
    {
        title: "茶番サイト開設！",
        date: "2025-7-5",
        category: "更新情報",
        content: "すみません！更新遅くなって！！やっと完成しました！スタイル決めるために1週間ぐらいかかりました！結論から言うと、初代とあんま変わらないです。暇つぶしに僕とココツたちの茶番をぜひ見てください！ 今後ともmysiteをよろしくお願いします",
    },
    {
    title: "現在進行形でAnkey活動中！！",
    date: "2025-7-29",
    category: "その他",
    content:
      "自分めっちゃAnkeyやってるので、もし興味があればぜひ見てください！<br>Ankeyは、タイピングを鍛えまくるサイトで、僕は毎日使っています。<br>僕のプロフィールは<a href='https://ankey.io/@jaku'>こちら</a>から確認できます。",
  },
    {
    title: "無事、部活を引退しました",
    date: "2025-9-2",
    category: "その他",
    content:
      "8月31日をもってこの度、Jakuはようやく陸上部(幅跳び)を引退しました。記録は6m11cm...(ようやくと言ったらなんか喜んでいるようにも見えるな。まあ実際はうれしいんだけど。)つまりここからは受験勉強です。正直言って、学校いきたくない....ずっとサイト開発していたい...でも9月の中盤には中間テストが....っていうことで9月18日までは少しこのサイトの開発をお休みします(は？)でも、9月18日を過ぎたらいっぱい開発できるので少しの間なのですがお待ちください...zzz",
  },
      {
    title: "Ankeyを引退しました",
    date: "2025-10-7",
    category: "その他",
    content:
      "この度をもってわたくし、じゃくはAnkeyを引退することになりました。理由は単純です。Ankeyはタイピングサイトなのですがタイピングの練習がまともにできないし、関係ないものばかり投稿ばかり見るのでもううんざりしました。まぁもうあんなサイトは行きません。",
  },
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
}
