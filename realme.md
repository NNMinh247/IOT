# Dự án IOT

Ứng dụng quản lý và giám sát thiết bị IOT theo thời gian thực, gồm backend Node.js/Express, cơ sở dữ liệu MySQL và frontend React/Vite. Hệ thống nhận dữ liệu cảm biến, lưu lịch sử, điều khiển thiết bị và đồng bộ trạng thái qua Socket.IO.

## Tổng quan

Mục tiêu của dự án là hiển thị dữ liệu cảm biến, điều khiển các thiết bị như quạt, máy bơm và đèn, đồng thời lưu lại lịch sử hành động để theo dõi sau này. Giao diện frontend được thiết kế theo kiểu dashboard với biểu đồ, thẻ trạng thái và khu vực điều khiển trực tiếp.

## Công nghệ sử dụng

### Backend

- Node.js
- Express
- MySQL / mysql2
- MQTT
- Socket.IO
- dotenv

### Frontend

- React 19
- Vite
- React Router
- Recharts
- Socket.IO Client
- Lucide React

## Cấu trúc thư mục

```text
Backend/
  src/
    server.js
    config/db.js
    controllers/
    models/
    routes/
    services/mqttService.js
Frontend/
  src/
    App.jsx
    components/Sidebar/
    pages/
      Dashboard/
      DataSensor/
      ActionHistory/
      Profile/
CSDL/
  db.sql
```

## Chức năng chính

- Nhận và lưu dữ liệu từ cảm biến nhiệt độ, độ ẩm và ánh sáng.
- Hiển thị dữ liệu mới nhất trên dashboard.
- Vẽ biểu đồ theo thời gian cho dữ liệu cảm biến.
- Điều khiển thiết bị từ giao diện web.
- Đồng bộ trạng thái thiết bị theo thời gian thực bằng Socket.IO.
- Lưu lịch sử thao tác điều khiển thiết bị.

## Backend

Backend khởi tạo một server Express kết hợp HTTP và Socket.IO. MQTT service được gắn vào Socket.IO để truyền dữ liệu realtime cho frontend.

### Các API chính

- `GET /api/sensors/data`
- `GET /api/actions/history`
- `POST /api/devices/control`
- `GET /api/devices/status`

### Luồng xử lý

1. Dữ liệu cảm biến được gửi vào backend qua MQTT hoặc API.
2. Backend lưu dữ liệu vào MySQL.
3. Backend phát sự kiện realtime qua Socket.IO để frontend cập nhật ngay.
4. Khi người dùng điều khiển thiết bị, frontend gửi yêu cầu tới backend.
5. Backend ghi nhận thao tác và cập nhật trạng thái thiết bị.

## Frontend

Frontend là một dashboard React với điều hướng bằng React Router.

### Các trang chính

- Dashboard: hiển thị số liệu hiện tại, biểu đồ và điều khiển thiết bị.
- DataSensor: xem dữ liệu cảm biến chi tiết.
- ActionHistory: xem lịch sử thao tác điều khiển.
- Profile: trang thông tin cá nhân.

### Tính năng realtime

- Tự động nhận dữ liệu cảm biến mới.
- Cập nhật trạng thái thiết bị ngay khi backend phát sự kiện.
- Hiển thị trạng thái chờ khi gửi lệnh điều khiển.

## Cơ sở dữ liệu

File khởi tạo database nằm ở `CSDL/db.sql`.

### Các bảng chính

- `sensors`: danh sách cảm biến.
- `data_sensors`: dữ liệu đo theo từng cảm biến.
- `devices`: danh sách thiết bị điều khiển.
- `action_history`: lịch sử lệnh điều khiển và trạng thái xử lý.

### Dữ liệu mẫu

- Cảm biến: nhiệt độ, độ ẩm, ánh sáng.
- Thiết bị: quạt, máy bơm, đèn.

## Cài đặt và chạy dự án

### 1. Chuẩn bị cơ sở dữ liệu

Chạy file `CSDL/db.sql` để tạo database và bảng cần thiết.

### 2. Cấu hình backend

Tạo file `.env` trong thư mục `Backend` và khai báo các biến môi trường cần thiết, tối thiểu gồm:

- `PORT`
- thông tin kết nối MySQL
- thông tin MQTT nếu hệ thống sử dụng broker

### 3. Chạy backend

```bash
cd Backend
npm install
node src/server.js
```

### 4. Chạy frontend

```bash
cd Frontend
npm install
npm run dev
```

## Ghi chú

- Frontend đang gọi backend tại `http://localhost:5000`.
- Dashboard lắng nghe các sự kiện Socket.IO để cập nhật dữ liệu realtime.
- Nếu thay đổi port backend, cần cập nhật lại URL trong frontend.

## Mở rộng tương lai

- Thêm xác thực người dùng.
- Bổ sung bộ lọc và thống kê nâng cao cho dữ liệu cảm biến.
- Thêm dashboard cho từng thiết bị riêng.
- Tối ưu phần cấu hình môi trường cho deploy production.