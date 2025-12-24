// --- 1. DỮ LIỆU CÁC THÀNH PHỐ TĨNH ---
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

// --- 2. CÁC HÀM HỖ TRỢ (HELPER FUNCTIONS) ---

// Vẽ danh sách gợi ý địa điểm vào dropdown
function renderCitySuggestions(cities) {
    const cityListUl = document.getElementById('city-list');
    if (!cityListUl) return; 

    cityListUl.innerHTML = ''; 

    if (cities.length === 0) {
        cityListUl.innerHTML = '<li style="padding: 12px; color:#999; cursor:default;">Không tìm thấy kết quả</li>';
        return;
    }

    cities.forEach(city => {
        cityListUl.innerHTML += `
            <li data-city="${city}"><i class="fas fa-map-pin"></i> ${city}</li>
        `;
    });
}

// Định dạng ngày thành chuỗi YYYY-MM-DD để gán vào input type="date"
function formatDefaultDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// LOGIC BẢN ĐỒ
let myMap; // Biến lưu bản đồ toàn cục

function showMap(name, lat, lng) {
    // 1. Kiểm tra xem Modal có tồn tại trong HTML không
    const modal = document.getElementById('map-modal');
    if (!modal) {
        alert("Lỗi: Thiếu HTML khung bản đồ (id='map-modal')");
        return;
    }

    // 2. Hiện Modal
    modal.style.display = 'flex';

    // 3. Khởi tạo bản đồ nếu chưa có
    // Kiểm tra biến L (Leaflet) có tồn tại không
    if (typeof L === 'undefined') {
        alert("Lỗi: Chưa tải thư viện Leaflet. Hãy kiểm tra lại thẻ <head>.");
        return;
    }

    if (!myMap) {
        myMap = L.map('popup-map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(myMap);
    }

    // 4. Reset map và ghim vị trí mới
    // Xóa marker cũ
    myMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            myMap.removeLayer(layer);
        }
    });

    // Di chuyển map đến vị trí mới và thêm marker
    if (lat && lng) {
        myMap.setView([lat, lng], 16);
        L.marker([lat, lng]).addTo(myMap)
            .bindPopup(`<b>${name}</b>`)
            .openPopup();
    }

    // Fix lỗi hiển thị map (quan trọng khi nằm trong modal ẩn)
    setTimeout(() => { myMap.invalidateSize(); }, 200);
}

// Biến toàn cục: mảng các danh mục đang chọn (cho trang search-results)
let selectedCategoryIds = [];
// Biến toàn cục: mảng các mức điểm đánh giá đang chọn (ví dụ: [9, 8, 7] = lọc phòng có điểm >= 7)
let selectedRatingFilters = [];
// Biến toàn cục: lưu tất cả phòng để filter client-side
let allRooms = [];

