document.addEventListener("DOMContentLoaded", function () {
  initMap();
  getEvents();
  getCategories();
  const sidePanelC = document.getElementById("sidePanelC");
  const sidePanelE = document.getElementById("sidePanelE");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const addEventBtn = document.getElementById("addEventBtn");
  const closePanel = document.getElementById("closePanel");
  const closePanelE = document.getElementById("closePanelE");
  const eventAddForm = document.getElementById("eventForm");
  const categoryForm = document.getElementById("categoryForm");
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

  var modal = document.querySelectorAll(".modal");
  M.Modal.init(modal, {
    onCloseEnd: function (el) {
      location.reload();
    },
  });

  // Open side panel
  addCategoryBtn.addEventListener("click", () => {
    sidePanelC.style.width = "25%";
    sidePanelC.style.display = "block";
    addCategoryBtn.style.display = "none";
    addEventBtn.style.display = "none";
    sidePanelC.classList.add("open");
    document.getElementById('overlay').classList.add('visible');
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

    document.getElementById('overlay').classList.remove('visible');
    categoryForm.reset();
  });

  closePanelE.addEventListener("click", () => {
    sidePanelE.style.marginLeft = "0%";
    sidePanelE.style.display = "none";
    addCategoryBtn.style.display = "inline-block";
    addEventBtn.style.display = "inline-block";
    sidePanelE.classList.remove("open");

    document.getElementById('overlay').classList.remove('visible');
    eventAddForm.reset();
    imagePreview.src = "";
    bannerBase64String = "";
    eventLocation = {};
  });

  addEventBtn.addEventListener("click", () => {
    sidePanelE.style.width = "25%";
    sidePanelE.style.display = "block";
    addCategoryBtn.style.display = "none";
    addEventBtn.style.display = "none";
    sidePanelE.classList.add("open");
    document.getElementById('overlay').classList.add('visible');
    getCategories();
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

  //category filter area horizontal scroll
  const scrollContainer = document.getElementById("scroll-container");
  let isDragging = false;
  let startX;
  let scrollLeft;

  scrollContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    scrollContainer.style.cursor = "grabbing";
  });

  scrollContainer.addEventListener("mouseleave", () => {
    isDragging = false;
    scrollContainer.style.cursor = "grab";
  });

  scrollContainer.addEventListener("mouseup", () => {
    isDragging = false;
    scrollContainer.style.cursor = "grab";
  });

  scrollContainer.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });

  scrollContainer.addEventListener("touchstart", (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    scrollContainer.style.cursor = "grabbing";
  });

  scrollContainer.addEventListener("touchend", () => {
    isDragging = false;
    scrollContainer.style.cursor = "grab";
  });

  scrollContainer.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
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

  document
    .getElementById("edit-event-btn")
    .addEventListener("click", function () {
      // Hide read-only view and show edit form
      document.getElementById("event-details-view").style.display = "none";
      document.getElementById("edit-event-form").style.display = "block";
      document.getElementById("edit-event-btn").style.display = "none";
      document.getElementById("delete-event-btn").style.display = "none";
      document.getElementById("save-update-btn").style.display = "inline-block";
      initMapPlaceUpdate();
    });

  document
    .getElementById("save-update-btn")
    .addEventListener("click", function () {
      var location = document.getElementById("edit-event-location");

      // prettier-ignore
      const updatedEvent = {
        "name": document.getElementById("edit-event-name").value,
        "details": document.getElementById("edit-details").value,
        "date": new Date(document.getElementById("edit-date").value),
        "location": {
          "address": location.value,
          "latitude": Number(location.getAttribute("latitude")),
          "longitude": Number(location.getAttribute("longitude")),  
        },
        "timeStart": document.getElementById("edit-timeStart").value,
        "timeEnd": document.getElementById("edit-timeEnd").value,
        "categories": Array.from(
          document.getElementById("edit-selectCategory").selectedOptions
        ).map((option) => option.value),
        "organizerName": document.getElementById("edit-organizerName").value,
        "organizerContact": document.getElementById("edit-organizerContact").value,
        "banner": updatedBannerString,
      };

      updateEvent(selectedEventId, updatedEvent);
    });

  //Submit Event Form
  eventAddForm.addEventListener("submit", async function (event) {
    var location = document.getElementById("event-location");

    event.preventDefault();

    const data =
      // prettier-ignore
      {
      "name": document.getElementById("event-name").value,
      "details": document.getElementById("details").value,
      "date": new Date(document.getElementById("date").value),
      "location": {
        "address": location.value,
        "latitude": Number(location.getAttribute("latitude")),
        "longitude": Number(location.getAttribute("longitude")),
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
      await fetch("/events", {
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
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (err) {
      M.toast({ html: "Event Adding Failed" });
    }
  });

  document
    .getElementById("delete-event-btn")
    .addEventListener("click", function () {
      if (selectedEventId) {
        deleteEvent(selectedEventId);
      }
    });
});

let markers = [];
let currentInfoWindow = null;
let selectedEventId = null;
let selectedEventAttendess = 0;
let map;
let updatedBannerString = "";
let existingCategories = [];
let oldCategoryValue = "";

// GET categories
async function getCategories() {
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

//Show Categories inside Category Side Panel
function showCategories(categories) {
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  var select = document.getElementById("selectCategory");
  var selectEdit = document.getElementById("edit-selectCategory");
  populateSelect(categories, select);
  populateSelect(categories, selectEdit);
  existingCategories.length = 0;

  categories.forEach((category) => {
    existingCategories.push(category.name);

    const tr = document.createElement("tr");
    tr.id = `category-row-${category._id}`;

    tr.innerHTML = `
      <td id="category-name-${category._id}">${category.name}</td>
      <td>
          <button class="btn-medium btn-floating light-blue accent-3" id="editBtn" onclick="updateCategory('${category._id}')">
            <i class="material-icons">edit</i>
          </button>
      </td>
      <td>
          <button class="btn-medium red btn-floating" id="deleteBtn" onclick="deleteCategory('${category._id}')">
            <i class="material-icons">delete</i>
          </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  categoryList.appendChild(table);
}

//Show Category Filters
function showCategoryFilters(categories) {
  const cardList = document.getElementById("scroll-container");
  cardList.innerHTML = "";

  const allCard = document.createElement("div");
  allCard.classList.add(
    "option-card",
    "center-align",
    "white",
    "z-depth-1",
    "activeCard"
  );

  allCard.innerHTML = `<h5>All</h5>`;

  allCard.addEventListener("click", function () {
    document.querySelectorAll(".option-card").forEach((card) => {
      card.classList.remove("activeCard");
    });
    allCard.classList.add("activeCard");
    getEvents();
  });

  cardList.appendChild(allCard);

  categories.forEach((category) => {
    const card = document.createElement("div");
    card.classList.add("option-card", "center-align", "white", "z-depth-1");
    card.innerHTML = `
    <h5>${category.name}</h5>`;

    card.addEventListener("click", function () {
      document.querySelectorAll(".option-card").forEach((card) => {
        card.classList.remove("activeCard");
      });

      card.classList.add("activeCard");
      getEventsByCategory(category._id);
    });
    cardList.appendChild(card);
  });
}

//Validate Categories
function validateCategory() {
  const category = document.getElementById("name").value;
  if (existingCategories.includes(category.trim())) {
    M.toast({ html: "This Category already exist", classes: "toast" });
    return false;
  }
}

//GET All Events
async function getEvents() {
  showSpinner();
  try {
    await fetch("/events")
      .then((response) => response.json())
      .then((events) => {
        setEventCardContainer(events);
      });
  } catch (e) {
    console.log(e);
  }
}

//Get Events by filtered Category
async function getEventsByCategory(category) {
  try {
    showSpinner();
    await fetch(`/events/category/${category}`)
      .then((response) => response.json())
      .then((events) => {
        setEventCardContainer(events);
      });
  } catch (e) {
    console.log(e);
  }
}

//Show Events in Page
function setEventCardContainer(events) {
  const cardContainer = document.getElementById("event-container");
  cardContainer.innerHTML = "";
  if (events.length === 0) {
    const noDataMessage = document.createElement("div");
    noDataMessage.classList.add("no-data");
    noDataMessage.textContent = "No Events available.";
    cardContainer.appendChild(noDataMessage);
    initMap();
    hideSpinner();
    return;
  }
  markers.forEach((marker) => {
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
          ${new Date(event.date).toDateString()} <br/> 
          ${event.timeStart} - ${event.timeEnd}
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
          <div class="col s5">
            <button class="waves-light btn" id="rsvp-btn-${event._id}" 
                onclick="updateRSVP('${event._id}',${
      event.attendees
    })">RSVP</button>
            <span id="attendees-count-${event._id}">${
      event.attendees
    } Going</span>
          </div>
          <div class="col s1">
          <button class="btn-flat view-event-btn"><i class="material-icons icon-view">visibility</i></button></div>
        </div>
      </div>
    `;
    cardContainer.appendChild(card);

    const viewButton = card.querySelector(".view-event-btn");
    viewButton.addEventListener("click", () => viewEvent(event));

    var marker = new google.maps.Marker({
      position: { lat: event.location.latitude, lng: event.location.longitude },
      map: map,
      title: event.address,
    });

    markers.push(marker);

    var infoWindow = new google.maps.InfoWindow({
      content: `<div><strong>${event.name}</strong><br>
      ${new Date(event.date).toDateString()}<br>
      ${event.timeStart} - ${event.timeEnd}<br>
      ${event.location.address}</div>`,
    });

    marker.addListener("click", function () {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }
      infoWindow.open(map, marker);
      currentInfoWindow = infoWindow;
    });

    hideSpinner();
  });
}

//View of an Event when click view btn
function viewEvent(event) {
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");
  selectedEventId = event._id;
  selectedEventAttendess = event.attendees;

  modalTitle.innerHTML = event.name;
  modalContent.innerHTML = `
    <div class="row">
     <div class="col s12 m6 l6">
      <img id="modal-image" src="data:image/png;base64,${
        event.banner
      }" alt="Event Image" class="responsive-img modal-image">
     </div>
     <div class="col s12 m6 l6">
      <p id="modal-date-time" class="modal-info">
      <i class="material-icons">event</i><b>Date:</b> ${new Date(
        event.date
      ).toDateString()}</p>
      <p id="modal-date-time" class="modal-info">
      <i class="material-icons">timelapse</i><b>Time:</b> ${
        event.timeStart
      } - ${event.timeEnd}</p>
      <p id="modal-location" class="modal-info">
      <i class="material-icons">location_city</i><b>Location:</b> ${
        event.location.address
      }</p>
      <p id="modal-organizer" class="modal-info">
      <i class="material-icons">assignment_ind</i><b>Organizer:</b>${
        event.organizerName
      } - ${event.organizerContact}</p>
      <p id="modal-location" class="modal-info">
      <i class="material-icons">accessibility</i>${
        event.attendees
      } Going to Attend</p>
      <p id="modal-details" class="modal-info">${event.details}</p>
     </div>
    </div>
    `;

  // Open the modal
  const modalInstance = M.Modal.getInstance(modal);
  modalInstance.open();

  const selectedCategories = event.categories;
  document.getElementById("edit-event-name").value = event.name;
  document.getElementById("edit-date").value = event.date.split("T")[0]; // Format the date properly
  document.getElementById("edit-timeStart").value = event.timeStart;
  document.getElementById("edit-timeEnd").value = event.timeEnd;
  document.getElementById("edit-details").value = event.details;
  document.getElementById("edit-organizerName").value = event.organizerName;
  document.getElementById("edit-organizerContact").value =
    event.organizerContact;
  var location = document.getElementById("edit-event-location");
  location.value = event.location.address;
  location.setAttribute("latitude", event.location.latitude);
  location.setAttribute("longitude", event.location.longitude);

  var selectElement = document.getElementById("edit-selectCategory");
  selectElement.value = event.categories;

  Array.from(selectElement.options).forEach((option) => {
    if (selectedCategories.includes(option.value)) {
      option.selected = true;
    } else {
      option.selected = false;
    }
  });

  var editPreview = document.getElementById("edit-imagePreview");

  var editBanner = document.getElementById("edit-event-banner");
  editPreview.src = `data:image/png;base64,${event.banner}`;
  updatedBannerString = event.banner;

  editBanner.addEventListener("change", function () {
    const file = editBanner.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      updatedBannerString = reader.result
        .replace("data:", "")
        .replace(/^.+,/, "");
      editPreview.src = imageDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

//Delete Event
function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event?")) {
    fetch(`/events/${eventId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          M.toast({ html: "Event deleted successfully" });
          setTimeout(() => {
            location.reload();
          }, 1000);
          location.reload();
        } else {
          M.toast({ html: "Failed to delete the event" });
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

//Update Event API Call
function updateEvent(eventId, updatedEvent) {
  fetch(`/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEvent),
  })
    .then((response) => {
      if (response.ok) {
        M.toast({ html: "Event updated successfully" });
      } else {
        M.toast({ html: "Failed to update event" });
      }
      setTimeout(() => {
        location.reload();
      }, 1000);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// Populate Categories into Event Forms
function populateSelect(data, select) {
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
    select.appendChild(option);
  });

  M.FormSelect.init(select);

  var dropdownItems = document.querySelectorAll(".select-dropdown li");
  dropdownItems.forEach(function (item, index) {
    item.setAttribute("tabindex", (index + 1).toString());
  });
}

//RSVP Count Increase
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

//Delete Category
async function deleteCategory(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    try {
      await fetch(`/categories/${id}`, {
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          M.toast({ html: "Category Deleted", classes: "toast" });
          const row = document.getElementById(`category-row-${id}`);
          if (row) {
            row.remove();
          }
        } else {
          M.toast({
            html: "This already associated with Events",
            classes: "toast",
          });
        }
      });
      getCategories();
    } catch (err) {
      console.log(err);
    }
  }
}

//Update Category View Setup
function updateCategory(id) {
  document
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = true));

  const cell = document.getElementById(`category-name-${id}`);
  var categoryValue = cell.textContent;
  oldCategoryValue = categoryValue;

  cell.innerHTML = ` <input type="text" id="edit-category-input-${id}" value="${categoryValue}">
        <button class="btn-small light-blue accent-3 waves-effect waves-light btn" onClick="saveUpdateCategory('${id}')">Save</button>
        <button class="btn-small red waves-effect waves-light btn" onclick="cancelUpdateCategory('${id}','${categoryValue}')">Cancel</button>`;
}

