/* ================= CẤU HÌNH CHUNG ================= */
const API_URL = "http://localhost:3000/api/admin";
const token = localStorage.getItem('token');

// Kiểm tra quyền Admin
if (!token || localStorage.getItem('role') != 1) {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "/public/auth/login.html";
}

// Hàm fetch có xác thực
async function fetchWithAuth(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
    };
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
}

const ALL_CITIES = [
    "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế", 
    "Nha Trang", "Đà Lạt", "Phú Quốc", "Vũng Tàu", "Quy Nhơn", "Hội An", 
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
    "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", 
    "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", 
    "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", 
    "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", 
    "Lâm Đồng", "Lạng Sơn", "Long An", "Nam Định", "Nghệ An", "Ninh Thuận", 
    "Phú Thọ", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", 
    "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", 
    "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", 
    "Vĩnh Phúc", "Yên Bái"
];

function initCitySuggestions() {
    const dataList = document.getElementById('city-list');
    if (!dataList) return; // Tránh lỗi nếu không tìm thấy

    dataList.innerHTML = ''; // Xóa cũ nếu có

    ALL_CITIES.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        dataList.appendChild(option);
    });
}


/* ================= QUẢN LÝ TAB & UI ================= */
document.addEventListener("DOMContentLoaded", () => {
    loadAccounts(); // Mặc định load tab đầu tiên
    initCitySuggestions(); // Khởi tạo gợi ý thành phố

    const toggleBtn = document.getElementById("menu-toggle");
    
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            // Toggle class 'hide-menu' cho thẻ body
            document.body.classList.toggle("hide-menu");
        });
    }

    // Xử lý chuyển tab
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            // Đổi active menu
            document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Đổi section hiển thị
            document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active-section"));
            const targetId = item.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active-section");
            
            // Đổi tiêu đề và load dữ liệu
            document.getElementById("section-title").innerText = item.querySelector("a").innerText.trim();
            if (targetId === 'section-accounts') loadAccounts();
            if (targetId === 'section-rooms') loadRooms();
            if (targetId === 'section-categories') loadCategories();
            if (targetId === 'section-bookings') loadBookings();
        });
    });

    // Đăng xuất
    document.getElementById("logout-btn").onclick = () => {
        localStorage.clear();
        window.location.href = "/public/auth/login.html";
    };
});

