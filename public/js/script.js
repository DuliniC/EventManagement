document.addEventListener("DOMContentLoaded", function () {
  initMap();
  getEvents();
  fetchCategories();
  const sidePanelC = document.getElementById("sidePanelC");
  const sidePanelE = document.getElementById("sidePanelE");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const addEventBtn = document.getElementById("addEventBtn");
  const closePanel = document.getElementById("closePanel");
  const closePanelE = document.getElementById("closePanelE");
  const eventAddForm = document.getElementById("eventForm");
  const cancelForm = document.getElementById("cancel");
  const imagePreview = document.getElementById("imagePreview");
  const banner = document.getElementById("event-banner");
  var bannerBase64String = "";

  var dates = document.querySelectorAll(".datepicker");
  M.Datepicker.init(dates);

  var time = document.querySelectorAll(".timepicker");
  M.Timepicker.init(time);

  var selects = document.querySelectorAll("select");
  M.FormSelect.init(selects);

  // Open side panel
  addCategoryBtn.addEventListener("click", () => {
    sidePanelC.style.width = "25%";
    sidePanelC.style.display = "block";
    addCategoryBtn.style.display = "none";
    addEventBtn.style.display = "none";
    sidePanelC.classList.add("open");
  });

  // Close side panel
  closePanel.addEventListener("click", () => {
    sidePanelC.style.marginLeft = "0%";
    sidePanelC.style.display = "none";
    addCategoryBtn.style.display = "inline-block";
    addEventBtn.style.display = "inline-block";
    sidePanelC.classList.remove("open");
    sidePanelE.style.marginLeft = "0%";
    sidePanelE.style.display = "none";
    sidePanelE.classList.remove("open");
  });

  closePanelE.addEventListener("click", () => {
    sidePanelE.style.marginLeft = "0%";
    sidePanelE.style.display = "none";
    addCategoryBtn.style.display = "inline-block";
    addEventBtn.style.display = "inline-block";
    sidePanelE.classList.remove("open");
  });

  addEventBtn.addEventListener("click", () => {
    sidePanelE.style.width = "25%";
    sidePanelE.style.display = "block";
    addCategoryBtn.style.display = "none";
    addEventBtn.style.display = "none";
    sidePanelE.classList.add("open");
    fetchCategories();
    initMapPlace();
  });

  cancelForm.addEventListener("click", () => {
    sidePanelE.style.marginLeft = "0%";
    sidePanelE.style.display = "none";
    addCategoryBtn.style.display = "inline-block";
    addEventBtn.style.display = "inline-block";
    sidePanelE.classList.remove("open");

    eventAddForm.reset();
    imagePreview.src = "";
    bannerBase64String = "";
    eventLocation = {};
  });

  const scrollContainer = document.getElementById('scroll-container');
  let isDragging = false;
  let startX;
  let scrollLeft;

  scrollContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
  });

  scrollContainer.addEventListener('mouseleave', () => {
      isDragging = false;
      scrollContainer.style.cursor = 'grab';
  });

  scrollContainer.addEventListener('mouseup', () => {
      isDragging = false;
      scrollContainer.style.cursor = 'grab';
  });

  scrollContainer.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // Adjust scroll speed
      scrollContainer.scrollLeft = scrollLeft - walk;
  });

  scrollContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
  });

  scrollContainer.addEventListener('touchend', () => {
      isDragging = false;
      scrollContainer.style.cursor = 'grab';
  });

  scrollContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // Adjust scroll speed
      scrollContainer.scrollLeft = scrollLeft - walk;
  });

  //Event Banner Image Preview
  banner.addEventListener("change", function () {
    const file = banner.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      bannerBase64String = reader.result
        .replace("data:", "")
        .replace(/^.+,/, "");
      const imagePreview = document.getElementById("imagePreview");
      imagePreview.src = imageDataUrl;
    };

    reader.readAsDataURL(file);
  });

  //Submit Event Form
  eventAddForm.addEventListener("submit", function (event) {
    var location = document.getElementById('event-location');

    event.preventDefault();
    const data = {
      "name": document.getElementById("event-name").value,
      "details": document.getElementById("details").value,
      "date": new Date(document.getElementById("date").value),
      "location": {
        "address": location.value,
        "latitude":Number(location.getAttribute('latitude')),
        "longitude":Number(location.getAttribute('longitude'))
      },
      "timeStart": document.getElementById("timeStart").value,
      "timeEnd": document.getElementById("timeEnd").value,
      "categories": Array.from(
        document.getElementById("selectCategory").selectedOptions
      ).map((option) => option.value),
      "organizerName": document.getElementById("organizerName").value,
      "organizerContact": document.getElementById("organizerContact").value,
      "banner": bannerBase64String,
    };

    try {
      fetch("/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      M.toast({ html: "Event Added Successfully" });
      eventAddForm.reset();
      imagePreview.src = "";
      sidePanelE.classList.remove("open");
      getEvents();
    } catch (err) {
      M.toast({ html: "Event Adding Failed" });
    }
  });
});

