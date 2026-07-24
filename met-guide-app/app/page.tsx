"use client";

import { useEffect, useState } from "react";

type Work = {
  title: string;
  room: string;
  tag: string;
  image?: string;
  story: string;
  why: string;
  look: string;
  url: string;
};

type ArchiveWork = {
  title: string;
  artist: string;
  room: string;
  image?: string;
  note: string;
  url: string;
};

const odysseyWorks: Work[] = [
  {
    title: "Menelaos reclaiming Helen",
    room: "Gallery 155",
    tag: "헬레네",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/254876/main-image",
    story: "트로이 전쟁이 끝난 뒤 메넬라오스가 헬레네를 다시 데려오는 장면입니다. 오디세우스가 참전했던 전쟁의 끝을 보여줍니다.",
    why: "트로이 전쟁의 원인이 된 헬레네를 통해 이야기의 시작과 종착을 한 번에 연결할 수 있습니다.",
    look: "메넬라오스의 자세와 헬레네의 몸짓에서 분노와 용서가 함께 느껴지는지 보세요.",
    url: "https://www.metmuseum.org/art/collection/search/254876",
  },
  {
    title: "The Judgment of Paris",
    room: "Gallery 157",
    tag: "전쟁의 시작",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/247916/main-image",
    story: "파리스가 가장 아름다운 여신으로 아프로디테를 선택하고, 그 보상으로 헬레네를 약속받는 장면입니다.",
    why: "오디세이의 모든 고난은 결국 이 선택에서 시작됩니다.",
    look: "작은 인물들을 하나씩 찾기보다 여신들의 경쟁이라는 긴장감을 먼저 느껴보세요.",
    url: "https://www.metmuseum.org/art/collection/search/247916",
  },
  {
    title: "Eurykleia washing Odysseus’s feet",
    room: "Gallery 157",
    tag: "귀환",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/251812/main-image",
    story: "거지로 변장한 오디세우스의 발을 씻기던 유모 에우리클레이아가 흉터를 보고 그의 정체를 알아보는 순간입니다.",
    why: "전투보다 더 인간적이고 뭉클한 귀환의 장면입니다.",
    look: "몸을 굽힌 유모와 비밀을 숨기는 오디세우스 사이의 긴장에 주목하세요.",
    url: "https://www.metmuseum.org/art/collection/search/251812",
  },
  {
    title: "Odysseus returning to Penelope",
    room: "Gallery 157",
    tag: "페넬로페",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/253053/main-image",
    story: "20년에 가까운 전쟁과 방랑 끝에 오디세우스가 아내 페넬로페에게 돌아오는 장면입니다.",
    why: "오디세이의 진짜 결말은 모험의 승리가 아니라 집으로 돌아오는 것입니다.",
    look: "두 사람 사이의 거리와 시선을 보며 오랜 기다림 끝의 재회를 상상해보세요.",
    url: "https://www.metmuseum.org/art/collection/search/253053",
  },
  {
    title: "Scenes from Iphigenia at Aulis",
    room: "Gallery 161",
    tag: "클리타임네스트라",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/253340/main-image",
    story: "아가멤논이 출정을 위해 딸 이피게네이아를 희생시키려 한 사건을 다룹니다.",
    why: "클리타임네스트라가 남편을 용서하지 못하고 복수하는 이유를 이해하게 해줍니다.",
    look: "작은 표면에 압축된 여러 장면을 한 편의 연극처럼 읽어보세요.",
    url: "https://www.metmuseum.org/art/collection/search/253340",
  },
  {
    title: "Sarcophagus with scenes from the Oresteia",
    room: "Gallery 169",
    tag: "전쟁의 후유증",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/252960/main-image",
    story: "아가멤논의 귀환과 죽음, 그리고 아들 오레스테스의 복수까지 이어지는 비극입니다.",
    why: "전쟁이 끝나도 가정에는 평화가 돌아오지 않았다는 사실을 보여줍니다.",
    look: "인물 하나보다 화면 전체의 얽힘을 보며 복수의 연쇄를 느껴보세요.",
    url: "https://www.metmuseum.org/art/collection/search/252960",
  },
  {
    title: "Shield Depicting the Siege of Troy",
    room: "Gallery 374",
    tag: "트로이 목마",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/22896/main-image",
    story: "트로이 전쟁의 여러 장면과 목마가 성 안으로 들어가는 순간이 방패 위에 층층이 새겨져 있습니다.",
    why: "시논의 거짓말이 성공한 결과를 가장 생생하게 볼 수 있는 작품입니다.",
    look: "아래에서 위로 읽으며 마지막에 트로이 목마를 찾아보세요.",
    url: "https://www.metmuseum.org/art/collection/search/22896",
  },
  {
    title: "Aristotle with a Bust of Homer",
    room: "Gallery 616",
    tag: "호메로스",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/437394/main-image",
    story: "아리스토텔레스가 『일리아스』와 『오디세이』의 시인 호메로스의 흉상에 손을 얹고 있습니다.",
    why: "앞에서 본 모든 신화 장면이 어디에서 왔는지 보여주는 이번 동선의 클라이맥스입니다.",
    look: "금사슬, 손의 위치, 호메로스의 표정을 함께 보며 무엇이 오래 남는지 생각해보세요.",
    url: "https://www.metmuseum.org/art/collection/search/437394",
  },
  {
    title: "Telemachus and the Nymphs of Calypso",
    room: "Gallery 627",
    tag: "칼립소의 후대 변주",
    image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/436810/main-image",
    story: "오디세우스의 아들 텔레마코스를 주인공으로 한 18세기식 고전 서사 변주입니다.",
    why: "오디세이가 수천 년 동안 계속 새롭게 해석되어 왔음을 보여줍니다.",
    look: "고대 신화를 우아하고 낭만적으로 바꾼 색과 인물 표현을 보세요.",
    url: "https://www.metmuseum.org/art/collection/search/436810",
  },
];

