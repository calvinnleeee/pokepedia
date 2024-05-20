// the pokemon list to display
let pokemonList;

// the list of cards to display (made from the list)
let pokemonCards;

// variables for pagination
let currentPage = 1;
const cardsPerPage = 10;
const maxPageButtons = 5;

// on page load
async function onLoad() {
  await fetchAllPokemon();
  updateList();
};
onLoad();


/*
  Fetch all pokemon from the api
*/
async function fetchAllPokemon() {
  const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=1100";

  // fetch all the pokemon 
  await fetch(apiUrl).then(response => response.json()).then(data => {
    // set the list to the results of fetching
    pokemonList = data.results;
  })
  .catch(error => {
    console.error("Error fetching Pokémon:", error);
  });
};

/*
  Add event listeners to all the filter buttons
*/
const filterButtons = document.querySelectorAll(".typeFilter");
filterButtons.forEach((filterBtn) => {
  filterBtn.addEventListener("click", (event) => {
    // update button to a different colour to show which ones are selected
    event.target.classList.toggle("btn-secondary");
    event.target.classList.toggle("btn-primary");

    updateFilter();
  });
});


/*
  Function for event listener to call to fetch certain type combinations when a button is clicked
*/
async function updateFilter() {
  const filter = document.querySelectorAll(".btn-primary");

  // if the filter contains more than 2 types, empty the list (no pokemon has more than 2 types)
  if (filter.length > 2) {
    pokemonList = [];
    updateList();
    return;
  }
  // if the filter contains no types or is undefined, just show all 810 pokemon
  else if (filter.length == 0 || !filter) {
    await fetchAllPokemon();
    updateList();
    return;
  }

  // handle filtering for one type
  let type1 = filter[0].value;
  let filteredPokemon = await filterSearch(type1);

  // if there was a second type, search for the second type and then only return pokemon
  // that appear in both lists
  if (filter.length == 2) {
    let type2 = filter[1].value;
    let filteredPokemon2 = await filterSearch(type2);

    // construct a list of names of pokemon in second list, to use for filtering of first list
    let nameList = [];
    filteredPokemon2.forEach(element => {
      nameList = nameList.concat(element.pokemon.name);
    });
    // console.log("namelist = " + nameList);
    // set the first array to be a new array that only contains pokemon that appear in both arrays
    filteredPokemon = filteredPokemon.filter(element => nameList.includes(element.pokemon.name));
  }

  // if at this point for some reason filteredPokemon is undefined or empty, display an empty list
  if (!filteredPokemon) {
    pokemonList = [];
    updateList();
    return;
  }

  // format the new list so it's the same format as the one from the fetch all
  let tmp = [];
  filteredPokemon.forEach(element => {
    tmp = tmp.concat(element.pokemon);
  });

  // display the new list
  pokemonList = tmp;
  updateList();
  return;
}

/*
  Update the list of cards to display with the pokemon list 
*/
function updateList() {
  // first clear the current list of cards
  pokemonCards = [];

  // Create a list of cards containing all the pokemon in the list
  pokemonList.forEach(element => {
    // create each part of the card to display (divs, imgs, buttons)
    let tmp = element.url.split("/");
    let pokeIndex = tmp[tmp.length - 2];
    let cardDiv = document.createElement('div');
    let cardImg = document.createElement('img');
    let cardInnerDiv = document.createElement('div');
    let cardName = document.createElement('p');
    let cardButton = document.createElement('button');
    
    // change/construct the attributes of each element, including adding bootstrap classes
    cardImg.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + pokeIndex + ".png";
    cardImg.alt = element.name;
    cardImg.classList = "img-fluid img-size mt-3";

    cardInnerDiv.classList = "card-body py-1"

    cardName.innerText = element.name.toUpperCase();
    cardName.classList = "card-title"

    cardButton.type = "button";
    cardButton.classList = "btn btn-info";
    cardButton.innerText = "More";
    cardButton.setAttribute("data-bs-toggle", "modal");
    cardButton.setAttribute("data-bs-target", "#modal");
    cardButton.addEventListener("click", () => changeModalContent(element.url));

    cardDiv.appendChild(cardImg);
    cardDiv.appendChild(cardInnerDiv);
    cardInnerDiv.appendChild(cardName);
    cardInnerDiv.appendChild(cardButton);

    cardDiv.classList = "card mx-2 my-4 col-lg-3 text-center";

    // append the new card to the end of the list of pokemon cards
    pokemonCards = pokemonCards.concat(cardDiv);
  });
  
  currentPage = 1;
  renderAll();
  // to-do: add modal functionality to each button
}