// GET categories
async function fetchCategories() {
  try {
    await fetch("/categories")
      .then((response) => response.json())
      .then((categories) => {
        showCategories(categories);
        showCategoryFilters(categories);
      });
  } catch (err) {
    console.log("Failed to fetch categories:", err);
  }
}

function showCategories(categories){
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  populateSelect(categories);

  categories.forEach((category) => {
    const tr = document.createElement("tr");
    tr.id = `category-row-${category._id}`;

    tr.innerHTML = `
      <td id="category-name-${category._id}">${category.name}</td>
      <td>
          <button class="btn-small btn-floating light-blue accent-3" id="editBtn" onclick="updateCategory('${category._id}')">
            <i class="material-icons">edit</i>
          </button>
      </td>
      <td>
          <button class="btn-small red btn-floating" id="deleteBtn" onclick="deleteCategory('${category._id}')">
            <i class="material-icons">delete</i>
          </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  categoryList.appendChild(table);
}

function showCategoryFilters(categories){
  const cardList = document.getElementById('scroll-container');
  cardList.innerHTML = '';

  // Create and append the "All" category button
  const allCard = document.createElement("div");
  allCard.classList.add("option-card", "center-align", "white", "z-depth-1", "active"); // Make "All" active by default

  allCard.innerHTML = `<p>All</p>`;

  // Add event listener for the "All" category
  allCard.addEventListener("click", function() {
    document.querySelectorAll('.option-card').forEach(card => {
      card.classList.remove('active');
    });
    allCard.classList.add('active');
    getEvents();
  });

  cardList.appendChild(allCard);

  categories.forEach((category) => {
    const card = document.createElement("div");
    card.classList.add("option-card", "center-align", "white", "z-depth-1");
    card.innerHTML = `
    <p>${category.name}</p>`;

    card.addEventListener("click", function() {
      document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('active');
      });

      card.classList.add('active');
      getEventsByCategory(category._id);
    });
    cardList.appendChild(card);
  })
}

//GET All Events
async function getEvents() {
  showSpinner();
  try {
    await fetch("/events")
      .then((response) => response.json())
      .then((events) => {
        setEventCardContainer(events)
      });
  } catch (e) {
    console.log(e);
  }
}

async function getEventsByCategory(category){
  try{
    showSpinner();
    await fetch(`/events/category/${category}`)
      .then((response) => response.json())
      .then((events) => {
        setEventCardContainer(events)
      });
  } catch(e){
    console.log(e);
  }
}

let markers = [];

function setEventCardContainer(events){
  const cardContainer = document.getElementById("event-container");
  cardContainer.innerHTML = '';
  if (events.length === 0) {
    const noDataMessage = document.createElement("div");
    noDataMessage.classList.add("no-data");
    noDataMessage.textContent = "No Events available.";
    cardContainer.appendChild(noDataMessage);
    initMap();
    hideSpinner();
    return;
  }
  markers.forEach(marker => {
    marker.setMap(null); // Removes the marker from the map
  });
  markers = [];

  events.forEach((event) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-image">
        <img src="data:image/png;base64,${
          event.banner
        }" onerror="this.onerror=null; this.src='./img/img-noload.jpg';" alt="Event Image">
        <span class="card-title">
          ${new Date(event.date).toDateString()} <br/> ${
      event.timeStart
    } - ${event.timeEnd}
        </span>
      </div>
      <div class="card-content">
        <span class="card-title">${event.name}</span>
        <p>${event.details}</p>
      </div>
      <div class="card-action">
        <div class="row">
          <div class="col s1"><i class="material-icons icon-location">location_on</i></div>
          <div class="col s5">${event.location?.address}</div>
          <div class="col s6">
            <button class="waves-light btn" id="rsvp-btn-${event._id}" 
                onclick="updateRSVP('${event._id}',${event.attendees})">RSVP</button>
            <span id="attendees-count-${event._id}">${
      event.attendees
    } Going</span>
          </div>
        </div>
    </div>
    `;
    cardContainer.appendChild(card);

    var marker = new google.maps.Marker({
      position: { lat: event.location.latitude, lng: event.location.longitude },
      map: map,
      title: event.address
    });

    markers.push(marker);

    var infoWindow = new google.maps.InfoWindow({
      content: `<div><strong>${event.name}</strong><br>
      ${new Date(event.date).toDateString()}<br>
      ${event.timeStart} - ${event.timeEnd}<br>
      ${event.location.address}</div>`
    });

    marker.addListener('click', function() {
      infoWindow.open(map, marker);
    });

    hideSpinner();
  });
}