//Category Update Cancel
function cancelUpdateCategory(id, value) {
  document
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = false));
  const cell = document.getElementById(`category-name-${id}`);
  cell.textContent = value;
}

//Save Category Update
async function saveUpdateCategory(id) {
  document
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = false));
  const newValue = document.getElementById(`edit-category-input-${id}`).value;

  const cell = document.getElementById(`category-name-${id}`);
  cell.textContent = newValue;

  try {
    if (existingCategories.includes(newValue.trim())) {
      M.toast({ html: "This Category already exist", classes: "toast" });
      cell.textContent = oldCategoryValue;
      return;
    }else{
      await fetch(`/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          // prettier-ignore
          { "name": newValue }
        ),
      })
      .then((response) => {
        if(response.ok){
          M.toast({ html: "Category Updated" , classes:"toast"});
          getCategories();
        }
      });
    }
  } catch (err) {
    console.log();
  }
}

function showSpinner() {
  document.getElementById("spinner").style.display = "block";
}

function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
}

// Load map
async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  await google.maps.importLibrary("places");

  map = new Map(document.getElementById("map"), {
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4.5,
  });
}

//Setup Location place Autocomplete
async function initMapPlace() {
  //@ts-ignore
  await google.maps.importLibrary("places");
  const location = document.getElementById("event-location");
  //@ts-ignore
  placeAutocomplete = new google.maps.places.Autocomplete(location, {
    componentRestrictions: { country: "au" },
  });

  //@ts-ignore
  placeAutocomplete.addListener("place_changed", function () {
    var place = placeAutocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      console.log("No details available for input: '" + place.name + "'");
      return;
    }

    location.setAttribute("latitude", place.geometry.location.lat());
    location.setAttribute("longitude", place.geometry.location.lng());
  });
}

async function initMapPlaceUpdate() {
  //@ts-ignore
  await google.maps.importLibrary("places");
  const location = document.getElementById("edit-event-location");
  //@ts-ignore
  placeAutocomplete = new google.maps.places.Autocomplete(location, {
    componentRestrictions: { country: "au" },
  });

  //@ts-ignore
  placeAutocomplete.addListener("place_changed", function () {
    var place = placeAutocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      console.log("No details available for input: '" + place.name + "'");
      return;
    }

    location.setAttribute("latitude", place.geometry.location.lat());
    location.setAttribute("longitude", place.geometry.location.lng());
  });
}