/* ================= 1. MODULE TÀI KHOẢN ================= */
async function loadAccounts() {
    try {
        const res = await fetchWithAuth("/users");
        const users = await res.json();
        const tbody = document.getElementById("account-table-body");
        tbody.innerHTML = "";

        users.forEach(user => {
            const roleName = user.RoleID === 1 ? 'Admin' : 'Khách';
            const date = new Date(user.CreatedAt).toLocaleDateString('vi-VN');
            tbody.innerHTML += `
                <tr>
                    <td>${user.AccountID}</td>
                    <td>${user.Username}</td>
                    <td>${user.Email}</td>
                    <td>${roleName}</td>
                    <td>${date}</td>
                    <td>
                        <button onclick="openEditAccount(${user.AccountID}, '${user.Username}', '${user.Email}', ${user.RoleID})" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAccount(${user.AccountID})" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
}

// Mở Modal Thêm User
document.getElementById("btn-add-account").onclick = () => {
    document.getElementById("account-form").reset();
    document.getElementById("acc-id").value = ""; // Xóa ID => Chế độ Thêm
    document.getElementById("acc-username").readOnly = false;
    document.querySelector("#modal-account h3").innerText = "Thêm Tài khoản mới";
    document.getElementById("modal-account").style.display = "flex";
};

// Mở Modal Sửa User
function openEditAccount(id, user, email, role) {
    document.getElementById("acc-id").value = id; // Có ID => Chế độ Sửa
    document.getElementById("acc-username").value = user;
    document.getElementById("acc-username").readOnly = true; // Cấm sửa username
    document.getElementById("acc-email").value = email;
    document.getElementById("acc-role").value = role;
    document.getElementById("acc-password").value = ""; 

    document.querySelector("#modal-account h3").innerText = "Cập nhật Tài khoản";
    document.getElementById("modal-account").style.display = "flex";
}

// Xử lý Submit Form User (Thêm hoặc Sửa)
document.getElementById("account-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("acc-id").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/users/${id}` : "/users";
    
    const data = {
        username: document.getElementById("acc-username").value,
        email: document.getElementById("acc-email").value,
        role: document.getElementById("acc-role").value,
        password: document.getElementById("acc-password").value
    };

    const res = await fetchWithAuth(url, { method: method, body: JSON.stringify(data) });
    if (res.ok) {
        alert("Thành công!");
        document.getElementById("modal-account").style.display = "none";
        loadAccounts();
    } else {
        alert("Có lỗi xảy ra!");
    }
};

async function deleteAccount(id) {
    if(confirm("Xóa tài khoản này?")) {
        const res = await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
        if(res.ok) { alert("Đã xóa!"); loadAccounts(); }
        else { alert("Lỗi xóa!"); }
    }
}

/* ================= 2. MODULE DANH MỤC ================= */
async function loadCategories() {
    try {
        const res = await fetchWithAuth("/categories");
        const cats = await res.json();
        const tbody = document.getElementById("category-table-body");
        tbody.innerHTML = "";
        cats.forEach(cat => {
            // Chú ý: Dùng dấu nháy đơn trong chuỗi tham số để tránh lỗi
            const desc = cat.Description ? cat.Description.replace(/'/g, "\\'") : ""; 
            tbody.innerHTML += `
                <tr>
                    <td>${cat.CategoryID}</td>
                    <td>${cat.CategoryName}</td>
                    <td>${cat.Description || ''}</td>
                    <td>
                        <button onclick="openEditCategory(${cat.CategoryID}, '${cat.CategoryName}', '${desc}')" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCategory(${cat.CategoryID})" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
}

document.getElementById("btn-add-category").onclick = () => {
    document.getElementById("category-form").reset();
    document.getElementById("cat-id").value = "";
    document.querySelector("#modal-category h3").innerText = "Thêm Danh mục mới";
    document.getElementById("modal-category").style.display = "flex";
};

function openEditCategory(id, name, desc) {
    document.getElementById("cat-id").value = id;
    document.getElementById("cat-name").value = name;
    document.getElementById("cat-desc").value = desc;
    document.querySelector("#modal-category h3").innerText = "Cập nhật Danh mục";
    document.getElementById("modal-category").style.display = "flex";
}

document.getElementById("category-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("cat-id").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/categories/${id}` : "/categories";

    const data = {
        name: document.getElementById("cat-name").value,
        description: document.getElementById("cat-desc").value
    };

    const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
    if(res.ok) {
        alert("Thành công!");
        document.getElementById("modal-category").style.display = "none";
        loadCategories();
    } else alert("Lỗi!");
};

async function deleteCategory(id) {
    if(confirm("Xóa danh mục này?")) {
        const res = await fetchWithAuth(`/categories/${id}`, { method: "DELETE" });
        if(res.ok) { alert("Đã xóa!"); loadCategories(); }
        else alert("Không thể xóa danh mục đang có phòng!");
    }
}

/* ================= 3. MODULE PHÒNG ================= */
async function loadRooms() {
    try {
        const res = await fetchWithAuth("/rooms");
        const rooms = await res.json();
        const tbody = document.getElementById("room-table-body");
        tbody.innerHTML = "";
        
        loadCategoriesForSelect();

        rooms.forEach(room => {
            const statusText = room.Status === 'available' ? 'Trống' : (room.Status === 'booked' ? 'Đã đặt' : 'Bảo trì');
            const price = new Intl.NumberFormat('vi-VN').format(room.Price);
            const img = room.ImageURL ? `<img src="${room.ImageURL}" class="table-img">` : '';
            
            // Xử lý chuỗi để tránh lỗi JS
            const desc = room.Description ? room.Description.replace(/\n/g, "\\n").replace(/'/g, "\\'") : "";
            // Thêm xử lý cho Address (nếu null thì để chuỗi rỗng)
            const addr = room.Address ? room.Address.replace(/'/g, "\\'") : "";

            tbody.innerHTML += `
                <tr>
                    <td>${room.RoomID}</td>
                    <td>${img}</td>
                    <td>
                        <b>${room.RoomName}</b><br>
                        <small style="color:#666"><i class="fas fa-map-marker-alt"></i> ${room.Address || '---'}</small>
                    </td>
                    <td>${room.CategoryName}</td>
                    <td>${price} đ</td>
                    <td>${statusText}</td>
                    <td>
                        <button onclick="openEditRoom(${room.RoomID}, '${room.RoomName}', ${room.CategoryID}, ${room.Price}, '${room.Status}', '${desc}', '${room.ImageURL}', '${addr}')" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteRoom(${room.RoomID})" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
}

async function loadCategoriesForSelect() {
    const res = await fetchWithAuth("/categories");
    const cats = await res.json();
    const select = document.getElementById("room-category");
    select.innerHTML = "";
    cats.forEach(c => select.innerHTML += `<option value="${c.CategoryID}">${c.CategoryName}</option>`);
}

document.getElementById("btn-add-room").onclick = () => {
    document.getElementById("room-form").reset();
    document.getElementById("room-id").value = "";
    document.querySelector("#modal-room h3").innerText = "Thêm Phòng mới";
    document.getElementById("modal-room").style.display = "flex";
};

// Cập nhật hàm này nhận thêm tham số address
function openEditRoom(id, name, catId, price, status, desc, img, address) {
    document.getElementById("room-id").value = id;
    document.getElementById("room-name").value = name;
    document.getElementById("room-category").value = catId;
    document.getElementById("room-price").value = price;
    document.getElementById("room-status").value = status;
    document.getElementById("room-description").value = desc;
    document.getElementById("room-image").value = img;
    
    // Điền địa chỉ cũ vào ô input
    document.getElementById("room-address").value = address || "";

    document.querySelector("#modal-room h3").innerText = "Cập nhật Phòng";
    document.getElementById("modal-room").style.display = "flex";
}

document.getElementById("room-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("room-id").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/rooms/${id}` : "/rooms";

    const data = {
        name: document.getElementById("room-name").value,
        // Lấy giá trị Address từ form
        address: document.getElementById("room-address").value, 
        category_id: document.getElementById("room-category").value,
        price: document.getElementById("room-price").value,
        status: document.getElementById("room-status").value,
        description: document.getElementById("room-description").value,
        image: document.getElementById("room-image").value
    };

    const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
    if(res.ok) {
        alert("Thành công!");
        document.getElementById("modal-room").style.display = "none";
        loadRooms();
    } else alert("Lỗi!");
};

async function deleteRoom(id) {
    if(confirm("Xóa phòng này?")) {
        const res = await fetchWithAuth(`/rooms/${id}`, { method: "DELETE" });
        if(res.ok) { alert("Đã xóa!"); loadRooms(); }
        else alert("Lỗi xóa phòng!");
    }
}

/* ================= 4. MODULE BOOKING (ĐƠN HÀNG) ================= */

// Hàm load danh sách Booking
async function loadBookings() {
    try {
        const res = await fetchWithAuth("/bookings");
        const bookings = await res.json();
        const tbody = document.getElementById("booking-table-body");
        tbody.innerHTML = "";

        bookings.forEach(bk => {
            // Tính số đêm để tính tổng tiền
            const inDate = new Date(bk.CheckInDate);
            const outDate = new Date(bk.CheckOutDate);
            // Tính ít nhất là 1 đêm
            const nights = Math.max(1, Math.round((outDate - inDate) / (1000 * 60 * 60 * 24))); 
            const total = nights * bk.Price;

            // Format ngày tháng hiển thị
            const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN');
            const fmtMoney = (m) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m);

            // 1. Xử lý Màu sắc Trạng thái (Badge)
            let badgeClass = 'badge-secondary'; // Mặc định màu xám
            let statusLabel = bk.Status;

            if (bk.Status === 'Pending') { badgeClass = 'badge-warning'; statusLabel = 'Chờ duyệt'; }
            if (bk.Status === 'Confirmed') { badgeClass = 'badge-primary'; statusLabel = 'Đã duyệt'; }
            if (bk.Status === 'CheckedIn') { badgeClass = 'badge-info'; statusLabel = 'Đang ở'; }
            if (bk.Status === 'CheckedOut') { badgeClass = 'badge-success'; statusLabel = 'Hoàn tất'; }
            if (bk.Status === 'Cancelled') { badgeClass = 'badge-danger'; statusLabel = 'Đã hủy'; }

            // 2. Render HTML
            tbody.innerHTML += `
                <tr>
                    <td>#${bk.BookingID}</td>
                    <td>
                        <b>${bk.Username}</b><br>
                        <small>${bk.Email}</small>
                    </td>
                    <td>${bk.RoomName}</td>
                    <td>${fmtDate(bk.CheckInDate)}</td>
                    <td>${fmtDate(bk.CheckOutDate)}</td>
                    <td style="color:#d4111e; font-weight:bold">${fmtMoney(total)}</td>
                    <td><span class="badge ${badgeClass}" style="padding: 5px 10px; font-size: 12px;">${statusLabel}</span></td>
                    <td>
                        ${bk.Status === 'Pending' ? `
                            <button onclick="updateBookingStatus(${bk.BookingID}, 'Confirmed')" class="btn btn-sm btn-success" title="Duyệt đơn"><i class="fas fa-check"></i></button>
                            <button onclick="updateBookingStatus(${bk.BookingID}, 'Cancelled')" class="btn btn-sm btn-danger" title="Hủy đơn"><i class="fas fa-times"></i></button>
                        ` : ''}

                        ${bk.Status === 'Confirmed' ? `
                            <button onclick="updateBookingStatus(${bk.BookingID}, 'CheckedIn')" class="btn btn-sm btn-warning" style="color:#fff;" title="Khách nhận phòng (Check-in)"><i class="fas fa-key"></i></button>
                            <button onclick="updateBookingStatus(${bk.BookingID}, 'Cancelled')" class="btn btn-sm btn-danger" title="Hủy đơn"><i class="fas fa-times"></i></button>
                        ` : ''}

                        ${bk.Status === 'CheckedIn' ? `
                            <button onclick="updateBookingStatus(${bk.BookingID}, 'CheckedOut')" class="btn btn-sm btn-secondary" style="background:#343a40; color:white; border:none;" title="Khách trả phòng (Check-out)"><i class="fas fa-sign-out-alt"></i> Trả phòng</button>
                        ` : ''}

                        ${bk.Status === 'CheckedOut' ? `
                            <span style="color:green; font-weight:bold;"><i class="fas fa-check-circle"></i> Xong</span>
                        ` : ''}

                        ${bk.Status === 'Cancelled' ? `
                            <span style="color:#999">---</span>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

// Hàm cập nhật trạng thái (Duyệt/Hủy)
async function updateBookingStatus(id, status) {
    let confirmMsg = `Bạn muốn chuyển trạng thái đơn #${id} sang: ${status}?`;
    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetchWithAuth(`/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: status })
        });

        if (res.ok) {
            alert("Cập nhật thành công!");
            loadBookings(); // Tải lại bảng
        } else {
            alert("Lỗi cập nhật!");
        }
    } catch (err) { alert("Lỗi server!"); }
}

/* ================= ĐÓNG MODAL CHUNG ================= */
document.querySelectorAll(".close-modal").forEach(btn => {
    btn.onclick = function() { this.closest(".modal").style.display = "none"; }
});
window.onclick = function(e) {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
}