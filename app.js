import config from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  // 페이지 로드 시 초기 데이터 가져오기
  fetchPokemonData();

  // 스크롤 이벤트 리스너 등록
  window.addEventListener("scroll", handleScroll);
});

let page = 1; // 초기 페이지
let loading = false; // 데이터 로딩 중 여부

async function fetchPokemonData() {
  if (loading) return; // 데이터 로딩 중이면 중복 호출 방지
  loading = true;

  try {
    const response = await fetch(`${config.apiUrl}pokemon?limit=20&offset=${(page - 1) * 20}`);
    const data = await response.json();

    // 가져온 데이터를 이용하여 각 포켓몬 카드를 동적으로 생성
    data.results.forEach(async function (pokemon) {
      const pokemonData = await fetchPokemonDetails(pokemon.url);
      createPokemonCard(pokemonData);
    });

    page++; // 다음 페이지로 이동
    loading = false; // 데이터 로딩 완료
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    loading = false; // 에러 발생 시에도 로딩 상태 초기화
  }
}

async function fetchPokemonDetails(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Pokemon details:", error);
  }
}

async function createPokemonCard(pokemon) {
  const cardContainer = document.getElementById("pokemonContainer");

  const card = document.createElement("div");
  card.classList.add("card");

  // 도감 설명 가져오기
  const flavorText = await getFlavorText(pokemon.species.url);

  card.innerHTML = `
      <img src="${pokemon.sprites.other.showdown.front_default}" alt="${pokemon.name}">
      <h2>${pokemon.name}</h2>
      <p>Type: ${pokemon.types.map((type) => type.type.name).join(", ")}</p>
      <p>${flavorText}</p>
    `;
  card.dataset.pokedexNumber = pokemon.id;
  cardContainer.appendChild(card);
}

async function getFlavorText(speciesUrl) {
  try {
    const response = await fetch(speciesUrl);
    const speciesData = await response.json();

    // 원하는 언어로 도감 설명 추출
    const flavorText = speciesData.flavor_text_entries.find((entry) => entry.language.name === "ko");

    return flavorText ? flavorText.flavor_text : "No flavor text available.";
  } catch (error) {
    console.error("Error fetching flavor text:", error);
    return "Error fetching flavor text.";
  }
}

function handleScroll() {
  // 스크롤이 페이지 아래로 80% 정도 내려갔을 때 새로운 데이터 가져오기
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight * 0.8) {
    fetchPokemonData();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // 페이지 로드 시 초기 데이터 가져오기
  fetchPokemonData();

  // 스크롤 이벤트 리스너 등록
  window.addEventListener("scroll", handleScroll);

  // 검색 버튼 클릭 이벤트 리스너 등록
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  // 카드 클릭 이벤트 리스너 등록
  const cardContainer = document.getElementById("pokemonContainer");
  cardContainer.addEventListener("click", handleCardClick);

  searchInput.focus();
});

function handleCardClick(event) {
  const card = event.target.closest(".card");
  if (card) {
    const pokedexNumber = card.dataset.pokedexNumber;
    console.log(pokedexNumber);
    alert(`도감 번호: ${pokedexNumber}`);
  }
}

function handleSearch() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();

  // 검색어에 맞는 포켓몬 카드만 표시
  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => {
    const pokemonName = card.querySelector("h2").textContent.toLowerCase();
    if (pokemonName.includes(searchInput)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}