/*
  Create the HTML to display the pokemon cards based on the page
*/
function renderAll() {
  let startIndex = (currentPage - 1) * cardsPerPage;
  let endIndex = Math.min(startIndex + cardsPerPage - 1, pokemonCards.length - 1);

  // change the header to display the display text (x out of y pokemon)
  let displayDiv = document.getElementById("card-header");
  displayDiv.innerHTML = `<h4>Displaying ${Math.min(endIndex - startIndex + 1, 10)} of ${pokemonList.length} Pokemon.</h4>`;

  // clear the list and append the new html cards
  document.getElementById("card-display").innerHTML = '';
  for (let i = startIndex; i <= endIndex; i++) {
    document.getElementById("card-display").appendChild(pokemonCards[i]);
  }

  // also render the updated pagination buttons
  let totalPages = Math.ceil(pokemonCards.length / cardsPerPage);
  let buttonContainer = document.getElementById("page-buttons");

  // clear the button container first before rendering buttons
  buttonContainer.innerHTML = "";

  // first and previous buttons only rendered if currentPage isn't 1
  if (currentPage > 1) {
    // first button
    let btn = document.createElement("button");
    btn.innerHTML = "First"
    btn.classList = "btn btn-secondary mx-1";
    btn.addEventListener("click", () => goToPage(1));
    buttonContainer.appendChild(btn);

    // prev button
    btn = document.createElement("button");
    btn.innerHTML = "Prev";
    btn.classList = "btn btn-secondary mx-1";
    btn.addEventListener("click", () => goToPage(currentPage - 1));
    buttonContainer.appendChild(btn);
  }

  // numbered page buttons
  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
    // continue with the loop if page number to render is less than 1 or more than 
    // the total number of pages
    if (i <= 0 || i > totalPages) {
      continue;
    }
    // otherwise, render the page button for current i
    else {
      let btn = document.createElement("button");
      btn.innerHTML = i;
      btn.classList = "btn btn-secondary mx-1";
      btn.addEventListener("click", () => goToPage(i));
      if (i == currentPage) {
        btn.classList = "btn btn-warning mx-1";
      }
      buttonContainer.appendChild(btn);
    }
  }

  // next and last buttons only rendered if currentPage is less than the total num of pages
  if (currentPage < totalPages) {
    // next button
    let btn = document.createElement("button");
    btn.innerHTML = "Next"
    btn.classList = "btn btn-secondary mx-1";
    btn.addEventListener("click", () => goToPage(currentPage + 1));
    buttonContainer.appendChild(btn);

    // last button
    btn = document.createElement("button");
    btn.innerHTML = "Last";
    btn.classList = "btn btn-secondary mx-1";
    btn.addEventListener("click", () => goToPage(totalPages));
    buttonContainer.appendChild(btn);
  }
}

/*
  On-click function for pagination buttons to switch to a certain page and render
*/
function goToPage(pageNum) {
  currentPage = pageNum;
  renderAll();
}

/*
  Function that fetches and returns the list of pokemon of a given type
*/
async function filterSearch(inputType) {
  let filtered;
  let filterUrl = "https://pokeapi.co/api/v2/type/" + inputType;

  await fetch(filterUrl).then(response => response.json()).then(data => {
    filtered = data.pokemon;
  })
  .catch(error => {
    console.error("Error fetching Pokémon:", error)
  });

  return filtered;
}

/*
  Change the modal content based on which pokemon card button was clicked
*/
async function changeModalContent(pokeUrl) {
  await fetch(pokeUrl).then(response => response.json()).then(data => {
    // clear the modal first
    let modalDiv = document.getElementById("modal-body");
    modalDiv.innerHTML = "";

    // pokemon name and pokedex entry number
    let modalTitle = document.createElement("h3");
    modalTitle.innerHTML = data.name.toUpperCase();
    let pokeEntry = document.createElement("p");
    pokeEntry.classList = "mb-3"
    pokeEntry.innerHTML = "Pokedex entry: " + data.order;

    // pokemon img
    let modalPic = document.createElement("img");
    modalPic.src = data.sprites.front_default;
    modalPic.classList = "modal-img mx-auto mb-3"

    // pokemon abilities
    let abilityLabel = document.createElement("h3");
    abilityLabel.innerHTML = "Abilities";
    let modalAbility = document.createElement("ul");
    let pokeAbilities = data.abilities;
    pokeAbilities.forEach(ability => {
      modalAbility.innerHTML += `<li>${ability.ability.name}</li>`
    });

    // pokemon stats
    let statLabel = document.createElement("h3");
    statLabel.innerHTML = "Stats";
    let modalStats = document.createElement("ul");
    let pokeStats = data.stats;
    let statOrder = ["HP", "ATK", "DEF", "SPA", "SPD", "SPE"];
    for (let i = 0; i < statOrder.length; i++) {
      modalStats.innerHTML += `<li>${statOrder[i]}:\t\t${pokeStats[i].base_stat}</li>`;
    };

    // pokemon types
    let typeLabel = document.createElement("h3");
    typeLabel.innerHTML = "Type";
    let modalTypes = document.createElement("ul");
    let pokeTypes = data.types;
    pokeTypes.forEach(type => {
      modalTypes.innerHTML += `<li>${type.type.name}</li>`;
    });

    // put everything together
    modalDiv.appendChild(modalTitle);
    modalDiv.appendChild(pokeEntry);
    modalDiv.appendChild(modalPic);
    modalDiv.appendChild(abilityLabel);
    modalDiv.appendChild(modalAbility);
    modalDiv.appendChild(statLabel);
    modalDiv.appendChild(modalStats);
    modalDiv.appendChild(typeLabel);
    modalDiv.appendChild(modalTypes);
    
  });
}