document.addEventListener("DOMContentLoaded", function () {
  getEvents()
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

  let categories = [];
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
  });

  //Event Banner Image Preview
  banner.addEventListener("change", function () {
    const file = banner.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      bannerBase64String = reader.result.replace("data:", "")
      .replace(/^.+,/, "");;
      const imagePreview = document.getElementById("imagePreview");
      imagePreview.src = imageDataUrl;
    };

    reader.readAsDataURL(file);
  });

  //Submit Event Form
  eventAddForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const data = {
      "name": document.getElementById("event-name").value,
      "details": document.getElementById("details").value,
      "date": new Date(document.getElementById("date").value),
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
      })

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
        const categoryList = document.getElementById("categoryList");
        categoryList.innerHTML = "";

        const table = document.createElement("table");
        const tbody = document.createElement("tbody");

        populateSelect(categories);

        categories.forEach((category) => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${category.name}</td>
            <td>
                <button class="btn-small btn-floating light-blue accent-3" onclick="editData()">
                  <i class="material-icons">edit</i>
                </button>
            </td>
            <td>
                <button class="btn-small red btn-floating" onclick="deleteCategory('${category._id}')">
                  <i class="material-icons">delete</i>
                </button>
            </td>
          `;

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        categoryList.appendChild(table);
      });
  } catch {
    console.error("Failed to fetch categories:", error);
  }
}

//GET Events
async function getEvents() {
  try {
    await fetch("/events")
      .then((response) => response.json())
      .then((events) => {
        const cardContainer = document.getElementById("event-container");

        events.forEach((event) => {
          const card = document.createElement("div");
          card.classList.add("card");

          card.innerHTML = `
            <div class="card-image">
              <img src="data:image/png;base64,${event.banner}" alt="Event Image">
              <span class="card-title">
                ${new Date(event.date).toDateString()} <br/> ${event.timeStart} - ${event.timeEnd}
              </span>
            </div>
            <div class="card-content">
              <span class="card-title">${event.name}</span>
              <p>${event.details}</p>
            </div>
            <div class="card-action">
              <div class="row">
                <div class="col s6">${event.name}</div>
                <div class="col s6">
                  <button class="waves-light btn" id="rsvp-btn-${event._id}" 
                      onclick="updateRSVP('${event._id}',${event.attendees})">RSVP</button>
                  <span id="attendees-count-${event._id}">${event.attendees} Going</span>
                </div>
              </div>
          </div>
        `;
        cardContainer.appendChild(card); 
                    
        });
      });
  } catch (e) {
    console.log(e);
  }
}


function updateRSVP(id){
  const attendeesCount = document.getElementById(`attendees-count-${id}`);
  let count = attendeesCount.textContent.split(' ')[0];
  let value = parseInt(count);
  attendeesCount.textContent = `${value+1} Going`;

  try{
    fetch(`/events/rsvp/${id}`,{
      method: 'PATCH'
    })
  }catch(err){
    attendeesCount.textContent = `${value} Going`;
  }
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