// --- 3. KHỞI TẠO KHI TRANG LOAD ---
document.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo các trạng thái ban đầu
    checkLoginStatus();

    // --- KHAI BÁO BIẾN UI ---
    const searchLocationInput = document.getElementById('search-location');
    const locationDropdown = document.getElementById('location-dropdown');
    const cityListUl = document.getElementById('city-list');
    const searchButton = document.querySelector('.btn-search');
    const locationWrap = document.querySelector('.location-wrap'); 
    
    const checkInInput = document.getElementById('checkin-date');
    const checkOutInput = document.getElementById('checkout-date');
    
    // --- TỰ ĐỘNG ĐIỀN NGÀY MẶC ĐỊNH ---
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); 

    if(checkInInput) checkInInput.value = formatDefaultDate(today);
    if(checkOutInput) checkOutInput.value = formatDefaultDate(tomorrow);
    
    // --- XỬ LÝ AUTOCOMPLETE ĐỊA ĐIỂM ---
    
    if(searchLocationInput) {
        // 1. Khi gõ chữ: Lọc danh sách và hiện dropdown
        searchLocationInput.addEventListener('input', () => {
            const query = searchLocationInput.value.toLowerCase().trim();
            
            if (query.length > 0) {
                const filteredCities = ALL_CITIES.filter(city => city.toLowerCase().includes(query));
                renderCitySuggestions(filteredCities);
            } else {
                renderCitySuggestions(ALL_CITIES.slice(0, 10)); // Hiện 10 thành phố đầu nếu ô trống
            }
            if(locationDropdown) locationDropdown.style.display = 'block';
        });

        // 2. Khi click vào ô input: Hiện danh sách gợi ý ban đầu
        searchLocationInput.addEventListener('click', () => {
            if (searchLocationInput.value.trim() === '') {
                renderCitySuggestions(ALL_CITIES.slice(0, 10));
            }
            if(locationDropdown) locationDropdown.style.display = 'block';
        });
    }

    // 3. Ẩn dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
        // Nếu click không nằm trong khung search location và không phải nút tìm kiếm
        if (locationWrap && !locationWrap.contains(e.target) && !searchButton.contains(e.target)) {
            if(locationDropdown) locationDropdown.style.display = 'none';
        }
    });

    // 4. Chọn thành phố từ danh sách
    if(cityListUl) {
        cityListUl.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (listItem) {
                const selectedCity = listItem.getAttribute('data-city');
                if(searchLocationInput) searchLocationInput.value = selectedCity;
                if(locationDropdown) locationDropdown.style.display = 'none';
                searchRooms(); // Tự động tìm kiếm sau khi chọn
            }
        });
    }

    // --- 5. LOGIC CLICK BẤT KỲ ĐÂU ĐỂ MỞ LỊCH ---
    const dateItems = document.querySelectorAll('.search-item.date-item');

    dateItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Tìm thẻ input date nằm bên trong cái ô vừa bấm
            const input = item.querySelector('input[type="date"]');
            
            // Nếu trình duyệt hỗ trợ hàm showPicker (Chrome/Edge/Firefox mới đều hỗ trợ)
            if (input && 'showPicker' in HTMLInputElement.prototype) {
                // Kiểm tra xem người dùng có bấm trực tiếp vào input không
                // Nếu bấm vào khoảng trắng xung quanh thì mới gọi showPicker để tránh xung đột
                if (e.target !== input) {
                    try {
                        input.showPicker();
                    } catch (err) {
                        // Fallback cho một số trường hợp hãn hữu
                        input.focus();
                    }
                }
            } else {
                // Fallback cho trình duyệt cũ (Safari cũ)
                input.focus();
            }
        });
    });

    if (window.location.pathname.includes('search-results.html')) {
        // --- NẾU LÀ TRANG KẾT QUẢ ---
        const params = new URLSearchParams(window.location.search);
        const loc = params.get('location') || '';
        const checkIn = params.get('checkIn') || '';
        const checkOut = params.get('checkOut') || '';

        // Điền lại dữ liệu vào thanh tìm kiếm
        document.getElementById('search-location').value = loc;
        if(checkIn) document.getElementById('checkin-date').value = checkIn;
        if(checkOut) document.getElementById('checkout-date').value = checkOut;
        
        // Cập nhật tiêu đề
        if(loc) document.getElementById('search-title').innerText = `Chỗ nghỉ tại: ${loc}`;

        // Tải danh mục filter và sau đó tải phòng
        loadCategoriesFilters().then(() => {
            loadRooms(loc, checkIn, checkOut);
        }).catch(() => {
            // Nếu lỗi khi tải danh mục vẫn tải phòng bình thường
            loadRooms(loc, checkIn, checkOut);
        });
    } else {
        // --- NẾU LÀ TRANG CHỦ ---
        // Chỉ khởi tạo ngày mặc định, không tải phòng (vì trang chủ chỉ hiện điểm đến)
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        
        const inInput = document.getElementById('checkin-date');
        const outInput = document.getElementById('checkout-date');
        
        if(inInput) inInput.value = formatDefaultDate(today);
        if(outInput) outInput.value = formatDefaultDate(tomorrow);
    }
});

// --- 4. CÁC HÀM XỬ LÝ LOGIC ---

// Kiểm tra trạng thái đăng nhập để hiển thị Header
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authSection = document.getElementById('auth-section');

    if (token) {
        // Đã đăng nhập
        authSection.innerHTML = `
            <span class="user-welcome">Xin chào, ${username}</span>
            <a href="history.html" style="color:white; text-decoration:underline; margin-right:15px; font-size:14px; font-weight:bold;">Lịch sử đặt phòng</a>
            <button class="btn-logout" onclick="logout()">Đăng xuất</button>
        `;
    } else {
        // Chưa đăng nhập (Sửa đường dẫn phù hợp với thư mục của bạn)
        authSection.innerHTML = `
            <a href="../auth/register.html" class="btn-register">Đăng ký</a>
            <a href="../auth/login.html" class="btn-login">Đăng nhập</a>
        `;
    }
}