function populateSelect(data) {
  //var selects = document.querySelectorAll("select");
  var select = document.getElementById("selectCategory");

  var instance = M.FormSelect.getInstance(select);
  if (instance) {
    instance.destroy();
  }
  select.innerHTML = `<option value="" disabled>--Select an option--</option>`;

  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item._id;
    option.textContent = item.name;
    option.index;
    select.appendChild(option); // Append option to the select element
  });

  M.FormSelect.init(select);

  var dropdownItems = document.querySelectorAll(".select-dropdown li");
  dropdownItems.forEach(function (item, index) {
    item.setAttribute("tabindex", (index + 1).toString());
  });
}

function updateRSVP(id) {
  const attendeesCount = document.getElementById(`attendees-count-${id}`);
  let count = attendeesCount.textContent.split(" ")[0];
  let value = parseInt(count);
  attendeesCount.textContent = `${value + 1} Going`;

  try {
    fetch(`/events/rsvp/${id}`, {
      method: "PATCH",
    });
  } catch (err) {
    attendeesCount.textContent = `${value} Going`;
  }
}

function deleteCategory(id){
  try{
    fetch(`/categories/${id}`, {
      method: "DELETE"
    });
    M.toast({ html: "Category Deleted" });
    const row = document.getElementById(`category-row-${id}`);
    if (row) {
      row.remove();
    }
  }catch (err){
    console.log()
  }
}

function updateCategory(id){
  document.querySelectorAll('button').forEach(button => button.disabled = true);

  const cell = document.getElementById(`category-name-${id}`);
  var categoryValue = cell.textContent;

  cell.innerHTML =` <input type="text" id="edit-category-input-${id}" value="${categoryValue}">
        <button class="btn-small light-blue accent-3 waves-effect waves-light btn" onClick="saveUpdateCategory('${id}')">Save</button>
        <button class="btn-small red waves-effect waves-light btn" onclick="cancelUpdateCategory('${id}','${categoryValue}')">Cancel</button>`;

}

function cancelUpdateCategory(id, value){
  document.querySelectorAll('button').forEach(button => button.disabled = false);
  const cell = document.getElementById(`category-name-${id}`);
  cell.textContent = value;
}

function saveUpdateCategory(id){
  document.querySelectorAll('button').forEach(button => button.disabled = false);
  const newValue = document.getElementById(`edit-category-input-${id}`).value;
  const cell = document.getElementById(`category-name-${id}`);
  cell.textContent = newValue;

  try{
    fetch(`/categories/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newValue })
    });
    M.toast({ html: "Category Updated" });
  }catch (err){
    console.log()
  }
}

function showSpinner() {
  document.getElementById('spinner').style.display = 'block';
}

function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
}

let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  await google.maps.importLibrary("places");

  map = new Map(document.getElementById("map"), {
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4.5
  });
}

async function initMapPlace(){
  //@ts-ignore
  await google.maps.importLibrary("places");
  const location = document.getElementById("event-location");
  //@ts-ignore
  placeAutocomplete = new google.maps.places.Autocomplete(location,{
    componentRestrictions: {country: 'au'},
  });
  
  //@ts-ignore
  placeAutocomplete.addListener('place_changed', function() {
    var place = placeAutocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
        console.log("No details available for input: '" + place.name + "'");
        return;
    }   

    location.setAttribute('latitude',place.geometry.location.lat());
    location.setAttribute('longitude',place.geometry.location.lng());
  });

}