const mustSee: ArchiveWork[] = [
  { title: "Temple of Dendur", artist: "Ancient Egypt", room: "Gallery 131", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/547802/main-image", note: "메트의 상징과 같은 이집트 신전입니다. 작품 하나보다 유리창, 물, 사암이 만드는 공간 전체를 보세요.", url: "https://www.metmuseum.org/art/collection/search/547802" },
  { title: "Washington Crossing the Delaware", artist: "Emanuel Leutze", room: "Gallery 760", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/11417/main-image", note: "배와 인물들이 만드는 강한 대각선이 압도적인 미국 역사화입니다.", url: "https://www.metmuseum.org/art/collection/search/11417" },
  { title: "Young Woman with a Water Pitcher", artist: "Johannes Vermeer", room: "Gallery 614", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/437881/main-image", note: "창문에서 들어오는 빛과 파란색·흰색의 조화를 천천히 보세요.", url: "https://www.metmuseum.org/art/collection/search/437881" },
  { title: "Bridge over a Pond of Water Lilies", artist: "Claude Monet", room: "Gallery 819", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/437127/main-image", note: "일본식 다리와 수련 연못이 하나의 색면처럼 이어지는 편안한 피날레입니다.", url: "https://www.metmuseum.org/art/collection/search/437127" },
  { title: "Self-Portrait with a Straw Hat", artist: "Vincent van Gogh", room: "Gallery 825", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/436532/main-image", note: "짧고 방향성 강한 붓질과 노란 모자가 인상적인 자화상입니다.", url: "https://www.metmuseum.org/art/collection/search/436532" },
  { title: "The Unicorn Rests in a Garden", artist: "South Netherlandish", room: "Cloisters Gallery 17", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/467642/main-image", note: "울타리, 석류나무, 붉은 얼룩을 찾으며 신비로운 상징을 읽어보세요.", url: "https://www.metmuseum.org/art/collection/search/467642" },
];

const archive: ArchiveWork[] = [
  { title: "Madame X", artist: "John Singer Sargent", room: "Gallery 771", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/12127/main-image", note: "과감한 자세와 검은 드레스로 큰 논란을 일으킨 사전트의 대표 초상화입니다.", url: "https://www.metmuseum.org/art/collection/search/12127" },
  { title: "The Harvesters", artist: "Pieter Bruegel the Elder", room: "Gallery 642", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/435809/main-image", note: "한여름 들판의 노동과 휴식을 거대한 풍경 속에 함께 담은 걸작입니다.", url: "https://www.metmuseum.org/art/collection/search/435809" },
  { title: "Little Fourteen-Year-Old Dancer", artist: "Edgar Degas", room: "Gallery 815", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/196439/main-image", note: "이상화된 무용수가 아니라 고된 훈련을 견디는 어린 발레 연습생의 현실을 보여줍니다.", url: "https://www.metmuseum.org/art/collection/search/196439" },
  { title: "Autumn Rhythm: Number 30, 1950", artist: "Jackson Pollock", room: "Gallery 851", note: "저작권 제한으로 공개 이미지는 없지만, 현장에서는 가까이서 선의 리듬을, 멀리서 화면 전체의 에너지를 보세요.", url: "https://www.metmuseum.org/art/collection/search/488978" },
  { title: "The Death of Socrates", artist: "Jacques Louis David", room: "Gallery 614", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/436105/main-image", note: "독배를 앞두고도 철학을 설파하는 소크라테스와 흔들리는 제자들이 강하게 대비됩니다.", url: "https://www.metmuseum.org/art/collection/search/436105" },
  { title: "Juan de Pareja", artist: "Diego Velázquez", room: "Gallery 617", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/437869/main-image", note: "당당한 시선과 생생한 피부·옷감 표현으로 존엄한 한 인간을 그린 초상입니다.", url: "https://www.metmuseum.org/art/collection/search/437869" },
  { title: "Gertrude Stein", artist: "Pablo Picasso", room: "Gallery 965", note: "저작권 제한으로 공개 이미지는 없지만, 전통 초상화에서 입체주의로 넘어가는 단단한 형태를 볼 수 있습니다.", url: "https://www.metmuseum.org/art/collection/search/488221" },
  { title: "The Gulf Stream", artist: "Winslow Homer", room: "Gallery 767", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/11122/main-image", note: "거대한 바다와 작은 배의 대비 속에서 인간의 생존 의지를 보여줍니다.", url: "https://www.metmuseum.org/art/collection/search/11122" },
  { title: "View of Toledo", artist: "El Greco", room: "Gallery 958", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/436575/main-image", note: "실제 풍경을 어둡고 환상적인 도시로 재구성한 강렬한 풍경화입니다.", url: "https://www.metmuseum.org/art/collection/search/436575" },
  { title: "The Charpentier Family", artist: "Pierre-Auguste Renoir", room: "Gallery 824", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/438815/main-image", note: "아이들의 표정과 화려한 옷감, 실내 장식의 풍부한 색을 살펴보세요.", url: "https://www.metmuseum.org/art/collection/search/438815" },
  { title: "Boating", artist: "Édouard Manet", room: "Gallery 810", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/436947/main-image", note: "여름 햇빛과 물의 반사를 선명하고 평면적인 색으로 표현한 현대적인 화면입니다.", url: "https://www.metmuseum.org/art/collection/search/436947" },
  { title: "Cuxa Cloister", artist: "Medieval France", room: "Cloisters Gallery 7", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/470314/main-image", note: "분홍빛 대리석 기둥과 중앙 정원이 클로이스터 특유의 고요함을 만듭니다.", url: "https://www.metmuseum.org/art/collection/search/470314" },
  { title: "A Knight of the d’Aluye Family", artist: "Medieval France", room: "Cloisters Gallery 9", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/470599/main-image", note: "방패와 검, 얼굴 표현을 통해 중세 기사 계급의 이상을 엿볼 수 있습니다.", url: "https://www.metmuseum.org/art/collection/search/470599" },
  { title: "The Cloisters Cross", artist: "English", room: "Cloisters Gallery 14", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/470305/main-image", note: "상아 표면에 촘촘히 새긴 인물과 장면의 밀도가 압도적인 중세 공예품입니다.", url: "https://www.metmuseum.org/art/collection/search/470305" },
  { title: "The Mérode Altarpiece", artist: "Workshop of Robert Campin", room: "Cloisters Gallery 19", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/470304/main-image", note: "가정집 같은 실내에 수태고지를 배치하고 일상 사물에 상징을 숨긴 초기 네덜란드 회화입니다.", url: "https://www.metmuseum.org/art/collection/search/470304" },
  { title: "William the Hippo", artist: "Ancient Egypt", room: "Gallery 111", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/544227/main-image", note: "푸른 몸에 나일강 식물이 그려진 메트의 사랑받는 작은 하마입니다.", url: "https://www.metmuseum.org/art/collection/search/544227" },
  { title: "Human-headed winged lion", artist: "Neo-Assyrian", room: "Gallery 401", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/322609/main-image", note: "사람의 머리와 사자의 몸, 독수리 날개를 결합한 궁전 수호상입니다.", url: "https://www.metmuseum.org/art/collection/search/322609" },
  { title: "Armor of Henry II of France", artist: "French", room: "Gallery 374", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/23947/main-image", note: "신화 장면과 장식으로 뒤덮인 갑옷은 전투 장비이자 왕권의 이미지였습니다.", url: "https://www.metmuseum.org/art/collection/search/23947" },
  { title: "Autumn Landscape", artist: "Tiffany Studios", room: "American Wing", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/12019/main-image", note: "색유리 자체의 색과 질감이 회화처럼 가을 숲과 빛을 만들어냅니다.", url: "https://www.metmuseum.org/art/collection/search/12019" },
  { title: "The Sorrow of Telemachus", artist: "Angelica Kauffmann", room: "Gallery 627", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/436809/main-image", note: "아버지를 찾는 텔레마코스의 슬픔을 우아한 신고전주의 양식으로 표현한 칼립소 연작의 짝 작품입니다.", url: "https://www.metmuseum.org/art/collection/search/436809" },
];

function ArtImage({ src, alt, restricted = false }: { src?: string; alt: string; restricted?: boolean }) {
  const [failed, setFailed] = useState(!src);
  if (failed || !src) {
    return (
      <div className="imageFallback">
        <strong>THE MET</strong>
        <span>{restricted ? "저작권 제한 · 현장 감상" : "공개 이미지를 불러올 수 없습니다"}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export default function Page() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.12 }
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <nav>
        <div className="navInner">
          <a className="brand" href="#top">THE MET × THE CLOISTERS</a>
          <div className="navLinks"><a href="#route">동선</a><a href="#odyssey">오디세이</a><a href="#must">대표작</a><a href="#archive">더 보기</a></div>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="heroGlow" />
        <div className="wrap heroContent">
          <p className="eyebrow">A family museum journey</p>
          <h1>오디세이를 따라<br />두 개의 Met 걷기</h1>
          <p className="heroLead">부모님과 함께 오후 2시부터 6시 45분까지. 낯선 신화를 짧은 이야기로 이해하고, 작품 앞에서 무엇을 볼지 바로 알 수 있는 디지털 전시 가이드입니다.</p>
          <div className="chips"><span>금·토 권장</span><span>자가용 이동</span><span>오디세이 9점</span><span>대표작 6점</span></div>
        </div>
      </header>

      <section className="dark intro">
        <div className="wrap">
          <p className="eyebrow gold">3-minute prologue</p>
          <h2>이 네 장면만 알면<br />작품이 이야기로 보입니다</h2>
          <div className="prologue">
            {[
              ["01", "헬레네와 전쟁", "파리스가 헬레네를 데려가며 트로이 전쟁이 시작됩니다."],
              ["02", "오디세우스의 귀환", "10년의 전쟁 뒤 또 10년을 헤매고 아내 페넬로페에게 돌아갑니다."],
              ["03", "클리타임네스트라의 복수", "딸의 희생이 아가멤논 가문의 연쇄 복수로 이어집니다."],
              ["04", "호메로스의 유산", "고대 이야기는 렘브란트와 카우프만의 시대까지 새롭게 읽힙니다."],
            ].map(([n,t,d]) => <article key={n} data-reveal><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
          </div>
        </div>
      </section>

      <section id="route">
        <div className="wrap">
          <p className="eyebrow">Optimized route</p>
          <h2>시간은 짧게,<br />서사는 끊기지 않게</h2>
          <p className="lead">클로이스터를 먼저 보고 자가용으로 Fifth Avenue 본관까지 이동한 뒤, 갤러리 번호를 따라 한 방향으로 관람합니다.</p>
          <div className="schedule">
            {[
              ["14:00–15:20", "The Met Cloisters", "Cuxa Cloister → Cloisters Cross → Unicorn Tapestry → Mérode Altarpiece", "80분"],
              ["15:20–16:05", "자가용으로 본관 이동", "Fort Tryon Park에서 출발해 The Met Garage로 이동하고 주차까지 마칩니다.", "약 45분"],
              ["16:05–16:47", "그리스·로마 오디세이 코어", "Gallery 155 → 157 → 161 → 169", "42분"],
              ["16:47–18:10", "트로이 방패 → 덴두르 → 호메로스 → 칼립소", "Gallery 374 → 131 → 614 → 616 → 627", "83분"],
              ["18:10–18:45", "모네와 반 고흐 피날레", "Gallery 819 → 825 → Great Hall", "35분"],
            ].map(([time,title,desc,dur]) => <article className="scheduleItem" key={time} data-reveal><time>{time}</time><div><h3>{title}</h3><p>{desc}</p></div><b>{dur}</b></article>)}
          </div>
          <div className="parking"><strong>자가용 팁</strong><p>The Met Fifth Avenue Garage 입구는 Fifth Avenue와 80th Street에 있습니다. 공간이 제한될 수 있으므로 주차 진입과 박물관 입장에 최소 10–15분 버퍼를 두세요.</p></div>
        </div>
      </section>

      <section id="odyssey" className="soft">
        <div className="wrap">
          <p className="eyebrow">Odyssey collection</p>
          <h2>작품 앞에서<br />이야기가 시작됩니다</h2>
          <div className="storyStack">
            {odysseyWorks.map((work, i) => <article className="storyCard" key={work.title} data-reveal>
              <div className="storyImage"><ArtImage src={work.image} alt={work.title} /></div>
              <div className="storyCopy"><div className="kicker"><span>{String(i+1).padStart(2,"0")}</span><span>{work.room}</span><span>{work.tag}</span></div><h3>{work.title}</h3><div className="explain"><strong>이 장면은</strong><p>{work.story}</p></div><div className="twoCol"><div><strong>왜 볼까</strong><p>{work.why}</p></div><div><strong>앞에서 볼 것</strong><p>{work.look}</p></div></div><a className="textLink" href={work.url} target="_blank" rel="noreferrer">The Met 공식 작품 페이지 ↗</a></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="must">
        <div className="wrap">
          <p className="eyebrow">Essential masterpieces</p>
          <h2>오디세이 밖에서도<br />꼭 만나야 할 작품</h2>
          <div className="highlightGrid">{mustSee.map(work => <a className="highlightCard" href={work.url} target="_blank" rel="noreferrer" key={work.title} data-reveal><div className="highlightImage"><ArtImage src={work.image} alt={work.title} /></div><div className="highlightCopy"><span>{work.room} · {work.artist}</span><h3>{work.title}</h3><p>{work.note}</p></div></a>)}</div>
        </div>
      </section>

      <section id="archive" className="archiveSection">
        <div className="wrap wide">
          <p className="eyebrow">More to discover</p>
          <h2>시간 때문에 소개하지 못한<br />작품 아카이브</h2>
          <p className="lead">이번 압축 동선에서 제외했지만 시간이 더 있거나 다음 방문을 계획할 때 볼 만한 작품들입니다.</p>
          <div className="archiveGrid">{archive.map(work => <a className="archiveCard" href={work.url} target="_blank" rel="noreferrer" key={work.title} data-reveal><div className="archiveImage"><ArtImage src={work.image} alt={work.title} restricted={!work.image} /><span>{work.room}</span></div><div className="archiveCopy"><h3>{work.title}</h3><p className="artist">{work.artist}</p><p>{work.note}</p></div></a>)}</div>
        </div>
      </section>

      <footer><div className="wrap"><strong>THE MET × THE CLOISTERS</strong><p>작품 위치와 운영시간은 방문 당일 The Met 공식 페이지에서 다시 확인하세요.</p></div></footer>
    </main>
  );
}