// Hàm tải phòng từ Server
async function loadRooms(location = '', checkIn = '', checkOut = '') {
    try {
        let url = `http://localhost:3000/api/rooms?t=${new Date().getTime()}`;
        if (location) url += `&location=${encodeURIComponent(location)}`;
        if (checkIn) url += `&checkIn=${encodeURIComponent(checkIn)}`;
        if (checkOut) url += `&checkOut=${encodeURIComponent(checkOut)}`;

        const res = await fetch(url);
        const rooms = await res.json();
        const container = document.getElementById('room-list');

        if (!container) return;

        // Lưu tất cả phòng để filter client-side
        allRooms = rooms;

        // Áp dụng filter theo category nếu có
        let filteredRooms = rooms;
        if (selectedCategoryIds.length > 0) {
            filteredRooms = rooms.filter(room => {
                return selectedCategoryIds.includes(room.CategoryID.toString());
            });
        }

        // Áp dụng filter theo rating nếu có
        if (selectedRatingFilters.length > 0) {
            const minRating = Math.min(...selectedRatingFilters);
            filteredRooms = filteredRooms.filter(room => {
                const avgRating = parseFloat(room.AvgRating || 0);
                return avgRating >= minRating;
            });
        }

        if (filteredRooms.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; padding:20px">Không tìm thấy phòng phù hợp.</p>';
            // Cập nhật rating filters với dữ liệu mới
            updateRatingFilters(rooms);
            return;
        }

        renderRooms(filteredRooms);
        
        // Cập nhật rating filters với dữ liệu mới
        updateRatingFilters(rooms);
    } catch (err) { 
        console.error(err); 
    }
}

// --- LOGIC HIỂN THỊ MODAL REVIEW ---

const reviewModal = document.getElementById('viewReviewsModal');

