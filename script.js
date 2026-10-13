/* =====================================================
   TRIPMATE - COMPLETE RECTIFIED JAVASCRIPT
   ===================================================== */


/* =====================================================
   HELPER FUNCTIONS
   ===================================================== */

function getArray(key) {
    try {
        const data = localStorage.getItem(key);

        if (!data) return [];

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error("Storage error:", error);
        return [];
    }
}


function getNumber(key) {
    return Number(localStorage.getItem(key)) || 0;
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(dateString) {

    if (!dateString || dateString === "Not Set") {
        return "Not Set";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =====================================================
   CREATE TRIP
   ===================================================== */

function setupCreateTrip() {

    const form = document.getElementById("createTripForm");

    if (!form) return;

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const destination =
            document.getElementById("destination")?.value.trim();

        const startDate =
            document.getElementById("startDate")?.value;

        const endDate =
            document.getElementById("endDate")?.value;

        const budget =
            document.getElementById("budget")?.value;

        const travelType =
            document.getElementById("travelType")?.value;


        if (!destination || !startDate || !endDate || !budget) {

            alert("Please fill all the details.");
            return;
        }


        if (new Date(endDate) < new Date(startDate)) {

            alert("End date cannot be before start date.");
            return;
        }


        localStorage.setItem("tripDestination", destination);
        localStorage.setItem("tripStartDate", startDate);
        localStorage.setItem("tripEndDate", endDate);
        localStorage.setItem("tripBudget", budget);
        localStorage.setItem(
            "tripTravelType",
            travelType || "Solo"
        );


        /* Start fresh for the new trip */

        localStorage.removeItem("expenses");
        localStorage.removeItem("itineraryItems");
        localStorage.removeItem("packingItems");
        localStorage.removeItem("hotelDetails");
        localStorage.removeItem("transportDetails");
        localStorage.removeItem("bookings");
        localStorage.removeItem("preTripTasks");
        localStorage.removeItem("tripNotes");


        alert("🎉 Trip created successfully!");

        window.location.href = "dashboard.html";
    });
}


/* =====================================================
   DASHBOARD
   ===================================================== */

function loadDashboard() {

    const destination =
        localStorage.getItem("tripDestination") || "Not Set";

    const startDate =
        localStorage.getItem("tripStartDate");

    const endDate =
        localStorage.getItem("tripEndDate");

    const travelType =
        localStorage.getItem("tripTravelType") || "Not Set";


    /* Current Trip */

    setText(
        "dashboardDestination",
        destination
    );

    setText(
        "dashboardStartDate",
        formatDate(startDate)
    );

    setText(
        "dashboardEndDate",
        formatDate(endDate)
    );

    setText(
        "dashboardTravelType",
        travelType
    );


    /* Budget */

    updateDashboardBudget();


    /* Countdown */

    updateCountdown();


    /* Dashboard sections */

    updateDashboardActivities();

    updateDashboardPacking();

    updateDashboardHotel();

    updateDashboardTransport();

    updateDashboardBookings();

    updateDashboardPreTrip();


    /* Statistics */

    updateDashboardStatistics();


    /* Progress */

    updateDashboardProgress();


    /* Readiness */

    updateReadinessChecklist();


    /* Notes */

    loadTripNotes();


    /* Expense graph */

    updateExpenseGraph();
}


/* =====================================================
   COUNTDOWN
   ===================================================== */

let countdownTimer = null;


function updateCountdown() {

    const element =
        document.getElementById("tripCountdown");

    if (!element) return;


    const startDate =
        localStorage.getItem("tripStartDate");


    if (!startDate) {

        element.textContent =
            "Create a trip to see the countdown.";

        return;
    }


    const target =
        new Date(
            startDate + "T00:00:00"
        ).getTime();


    function calculate() {

        const difference =
            target - new Date().getTime();


        if (difference <= 0) {

            element.textContent =
                "🎉 Your trip has started!";

            return;
        }


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (difference %
                    (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (difference %
                    (1000 * 60 * 60)) /
                (1000 * 60)
            );


        const seconds =
            Math.floor(
                (difference %
                    (1000 * 60)) /
                1000
            );


        element.textContent =
            `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
    }


    calculate();


    if (countdownTimer) {
        clearInterval(countdownTimer);
    }


    countdownTimer =
        setInterval(calculate, 1000);
}


/* =====================================================
   BUDGET
   ===================================================== */

function calculateBudget() {

    const budget =
        getNumber("tripBudget");


    const expenses =
        getArray("expenses");


    let totalExpense = 0;


    expenses.forEach(function(expense) {

        totalExpense +=
            Number(expense.amount) || 0;

    });


    return {

        budget: budget,

        expense: totalExpense,

        remaining:
            budget - totalExpense
    };
}


function updateDashboardBudget() {

    const result =
        calculateBudget();


    setText(
        "dashboardBudget",
        "₹" +
        result.budget.toLocaleString("en-IN")
    );


    setText(
        "dashboardRemainingBudget",
        "₹" +
        result.remaining.toLocaleString("en-IN")
    );


    /* Trip status */

    const destination =
        localStorage.getItem("tripDestination");

    const startDate =
        localStorage.getItem("tripStartDate");

    const endDate =
        localStorage.getItem("tripEndDate");


    if (!destination) {

        setText(
            "tripStatus",
            "No Trip"
        );

        setText(
            "myTrip",
            "No trip created"
        );

        return;
    }


    setText(
        "myTrip",
        destination
    );


    if (!startDate || !endDate) {

        setText(
            "tripStatus",
            "Planning"
        );

        return;
    }


    const today =
        new Date();

    const start =
        new Date(startDate);

    const end =
        new Date(endDate);


    if (today < start) {

        setText(
            "tripStatus",
            "Upcoming"
        );

    } else if (today >= start && today <= end) {

        setText(
            "tripStatus",
            "Ongoing"
        );

    } else {

        setText(
            "tripStatus",
            "Completed"
        );
    }
}


/* =====================================================
   BUDGET PAGE
   ===================================================== */

function updateBudgetPage() {

    const result =
        calculateBudget();


    setText(
        "budgetAmount",
        "₹" +
        result.budget.toLocaleString("en-IN")
    );


    setText(
        "expenseAmount",
        "₹" +
        result.expense.toLocaleString("en-IN")
    );


    setText(
        "remainingBudget",
        "₹" +
        result.remaining.toLocaleString("en-IN")
    );


    const percentage =
        result.budget > 0
            ? Math.min(
                (result.expense / result.budget) * 100,
                100
            )
            : 0;


    const progress =
        document.getElementById("budgetProgress");


    if (progress) {

        progress.style.width =
            percentage + "%";
    }


    setText(
        "budgetPercentage",
        Math.round(percentage) + "% used"
    );
}


/* =====================================================
   EXPENSES
   ===================================================== */

function setupExpenses() {

    const form =
        document.getElementById("expenseForm");

    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("expenseName")
                ?.value.trim();


        const amount =
            document
                .getElementById("expenseAmountInput")
                ?.value;


        if (!name || !amount) {

            alert(
                "Please enter expense name and amount."
            );

            return;
        }


        const expenses =
            getArray("expenses");


        expenses.push({

            name: name,

            amount: Number(amount)
        });


        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );


        form.reset();


        displayExpenses();

        updateBudgetPage();

        updateDashboardBudget();

        updateDashboardStatistics();

        updateExpenseGraph();
    });
}


function displayExpenses() {

    const list =
        document.getElementById("expenseList");

    if (!list) return;


    const expenses =
        getArray("expenses");


    if (expenses.length === 0) {

        list.innerHTML = `
            <p class="empty-message">
                No expenses added yet.
            </p>
        `;

        return;
    }


    list.innerHTML = "";


    expenses.forEach(function(expense, index) {

        const item =
            document.createElement("div");


        item.className =
            "expense-item";


        item.innerHTML = `

            <span>
                💰 ${escapeHTML(expense.name)}
            </span>

            <span class="amount">
                ₹${Number(expense.amount)
                    .toLocaleString("en-IN")}
            </span>

            <button
                class="delete-btn"
                onclick="deleteExpense(${index})">

                Delete

            </button>
        `;


        list.appendChild(item);
    });
}


function deleteExpense(index) {

    const expenses =
        getArray("expenses");


    expenses.splice(index, 1);


    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    displayExpenses();

    updateBudgetPage();

    updateDashboardBudget();

    updateDashboardStatistics();

    updateExpenseGraph();
}


/* =====================================================
   EXPENSE GRAPH
   ===================================================== */

let expenseChart = null;


function updateExpenseGraph() {

    const canvas =
        document.getElementById("expenseChart");


    if (!canvas) return;

    if (typeof Chart === "undefined") return;


    const expenses =
        getArray("expenses");


    if (expenseChart) {

        expenseChart.destroy();

        expenseChart = null;
    }


    if (expenses.length === 0) {
        return;
    }


    const labels =
        expenses.map(function(expense) {

            return expense.name;
        });


    const amounts =
        expenses.map(function(expense) {

            return Number(expense.amount) || 0;
        });


    expenseChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{

                    label:
                        "Expense Amount (₹)",

                    data: amounts,

                    borderWidth: 1
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return "₹" +
                                        Number(value)
                                            .toLocaleString(
                                                "en-IN"
                                            );
                                }
                        }
                    }
                }
            }
        });
}


/* =====================================================
   ITINERARY
   ===================================================== */

function setupItinerary() {

    const form =
        document.getElementById("itineraryForm");

    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const day =
            document
                .getElementById("day")
                ?.value.trim();


        const activity =
            document
                .getElementById("activity")
                ?.value.trim();


        const time =
            document
                .getElementById("activityTime")
                ?.value;


        if (!day || !activity) {

            alert(
                "Please enter day and activity."
            );

            return;
        }


        const items =
            getArray("itineraryItems");


        items.push({

            day: day,

            activity: activity,

            time: time || ""
        });


        localStorage.setItem(
            "itineraryItems",
            JSON.stringify(items)
        );


        form.reset();


        displayItinerary();

        updateDashboardActivities();

        updateDashboardStatistics();

        updateDashboardProgress();

        updateReadinessChecklist();
    });
}


function displayItinerary() {

    const list =
        document.getElementById("itineraryList");

    if (!list) return;


    const items =
        getArray("itineraryItems");


    if (items.length === 0) {

        list.innerHTML = `
            <p class="empty-message">
                No itinerary activities added yet.
            </p>
        `;

        return;
    }


    list.innerHTML = "";


    items.forEach(function(item, index) {

        const div =
            document.createElement("div");


        div.className =
            "expense-item";


        div.innerHTML = `

            <span>

                📅 <strong>
                    ${escapeHTML(item.day)}
                </strong>

                -
                ${escapeHTML(item.activity)}

            </span>

            <span>

                ⏰
                ${escapeHTML(
                    item.time || "No time"
                )}

            </span>

            <button
                class="delete-btn"
                onclick="deleteActivity(${index})">

                Delete

            </button>
        `;


        list.appendChild(div);
    });
}


function deleteActivity(index) {

    const items =
        getArray("itineraryItems");


    items.splice(index, 1);


    localStorage.setItem(
        "itineraryItems",
        JSON.stringify(items)
    );


    displayItinerary();

    updateDashboardActivities();

    updateDashboardStatistics();

    updateDashboardProgress();

    updateReadinessChecklist();
}


/* =====================================================
   DASHBOARD ITINERARY
   ===================================================== */

function updateDashboardActivities() {

    const container =
        document.getElementById(
            "dashboardActivities"
        );


    if (!container) return;


    const items =
        getArray("itineraryItems");


    if (items.length === 0) {

        container.innerHTML =
            "<p>0 activities planned</p>";

        return;
    }


    container.innerHTML = `

        <p>
            <strong>
                ${items.length}
            </strong>
            activities planned
        </p>

    `;
}


/* =====================================================
   PACKING
   ===================================================== */

function setupPacking() {

    const form =
        document.getElementById("packingForm");

    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const input =
            document.getElementById("packingItem");


        if (!input) return;


        const name =
            input.value.trim();


        if (!name) {

            alert(
                "Please enter a packing item."
            );

            return;
        }


        const items =
            getArray("packingItems");


        items.push({

            name: name,

            completed: false
        });


        localStorage.setItem(
            "packingItems",
            JSON.stringify(items)
        );


        form.reset();


        displayPacking();

        updateDashboardPacking();

        updateDashboardStatistics();

        updateDashboardProgress();

        updateReadinessChecklist();
    });
}


function displayPacking() {

    const list =
        document.getElementById(
            "packingList"
        );


    if (!list) return;


    const items =
        getArray("packingItems");


    if (items.length === 0) {

        list.innerHTML = `
            <p class="empty-message">
                No packing items added yet.
            </p>
        `;

        updatePackingSummary();

        return;
    }


    list.innerHTML = "";


    items.forEach(function(item, index) {

        const div =
            document.createElement("div");


        div.className =
            "expense-item";


        div.innerHTML = `

            <span>

                <input
                    type="checkbox"
                    ${item.completed ? "checked" : ""}
                    onchange="togglePacking(${index})"
                >

                ${escapeHTML(item.name)}

            </span>


            <button
                class="delete-btn"
                onclick="deletePacking(${index})">

                Delete

            </button>
        `;


        list.appendChild(div);
    });


    updatePackingSummary();
}


function updatePackingSummary() {

    const items =
        getArray("packingItems");


    const total =
        items.length;


    const packed =
        items.filter(function(item) {

            return item.completed;

        }).length;


    const remaining =
        total - packed;


    setText(
        "totalPackingItems",
        total
    );


    setText(
        "packedItems",
        packed
    );


    setText(
        "remainingItems",
        remaining
    );


    const percentage =
        total > 0
            ? Math.round(
                (packed / total) * 100
            )
            : 0;


    const progress =
        document.getElementById(
            "packingProgress"
        );


    if (progress) {

        progress.style.width =
            percentage + "%";
    }
}


function togglePacking(index) {

    const items =
        getArray("packingItems");


    if (!items[index]) return;


    items[index].completed =
        !items[index].completed;


    localStorage.setItem(
        "packingItems",
        JSON.stringify(items)
    );


    displayPacking();

    updateDashboardPacking();

    updateDashboardStatistics();

    updateDashboardProgress();

    updateReadinessChecklist();
}


function deletePacking(index) {

    const items =
        getArray("packingItems");


    items.splice(index, 1);


    localStorage.setItem(
        "packingItems",
        JSON.stringify(items)
    );


    displayPacking();

    updateDashboardPacking();

    updateDashboardStatistics();

    updateDashboardProgress();

    updateReadinessChecklist();
}


/* =====================================================
   DASHBOARD PACKING
   ===================================================== */

function updateDashboardPacking() {

    const container =
        document.getElementById(
            "dashboardPacking"
        );


    if (!container) return;


    const items =
        getArray("packingItems");


    if (items.length === 0) {

        container.innerHTML =
            "<p>No packing items added yet.</p>";

        return;
    }


    const packed =
        items.filter(function(item) {

            return item.completed;

        }).length;


    container.innerHTML = `

        <p>

            <strong>
                ${packed}
            </strong>
            of
            <strong>
                ${items.length}
            </strong>
            items packed

        </p>

    `;
}


/* =====================================================
   HOTEL
   ===================================================== */

function setupHotel() {

    const form =
        document.getElementById("hotelForm");

    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();

        saveHotel();
    });


    displayHotel();
}


function saveHotel() {

    const hotelName =
        document
            .getElementById("hotelName")
            ?.value.trim();


    const hotelAddress =
        document
            .getElementById("hotelAddress")
            ?.value.trim();


    const checkIn =
        document
            .getElementById("checkIn")
            ?.value;


    const checkOut =
        document
            .getElementById("checkOut")
            ?.value;


    const bookingReference =
        document
            .getElementById("bookingReference")
            ?.value.trim();


    if (!hotelName) {

        alert(
            "Please enter hotel name."
        );

        return;
    }


    const details = {

        hotelName: hotelName,

        hotelAddress:
            hotelAddress || "",

        checkIn:
            checkIn || "",

        checkOut:
            checkOut || "",

        bookingReference:
            bookingReference || ""
    };


    localStorage.setItem(
        "hotelDetails",
        JSON.stringify(details)
    );


    const form =
        document.getElementById("hotelForm");


    if (form) form.reset();


    alert(
        "🏨 Hotel details saved successfully!"
    );


    displayHotel();

    updateDashboardHotel();

    updateReadinessChecklist();
}


function displayHotel() {

    const container =
        document.getElementById(
            "hotelDetails"
        );


    if (!container) return;


    const saved =
        localStorage.getItem(
            "hotelDetails"
        );


    if (!saved) {

        container.innerHTML = `
            <p class="empty-message">
                No hotel details saved.
            </p>
        `;

        return;
    }


    let details;


    try {

        details =
            JSON.parse(saved);

    } catch (error) {

        container.innerHTML =
            "<p>Unable to load hotel details.</p>";

        return;
    }


    container.innerHTML = `

        <div class="card">

            <h2>
                🏨
                ${escapeHTML(details.hotelName)}
            </h2>

            <p>
                📍
                ${escapeHTML(
                    details.hotelAddress
                )}
            </p>

            <p>
                📅 Check-in:
                ${formatDate(details.checkIn)}
            </p>

            <p>
                📅 Check-out:
                ${formatDate(details.checkOut)}
            </p>

            <p>
                🎫 Reference:
                ${escapeHTML(
                    details.bookingReference
                )}
            </p>

            <br>

            <button
                class="delete-btn"
                onclick="deleteHotel()">

                Delete

            </button>

        </div>
    `;
}


function updateDashboardHotel() {

    const container =
        document.getElementById(
            "dashboardHotel"
        );


    if (!container) return;


    const saved =
        localStorage.getItem(
            "hotelDetails"
        );


    if (!saved) {

        container.innerHTML =
            "<p>No hotel added yet.</p>";

        return;
    }


    let details;


    try {

        details =
            JSON.parse(saved);

    } catch (error) {

        container.innerHTML =
            "<p>Unable to load hotel.</p>";

        return;
    }


    container.innerHTML = `

        <p>
            🏨
            <strong>
                ${escapeHTML(details.hotelName)}
            </strong>
        </p>

        <p>
            📅
            ${formatDate(details.checkIn)}
            -
            ${formatDate(details.checkOut)}
        </p>

    `;
}


function deleteHotel() {

    localStorage.removeItem(
        "hotelDetails"
    );


    displayHotel();

    updateDashboardHotel();

    updateReadinessChecklist();
}


/* =====================================================
   TRANSPORT
   ===================================================== */

function setupTransport() {

    const form =
        document.getElementById(
            "transportForm"
        );


    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();

        saveTransport();
    });


    displayTransport();
}


function saveTransport() {

    const transportType =
        document
            .getElementById("transportType")
            ?.value;


    const departureLocation =
        document
            .getElementById("departureLocation")
            ?.value.trim();


    const arrivalLocation =
        document
            .getElementById("arrivalLocation")
            ?.value.trim();


    const departureDate =
        document
            .getElementById("departureDate")
            ?.value;


    const departureTime =
        document
            .getElementById("departureTime")
            ?.value;


    const arrivalDate =
        document
            .getElementById("arrivalDate")
            ?.value;


    const arrivalTime =
        document
            .getElementById("arrivalTime")
            ?.value;


    const ticketReference =
        document
            .getElementById("ticketReference")
            ?.value.trim();


    if (!departureLocation ||
        !arrivalLocation) {

        alert(
            "Please enter departure and arrival locations."
        );

        return;
    }


    const details = {

        transportType:
            transportType || "Transport",

        departureLocation:
            departureLocation,

        arrivalLocation:
            arrivalLocation,

        departureDate:
            departureDate || "",

        departureTime:
            departureTime || "",

        arrivalDate:
            arrivalDate || "",

        arrivalTime:
            arrivalTime || "",

        ticketReference:
            ticketReference || ""
    };


    localStorage.setItem(
        "transportDetails",
        JSON.stringify(details)
    );


    const form =
        document.getElementById(
            "transportForm"
        );


    if (form) form.reset();


    alert(
        "🚆 Transport details saved successfully!"
    );


    displayTransport();

    updateDashboardTransport();
}


function displayTransport() {

    const container =
        document.getElementById(
            "transportDetails"
        );


    if (!container) return;


    const saved =
        localStorage.getItem(
            "transportDetails"
        );


    if (!saved) {

        container.innerHTML = `
            <p class="empty-message">
                No transport details saved.
            </p>
        `;

        return;
    }


    let details;


    try {

        details =
            JSON.parse(saved);

    } catch (error) {

        container.innerHTML =
            "<p>Unable to load transport details.</p>";

        return;
    }


    container.innerHTML = `

        <div class="card">

            <h2>
                🚆
                ${escapeHTML(
                    details.transportType
                )}
            </h2>

            <p>

                📍
                ${escapeHTML(
                    details.departureLocation
                )}

                →

                ${escapeHTML(
                    details.arrivalLocation
                )}

            </p>

            <p>

                📅 Departure:
                ${formatDate(
                    details.departureDate
                )}

                ${escapeHTML(
                    details.departureTime
                )}

            </p>

            <p>

                📅 Arrival:
                ${formatDate(
                    details.arrivalDate
                )}

                ${escapeHTML(
                    details.arrivalTime
                )}

            </p>

            <p>

                🎫 Reference:
                ${escapeHTML(
                    details.ticketReference
                )}

            </p>

            <br>

            <button
                class="delete-btn"
                onclick="deleteTransport()">

                Delete

            </button>

        </div>
    `;
}


function updateDashboardTransport() {

    const container =
        document.getElementById(
            "dashboardTransport"
        );


    if (!container) return;


    const saved =
        localStorage.getItem(
            "transportDetails"
        );


    if (!saved) {

        container.innerHTML =
            "<p>No transport details added yet.</p>";

        return;
    }


    let details;


    try {

        details =
            JSON.parse(saved);

    } catch (error) {

        container.innerHTML =
            "<p>Unable to load transport.</p>";

        return;
    }


    container.innerHTML = `

        <p>

            🚆
            <strong>
                ${escapeHTML(
                    details.transportType
                )}
            </strong>

        </p>

        <p>

            📍
            ${escapeHTML(
                details.departureLocation
            )}

            →

            ${escapeHTML(
                details.arrivalLocation
            )}

        </p>
    `;
}


function deleteTransport() {

    localStorage.removeItem(
        "transportDetails"
    );


    displayTransport();

    updateDashboardTransport();
}


/* =====================================================
   BOOKINGS
   ===================================================== */

function getBookings() {

    return getArray("bookings");
}


function setupBookings() {

    const form =
        document.getElementById(
            "bookingForm"
        );


    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();

        saveBooking();
    });


    displayBookings();
}


function saveBooking() {

    const bookingType =
        document
            .getElementById("bookingType")
            ?.value;


    const bookingName =
        document
            .getElementById("bookingName")
            ?.value.trim();


    const bookingDate =
        document
            .getElementById("bookingDate")
            ?.value;


    const bookingReference =
        document
            .getElementById("bookingReference")
            ?.value.trim();


    const bookingStatus =
        document
            .getElementById("bookingStatus")
            ?.value;


    if (!bookingName) {

        alert(
            "Please enter booking details."
        );

        return;
    }


    const bookings =
        getBookings();


    bookings.push({

        type:
            bookingType || "Other",

        name:
            bookingName,

        date:
            bookingDate || "",

        reference:
            bookingReference || "",

        status:
            bookingStatus || "Pending"
    });


    localStorage.setItem(
        "bookings",
        JSON.stringify(bookings)
    );


    const form =
        document.getElementById(
            "bookingForm"
        );


    if (form) form.reset();


    alert(
        "🎫 Booking saved successfully!"
    );


    displayBookings();

    updateDashboardBookings();

    updateDashboardStatistics();
}


function displayBookings() {

    const list =
        document.getElementById(
            "bookingList"
        );


    if (!list) return;


    const bookings =
        getBookings();


    if (bookings.length === 0) {

        list.innerHTML = `
            <p class="empty-message">
                No bookings added yet.
            </p>
        `;

        return;
    }


    list.innerHTML = "";


    bookings.forEach(function(
        booking,
        index
    ) {

        const div =
            document.createElement("div");


        div.className =
            "card";


        div.innerHTML = `

            <h3>

                🎫
                ${escapeHTML(
                    booking.name
                )}

            </h3>

            <p>

                Type:
                ${escapeHTML(
                    booking.type
                )}

            </p>

            <p>

                Date:
                ${formatDate(
                    booking.date
                )}

            </p>

            <p>

                Reference:
                ${escapeHTML(
                    booking.reference
                )}

            </p>

            <p>

                Status:
                ${escapeHTML(
                    booking.status ||
                    "Pending"
                )}

            </p>

            <br>

            <button
                class="delete-btn"
                onclick="deleteBooking(${index})">

                Delete

            </button>
        `;


        list.appendChild(div);
    });
}


function updateDashboardBookings() {

    const container =
        document.getElementById(
            "dashboardBookings"
        );


    if (!container) return;


    const bookings =
        getBookings();


    if (bookings.length === 0) {

        container.innerHTML =
            "<p>No bookings added yet.</p>";

        return;
    }


    container.innerHTML = `

        <p>

            🎫
            <strong>
                ${bookings.length}
            </strong>
            booking(s) added

        </p>
    `;
}


function deleteBooking(index) {

    const bookings =
        getBookings();


    bookings.splice(index, 1);


    localStorage.setItem(
        "bookings",
        JSON.stringify(bookings)
    );


    displayBookings();

    updateDashboardBookings();

    updateDashboardStatistics();
}


/* =====================================================
   PRE-TRIP
   ===================================================== */

function getPreTripTasks() {

    return getArray("preTripTasks");
}


function setupPreTrip() {

    const form =
        document.getElementById(
            "preTripForm"
        );


    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();

        savePreTripTask();
    });


    displayPreTripTasks();
}


function savePreTripTask() {

    const input =
        document.getElementById(
            "preTripTask"
        );


    if (!input) return;


    const task =
        input.value.trim();


    if (!task) {

        alert(
            "Please enter a task."
        );

        return;
    }


    const tasks =
        getPreTripTasks();


    tasks.push({

        task: task,

        completed: false
    });


    localStorage.setItem(
        "preTripTasks",
        JSON.stringify(tasks)
    );


    input.value = "";


    displayPreTripTasks();

    updateDashboardPreTrip();

    updateDashboardProgress();

    updateReadinessChecklist();
}


function displayPreTripTasks() {

    const list =
        document.getElementById(
            "preTripList"
        );


    if (!list) return;


    const tasks =
        getPreTripTasks();


    if (tasks.length === 0) {

        list.innerHTML = `
            <p class="empty-message">
                No pre-trip tasks added yet.
            </p>
        `;

        updatePreTripProgress();

        return;
    }


    list.innerHTML = "";


    tasks.forEach(function(
        item,
        index
    ) {

        const div =
            document.createElement("div");


        div.className =
            "expense-item";


        div.innerHTML = `

            <span>

                <input
                    type="checkbox"
                    ${item.completed ? "checked" : ""}
                    onchange="togglePreTripTask(${index})"
                >

                ${escapeHTML(item.task)}

            </span>

            <button
                class="delete-btn"
                onclick="deletePreTripTask(${index})">

                Delete

            </button>
        `;


        list.appendChild(div);
    });


    updatePreTripProgress();
}


function togglePreTripTask(index) {

    const tasks =
        getPreTripTasks();


    if (!tasks[index]) return;


    tasks[index].completed =
        !tasks[index].completed;


    localStorage.setItem(
        "preTripTasks",
        JSON.stringify(tasks)
    );


    displayPreTripTasks();

    updateDashboardPreTrip();

    updateDashboardProgress();

    updateReadinessChecklist();
}


function deletePreTripTask(index) {

    const tasks =
        getPreTripTasks();


    tasks.splice(index, 1);


    localStorage.setItem(
        "preTripTasks",
        JSON.stringify(tasks)
    );


    displayPreTripTasks();

    updateDashboardPreTrip();

    updateDashboardProgress();

    updateReadinessChecklist();
}


function updatePreTripProgress() {

    const tasks =
        getPreTripTasks();


    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    const percentage =
        tasks.length > 0
            ? Math.round(
                (completed / tasks.length) * 100
            )
            : 0;


    const bar =
        document.getElementById(
            "preTripProgress"
        );


    if (bar) {

        bar.style.width =
            percentage + "%";
    }


    setText(
        "preTripPercentage",
        percentage + "%"
    );
}


/* =====================================================
   DASHBOARD PRE-TRIP
   ===================================================== */

function updateDashboardPreTrip() {

    const container =
        document.getElementById(
            "dashboardPreTrip"
        );


    if (!container) return;


    const tasks =
        getPreTripTasks();


    if (tasks.length === 0) {

        container.innerHTML =
            "<p>No pre-trip tasks added yet.</p>";

        return;
    }


    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    container.innerHTML = `

        <p>

            ✅
            <strong>
                ${completed}
            </strong>
            of
            <strong>
                ${tasks.length}
            </strong>
            tasks completed

        </p>
    `;
}


/* =====================================================
   DASHBOARD STATISTICS
   ===================================================== */

function updateDashboardStatistics() {

    const itinerary =
        getArray("itineraryItems");


    const expenses =
        getArray("expenses");


    const packing =
        getArray("packingItems");


    const budget =
        calculateBudget();


    /* Activities */

    setText(
        "statActivities",
        itinerary.length
    );


    /* Expenses */

    setText(
        "statExpenses",
        "₹" +
        budget.expense.toLocaleString("en-IN")
    );


    /* Packing percentage */

    const packed =
        packing.filter(function(item) {

            return item.completed;

        }).length;


    const packingPercentage =
        packing.length > 0
            ? Math.round(
                (packed / packing.length) * 100
            )
            : 0;


    setText(
        "statPacking",
        packingPercentage + "%"
    );


    /* Budget percentage */

    const budgetPercentage =
        budget.budget > 0
            ? Math.round(
                (budget.expense /
                    budget.budget) * 100
            )
            : 0;


    setText(
        "statBudget",
        budgetPercentage + "%"
    );
}


/* =====================================================
   DASHBOARD PROGRESS
   ===================================================== */

function updateDashboardProgress() {

    const itinerary =
        getArray("itineraryItems");


    const packing =
        getArray("packingItems");


    const preTrip =
        getArray("preTripTasks");


    const hasTrip =
        !!localStorage.getItem(
            "tripDestination"
        );


    let completed = 0;

    let total = 0;


    /* Trip details */

    if (hasTrip) {
        completed++;
    }

    total++;


    /* Itinerary */

    if (itinerary.length > 0) {
        completed++;
    }

    total++;


    /* Budget */

    if (getNumber("tripBudget") > 0) {
        completed++;
    }

    total++;


    /* Packing */

    if (packing.length > 0) {

        completed++;
    }

    total++;


    const percentage =
        Math.round(
            (completed / total) * 100
        );


    const progressBar =
        document.getElementById(
            "tripProgressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            percentage + "%";
    }


    setText(
        "tripProgressText",
        percentage + "%"
    );


    let message =
        "Start planning your trip! ✈️";


    if (percentage === 100) {

        message =
            "🎉 Your trip planning is complete!";

    } else if (percentage >= 75) {

        message =
            "🔥 Almost ready for your trip!";

    } else if (percentage >= 50) {

        message =
            "👍 Good progress! Keep planning.";

    } else if (percentage > 0) {

        message =
            "📝 Keep adding your trip details.";
    }


    setText(
        "tripProgressMessage",
        message
    );
}


/* =====================================================
   READINESS CHECKLIST
   ===================================================== */

function updateReadinessChecklist() {

    /* -------------------------
       Trip Details
       ------------------------- */

    const destination =
        localStorage.getItem(
            "tripDestination"
        );


    const startDate =
        localStorage.getItem(
            "tripStartDate"
        );


    const endDate =
        localStorage.getItem(
            "tripEndDate"
        );


    const tripReady =
        destination &&
        startDate &&
        endDate;


    setText(
        "readinessDetails",
        tripReady
            ? "✅ Completed"
            : "⏳ Pending"
    );


    /* -------------------------
       Itinerary
       ------------------------- */

    const itinerary =
        getArray("itineraryItems");


    setText(
        "readinessItinerary",
        itinerary.length > 0
            ? "✅ Completed"
            : "⏳ Pending"
    );


    /* -------------------------
       Budget
       ------------------------- */

    const budget =
        getNumber("tripBudget");


    setText(
        "readinessBudget",
        budget > 0
            ? "✅ Completed"
            : "⏳ Pending"
    );


    /* -------------------------
       Packing
       ------------------------- */

    const packing =
        getArray("packingItems");


    setText(
        "readinessPacking",
        packing.length > 0
            ? "✅ Completed"
            : "⏳ Pending"
    );
}


/* =====================================================
   NOTES
   ===================================================== */

function loadTripNotes() {

    const notes =
        localStorage.getItem(
            "tripNotes"
        ) || "";


    const textarea =
        document.getElementById(
            "tripNotes"
        );


    if (textarea) {

        textarea.value =
            notes;
    }


    setText(
        "notesStatus",
        notes
            ? "📝 Notes saved"
            : ""
    );
}


function saveTripNotes() {

    const textarea =
        document.getElementById(
            "tripNotes"
        );


    if (!textarea) return;


    localStorage.setItem(
        "tripNotes",
        textarea.value
    );


    setText(
        "notesStatus",
        "✅ Notes saved successfully!"
    );
}


/* =====================================================
   MY TRIPS
   ===================================================== */

function displayMyTrips() {

    const list =
        document.getElementById(
            "myTripsList"
        );


    if (!list) return;


    const destination =
        localStorage.getItem(
            "tripDestination"
        );


    const startDate =
        localStorage.getItem(
            "tripStartDate"
        );


    const endDate =
        localStorage.getItem(
            "tripEndDate"
        );


    const budget =
        localStorage.getItem(
            "tripBudget"
        );


    const travelType =
        localStorage.getItem(
            "tripTravelType"
        );


    if (!destination) {

        list.innerHTML = `
            <p class="empty-message">
                No trips created yet.
            </p>
        `;

        return;
    }


    list.innerHTML = `

        <div class="card">

            <h2>
                ✈️
                ${escapeHTML(destination)}
            </h2>

            <p>

                📅
                ${formatDate(startDate)}
                -
                ${formatDate(endDate)}

            </p>

            <p>

                💰 Budget:
                ₹${Number(budget || 0)
                    .toLocaleString("en-IN")}

            </p>

            <p>

                🧳 Travel Type:
                ${escapeHTML(
                    travelType || "Solo"
                )}

            </p>

            <br>

            <a
                href="dashboard.html"
                class="primary-button">

                View Trip

            </a>

        </div>
    `;
}


/* =====================================================
   CLEAR TRIP
   ===================================================== */

function clearTrip() {

    const confirmation =
        confirm(
            "Are you sure you want to clear all trip data?"
        );


    if (!confirmation) return;


    const keys = [

        "tripDestination",
        "tripStartDate",
        "tripEndDate",
        "tripBudget",
        "tripTravelType",
        "expenses",
        "itineraryItems",
        "packingItems",
        "hotelDetails",
        "transportDetails",
        "bookings",
        "preTripTasks",
        "tripNotes"
    ];


    keys.forEach(function(key) {

        localStorage.removeItem(key);
    });


    alert(
        "🗑️ All trip data has been cleared."
    );


    location.reload();
}


/* =====================================================
   START EVERYTHING
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupCreateTrip();

        loadDashboard();


        /* Budget */

        setupExpenses();

        displayExpenses();

        updateBudgetPage();

        updateDashboardBudget();


        /* Itinerary */

        setupItinerary();

        displayItinerary();

        updateDashboardActivities();


        /* Packing */

        setupPacking();

        displayPacking();

        updateDashboardPacking();


        /* Hotel */

        setupHotel();

        displayHotel();

        updateDashboardHotel();


        /* Transport */

        setupTransport();

        displayTransport();

        updateDashboardTransport();


        /* Bookings */

        setupBookings();

        displayBookings();

        updateDashboardBookings();


        /* Pre-trip */

        setupPreTrip();

        displayPreTripTasks();

        updateDashboardPreTrip();


        /* Dashboard */

        updateDashboardStatistics();

        updateDashboardProgress();

        updateReadinessChecklist();

        loadTripNotes();


        /* My Trips */

        displayMyTrips();


        /* Graph */

        updateExpenseGraph();

    }
);