// Hàm này được gọi khi khách bấm vào ô điểm số
async function viewRoomReviews(roomId) {
    // 1. Hiện Modal lên
    if(reviewModal) reviewModal.style.display = 'flex';
    
    const container = document.getElementById('reviews-list-container');
    container.innerHTML = '<p style="text-align:center; padding:20px;">⏳ Đang tải đánh giá...</p>';

    try {
        // 2. Gọi API để lấy review của RIÊNG phòng này (theo roomId)
        const res = await fetch(`http://localhost:3000/api/reviews/${roomId}`);
        const reviews = await res.json();

        // 3. Nếu không có review nào (trường hợp hãn hữu vì ta chỉ hiện nút khi count > 0)
        if (reviews.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Chưa có nhận xét nào.</p>';
            return;
        }

        // 4. Vẽ danh sách ra Modal
        container.innerHTML = reviews.map(r => {
            const date = new Date(r.CreatedAt).toLocaleDateString('vi-VN');
            return `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-user-name">
                            <i class="fas fa-user-circle" style="color:#666"></i> ${r.Username}
                        </span>
                        <span class="review-score-tag">${r.Rating}/10</span>
                    </div>
                    <div class="review-text">"${r.Comment}"</div>
                    <div class="review-date">Đăng ngày: ${date}</div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red; text-align:center;">Lỗi kết nối server!</p>';
    }
}

// Hàm đóng Modal
function closeReviewModal() {
    if(reviewModal) reviewModal.style.display = 'none';
}

// Đóng khi bấm ra vùng tối bên ngoài
window.onclick = function(event) {
    const mapModal = document.getElementById('map-modal');
    const reviewModal = document.getElementById('viewReviewsModal');
    
    if (event.target == mapModal) {
        mapModal.style.display = "none";
    }
    if (event.target == reviewModal) {
        closeReviewModal();
    }
}

// Xử lý sự kiện bấm nút "Tìm kiếm"

function goToSearch(locationName) {
    // Lấy ngày mặc định hôm nay/ngày mai
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    
    // Chuyển hướng sang trang kết quả
    window.location.href = `search-results.html?location=${encodeURIComponent(locationName)}&checkIn=${today}&checkOut=${tomorrow}`;
}

function searchRooms() {
    const loc = document.getElementById('search-location').value;
    const inDate = document.getElementById('checkin-date').value;
    const outDate = document.getElementById('checkout-date').value;

    // Kiểm tra xem đang ở trang nào
    if (window.location.pathname.includes('search-results.html')) {
        // Nếu đang ở trang kết quả -> Load lại danh sách tại chỗ (AJAX)
        loadRooms(loc, inDate, outDate);
    } else {
        // Nếu đang ở trang chủ -> Chuyển hướng sang trang kết quả
        window.location.href = `search-results.html?location=${encodeURIComponent(loc)}&checkIn=${inDate}&checkOut=${outDate}`;
    }
}

// --- LỌC THEO DANH MỤC (TRANG SEARCH-RESULTS) ---

async function loadCategoriesFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return; // Không phải trang search-results

    try {
        const res = await fetch('http://localhost:3000/api/categories');
        if (!res.ok) {
            throw new Error('Không tải được danh mục');
        }
        const categories = await res.json();

        if (!Array.isArray(categories) || categories.length === 0) {
            container.innerHTML = '<p style="font-size: 13px; color:#666;">Chưa có danh mục phòng.</p>';
            return;
        }

        let html = '';

        categories.forEach(cat => {
            const isChecked = selectedCategoryIds.includes(cat.CategoryID.toString());
            html += `
                <div class="filter-category-item">
                    <label>
                        <input type="checkbox" 
                               name="categoryFilter" 
                               id="cat-${cat.CategoryID}" 
                               value="${cat.CategoryID}"
                               ${isChecked ? 'checked' : ''}
                               onchange="handleCategoryFilterChange()">
                        <span>${cat.CategoryName}</span>
                    </label>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        if (container) {
            container.innerHTML = '<p style="font-size: 13px; color:red;">Không tải được danh mục.</p>';
        }
    }
}

// Hàm xử lý khi thay đổi category filter
function handleCategoryFilterChange() {
    const checkboxes = document.querySelectorAll('input[name="categoryFilter"]:checked');
    selectedCategoryIds = Array.from(checkboxes).map(cb => cb.value);
    
    // Lọc lại danh sách phòng
    applyFilters();
}

// Hàm áp dụng tất cả filters (category + rating)
function applyFilters() {
    const container = document.getElementById('room-list');
    if (!container || allRooms.length === 0) return;
    
    let filteredRooms = allRooms;
    
    // Filter theo category
    if (selectedCategoryIds.length > 0) {
        filteredRooms = filteredRooms.filter(room => {
            return selectedCategoryIds.includes(room.CategoryID.toString());
        });
    }
    
    // Filter theo rating
    if (selectedRatingFilters.length > 0) {
        const minRating = Math.min(...selectedRatingFilters);
        filteredRooms = filteredRooms.filter(room => {
            const avgRating = parseFloat(room.AvgRating || 0);
            return avgRating >= minRating;
        });
    }
    
    if (filteredRooms.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; padding:20px">Không tìm thấy phòng phù hợp.</p>';
        return;
    }
    
    // Render lại danh sách phòng đã lọc
    renderRooms(filteredRooms);
}

// Hàm render danh sách phòng (tách riêng để tái sử dụng)
function renderRooms(rooms) {
    const container = document.getElementById('room-list');
    if (!container) return;
    
    container.innerHTML = rooms.map(room => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.Price);
        const img = room.ImageURL || 'https://via.placeholder.com/300x200';
        
        // --- LOGIC MAP BUTTON ---
        const lat = parseFloat(room.Latitude);
        const lng = parseFloat(room.Longitude);
        let mapButtonHtml = '';
        
        // Kiểm tra nếu toạ độ hợp lệ thì tạo nút bấm
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            // Sử dụng inline style để đảm bảo nút hiển thị đúng mà không cần sửa nhiều file CSS
            mapButtonHtml = `
                <button class="btn-map-small" 
                        style="border:none; background:none; color:#007bff; font-weight:bold; text-decoration:underline; cursor:pointer; margin-left:10px; padding:0;"
                        onclick="showMap('${room.RoomName.replace(/'/g, "\\'")}', ${lat}, ${lng})">
                    Xem trên bản đồ
                </button>
            `;
        }

        const addressHtml = room.Address 
            ? `<div class="room-location" style="display:flex; align-items:center; font-size:13px; color:#666; margin:5px 0;">
                    <i class="fas fa-map-marker-alt" style="margin-right:5px; color:#007bff;"></i>
                    <span>${room.Address}</span>
                    ${mapButtonHtml} </div>` 
            : '';
        
        const ratingVal = parseFloat(room.AvgRating || 0);
        const count = room.ReviewCount;
        
        let reviewHtml = '';
        
        if (count > 0) {
            let label = 'Trung bình';
            if (ratingVal >= 9.5) label = 'Trên cả tuyệt vời';
            else if (ratingVal >= 9.0) label = 'Xuất sắc';
            else if (ratingVal >= 8.0) label = 'Tuyệt vời';
            else if (ratingVal >= 7.0) label = 'Tốt';
            else if (ratingVal >= 5.0) label = 'Hài lòng';

            reviewHtml = `
                <div class="review-summary" style="cursor:pointer" onclick="viewRoomReviews(${room.RoomID})" title="Bấm để xem các bình luận">
                    <div class="review-score-box">${ratingVal.toFixed(1)}</div>
                    <div class="review-details">
                        <span class="review-label">${label}</span>
                        <span class="review-count-text">${count} đánh giá - Xem chi tiết</span>
                    </div>
                </div>
            `;
        } else {
            reviewHtml = `<div class="review-summary" style="opacity:0.6"><span class="review-count-text" style="font-style:italic">Chưa có đánh giá</span></div>`;
        }

        return `
            <div class="room-card">
                <img src="${img}" class="room-img">
                <div class="room-info">
                    <div class="room-cat" style="font-size:12px; font-weight:bold; color:#0071c2;">${room.CategoryName || 'STANDARD'}</div>
                    <div class="room-name" style="font-size:18px; font-weight:bold; margin:5px 0">${room.RoomName}</div>
                    ${addressHtml}
                    <div class="room-desc" style="font-size:14px; color:#555;">${room.Description || ''}</div>
                    
                    ${reviewHtml}
                    
                    <div class="room-price" style="font-size:20px; color:#d4111e; font-weight:bold; text-align:right;">${price}</div>
                    <div style="margin-top:auto;">
                        <button class="btn-book" onclick="handleBooking(${room.RoomID})">Đặt Ngay</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- LỌC THEO ĐIỂM ĐÁNH GIÁ (TRANG SEARCH-RESULTS) ---

// Hàm đếm số lượng phòng theo từng mức điểm
function countRoomsByRating(rooms) {
    const counts = {
        9: 0, // Superb: 9+
        8: 0, // Very good: 8+
        7: 0, // Good: 7+
        6: 0  // Pleasant: 6+
    };
    
    rooms.forEach(room => {
        const avgRating = parseFloat(room.AvgRating || 0);
        if (avgRating >= 9) counts[9]++;
        if (avgRating >= 8) counts[8]++;
        if (avgRating >= 7) counts[7]++;
        if (avgRating >= 6) counts[6]++;
    });
    
    return counts;
}

// Hàm cập nhật UI rating filters
function updateRatingFilters(rooms) {
    const container = document.getElementById('rating-filters');
    if (!container) return;
    
    const counts = countRoomsByRating(rooms);
    
    const ratingOptions = [
        { min: 9, label: 'Đỉnh của chóp', count: counts[9] },
        { min: 8, label: 'Tốt', count: counts[8] },
        { min: 7, label: 'Khá', count: counts[7] },
        { min: 6, label: 'Trung bình', count: counts[6] }
    ];
    
    let html = '';
    ratingOptions.forEach(option => {
        const isChecked = selectedRatingFilters.includes(option.min);
        html += `
            <div class="rating-filter-item">
                <label>
                    <input type="checkbox" 
                           name="ratingFilter" 
                           value="${option.min}" 
                           ${isChecked ? 'checked' : ''}
                           onchange="handleRatingFilterChange()">
                    <span>${option.label}: ${option.min}+</span>
                </label>
                <span class="rating-count">${option.count}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Hàm xử lý khi thay đổi rating filter
function handleRatingFilterChange() {
    const checkboxes = document.querySelectorAll('input[name="ratingFilter"]:checked');
    selectedRatingFilters = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    // Lọc lại danh sách phòng
    applyFilters();
}


// Xử lý Đặt phòng
async function handleBooking(roomId) {
    const token = localStorage.getItem('token');

    // 1. Kiểm tra đăng nhập
    if (!token) {
        if(confirm("Bạn cần đăng nhập để đặt phòng. Chuyển đến trang đăng nhập ngay?")) {
            window.location.href = '/public/auth/login.html'; 
        }
        return;
    }

    // 2. Lấy ngày khách đã chọn trên thanh tìm kiếm
    const checkInDate = document.getElementById('checkin-date').value;
    const checkOutDate = document.getElementById('checkout-date').value;

    // Kiểm tra sơ bộ (Dù HTML đã có required nhưng JS check thêm cho chắc)
    if (!checkInDate || !checkOutDate) {
        alert("Vui lòng chọn ngày nhận và trả phòng!");
        return;
    }

    // 3. Hỏi xác nhận (Hiển thị ngày cho khách check lại)
    const msg = `Xác nhận đặt phòng này?\n\n📅 Nhận: ${checkInDate}\n📅 Trả: ${checkOutDate}`;
    if (!confirm(msg)) return;

    // 4. Gửi yêu cầu lên Server
    try {
        const res = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            // GỬI KÈM NGÀY THÁNG LÊN SERVER
            body: JSON.stringify({ 
                roomId: roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ " + data.message); 
        } else {
            alert("❌ " + (data.error || "Có lỗi xảy ra"));
            // Nếu lỗi do hết phiên đăng nhập -> đá về login
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/public/auth/login.html';
            }
        }

    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối Server! Vui lòng kiểm tra lại.");
    }
}

// Đăng xuất
function logout() {
    localStorage.clear();
    window.location.reload();
}