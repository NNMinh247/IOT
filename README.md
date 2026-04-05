Người dùng        FE (Dashboard)           BE (Express)          CSDL (MySQL)         MQTT Broker        IoT Device
     |                   |                       |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     | 1. Vào trang /    |                       |                     |                    |                  |
     |---- navigate ---->|                       |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   | 2. Khởi tạo Socket.io |                     |                    |                  |
     |                   | io('localhost:5000')  |                     |                    |                  |
     |                   |<====== connect ======>|                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   | 3. GET /api/sensors/data                    |                    |                  |
     |                   |  ?limit=90&sortKey=time&sortDir=desc        |                    |                  |
     |                   |  &filterBy=temp,hum,light                   |                    |                  |
     |                   |---------- HTTP GET --->|                     |                    |                  |
     |                   |                       | 4. SELECT d.value,  |                    |                  |
     |                   |                       | d.time, s.name      |                    |                  |
     |                   |                       | FROM data_sensors d |                    |                  |
     |                   |                       | JOIN sensors s ON   |                    |                  |
     |                   |                       | d.idss=s.id         |                    |                  |
     |                   |                       | WHERE s.name IN ... |                    |                  |
     |                   |                       | ORDER BY d.time DESC|                    |                  |
     |                   |                       | LIMIT 90            |                    |                  |
     |                   |                       |------ SELECT ------>|                    |                  |
     |                   |                       |<----- rows[] -------|                    |                  |
     |                   |                       | 5. Group by time,   |                    |                  |
     |                   |                       | giữ 30 điểm cuối   |                    |                  |
     |                   |<-- 200 { data[], pagination } -------------|                    |                  |
     |                   | 6. Render chart với   |                     |                    |                  |
     |                   | 30 điểm dữ liệu       |                     |                    |                  |
     |<-- Hiện biểu đồ --|                       |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   | 7. GET /api/devices/status                  |                    |                  |
     |                   |---------- HTTP GET --->|                     |                    |                  |
     |                   |                       | 8. SELECT ah.action,|                    |                  |
     |                   |                       | ah.status FROM      |                    |                  |
     |                   |                       | action_history ah   |                    |                  |
     |                   |                       | WHERE iddv IN (1,2,3)|                   |                  |
     |                   |                       | ORDER BY time DESC  |                    |                  |
     |                   |                       | LIMIT 1 per device  |                    |                  |
     |                   |                       |------ SELECT ------>|                    |                  |
     |                   |                       |<----- rows[] -------|                    |                  |
     |                   |<-- 200 { data: {fan, pump, light}, pending }|                   |                  |
     |                   | 9. Render trạng thái  |                     |                    |                  |
     |                   | thiết bị (ON/OFF)     |                     |                    |                  |
     |<-- Hiện switch ---|                       |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   |                       |                     | ~~~ Realtime loop bắt đầu ~~~        |
     |                   |                       |                     |                    |                  |
     |                   |                       |                     |        10. Publish sensors/data      |
     |                   |                       |                     |            { temp, hum, light }      |
     |                   |                       |                     |<--- MQTT pub ------| <-- publish -----|
     |                   |                       | 11. Subscribe nhận  |                    |                  |
     |                   |                       | topic sensors/data  |                    |                  |
     |                   |                       |<=================== MQTT message ========|                  |
     |                   |                       | 12. INSERT INTO data_sensors             |                  |
     |                   |                       | (idss=1, value=temp) -- x3 sensor        |                  |
     |                   |                       |------ INSERT x3 --->|                    |                  |
     |                   |                       |<----- OK ----------|                    |                  |
     |                   |                       | 13. socket.emit(    |                    |                  |
     |                   |                       | 'update_dashboard', |                    |                  |
     |                   |                       | { time, temp,       |                    |                  |
     |                   |                       |   hum, light })     |                    |                  |
     |                   |<====== Socket.io event 'update_dashboard' ==|                   |                  |
     |                   | 14. Append điểm mới   |                     |                    |                  |
     |                   | vào chart data        |                     |                    |                  |
     |                   | (giữ tối đa 30 điểm)  |                     |                    |                  |
     |                   | 15. Re-render biểu đồ |                     |                    |                  |
     |<-- Biểu đồ cập nhật realtime              |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   |                       |                     | ~~~ Lặp lại mỗi khi IoT gửi dữ liệu |


Người dùng        FE (Dashboard)           BE (Express)          CSDL (MySQL)         MQTT Broker        IoT Device
     |                   |                       |                     |                    |                  |
     | 1. Click nút Bật  |                       |                     |                    |                  |
     | (ví dụ: Quạt)     |                       |                     |                    |                  |
     |---- click ------->|                       |                     |                    |                  |
     |                   | 2. Set loading state  |                     |                    |                  |
     |                   | (hiện spinner)        |                     |                    |                  |
     |                   | POST /api/devices/control                   |                    |                  |
     |                   | { device_id: 1,       |                     |                    |                  |
     |                   |   action: 'Bật' }     |                     |                    |                  |
     |                   |---------- HTTP POST -->|                     |                    |                  |
     |                   |                       | 3. INSERT INTO      |                    |                  |
     |                   |                       | action_history      |                    |                  |
     |                   |                       | (iddv=1, action='Bật'|                   |                  |
     |                   |                       |  status='Chờ')      |                    |                  |
     |                   |                       |------ INSERT ------>|                    |                  |
     |                   |                       |<-- insertId --------|                    |                  |
     |                   |                       | 4. Publish MQTT     |                    |                  |
     |                   |                       | topic: devices/control                   |                  |
     |                   |                       | payload: 'LED1_ON'  |                    |                  |
     |                   |                       |==================== MQTT pub ============>|                  |
     |                   |                       |                     |                    |---- deliver ---->|
     |                   |<-- 200 { success } ---|                     |                    |                  |
     |                   |                       | 5. Bắt đầu đếm     |                    |                  |
     |                   |                       | timeout 10 giây    |                    |                  |
     |                   |                       | (setTimeout)        |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   |                       |                     |    6. IoT nhận lệnh, thực thi        |
     |                   |                       |                     |                    | <--- LED1 ON ----|
     |                   |                       |                     |    7. Publish kết quả                |
     |                   |                       |                     |                    | <-- publish -----|
     |                   |                       |                     |         topic: devices/status        |
     |                   |                       |                     |         { result: 'success',         |
     |                   |                       |                     |           led1:'ON', led2:'OFF',     |
     |                   |                       |                     |           led3:'OFF' }               |
     |                   |                       |<=================== MQTT message ========|                  |
     |                   |                       | 8. Tìm action_history                   |                  |
     |                   |                       | có status='Chờ'     |                    |                  |
     |                   |                       | của device bị ảnh hưởng                 |                  |
     |                   |                       | 9. UPDATE action_history                |                  |
     |                   |                       | SET status='Thành công'                 |                  |
     |                   |                       | WHERE id=insertId   |                    |                  |
     |                   |                       |------ UPDATE ------>|                    |                  |
     |                   |                       |<----- OK ----------|                    |                  |
     |                   |                       | 10. Clear timeout   |                    |                  |
     |                   |                       | 11. socket.emit(    |                    |                  |
     |                   |                       | 'device_status_update',                 |                  |
     |                   |                       | { led1:'ON', ...})  |                    |                  |
     |                   |<====== Socket.io event 'device_status_update' =================>|                  |
     |                   | 12. Cập nhật trạng    |                     |                    |                  |
     |                   | thái thiết bị (ON)    |                     |                    |                  |
     |                   | Clear loading state   |                     |                    |                  |
     |<-- Switch = ON ----|                      |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |           [Nếu IoT không phản hồi trong 10 giây]               |                    |                  |
     |                   |                       | 13. Timeout trigger |                    |                  |
     |                   |                       | UPDATE action_history                   |                  |
     |                   |                       | SET status='Thất bại'                   |                  |
     |                   |                       |------ UPDATE ------>|                    |                  |
     |                   |                       | 14. socket.emit(    |                    |                  |
     |                   |                       | 'device_timeout',   |                    |                  |
     |                   |                       | { device: 'fan',    |                    |                  |
     |                   |                       |   message: '...' }) |                    |                  |
     |                   |<====== Socket.io event 'device_timeout' ===================>    |                  |
     |                   | 15. Hiện alert lỗi    |                     |                    |                  |
     |                   | Clear loading state   |                     |                    |                  |
     |<-- Alert timeout --|                      |                     |                    |                  |


Người dùng        FE (DataSensor)          BE (Express)          CSDL (MySQL)
     |                   |                       |                     |
     | 1. Vào trang      |                       |                     |
     | /data-sensor      |                       |                     |
     |---- navigate ---->|                       |                     |
     |                   | 2. Khởi tạo state mặc định:               |
     |                   | page=1, limit=10,     |                     |
     |                   | sortKey='time',       |                     |
     |                   | sortDir='desc',       |                     |
     |                   | filterBy='temp,hum,light'                  |
     |                   |                       |                     |
     |                   | 3. GET /api/sensors/data                    |
     |                   | ?page=1&limit=10      |                     |
     |                   | &sortKey=time         |                     |
     |                   | &sortDir=desc         |                     |
     |                   | &filterBy=temp,hum,light                   |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 4. SELECT d.id,     |
     |                   |                       | d.value, d.time,    |
     |                   |                       | s.name              |
     |                   |                       | FROM data_sensors d |
     |                   |                       | JOIN sensors s      |
     |                   |                       | ON d.idss = s.id    |
     |                   |                       | WHERE s.name IN     |
     |                   |                       | ('Cảm biến nhiệt độ'|
     |                   |                       |  'Cảm biến độ ẩm'  |
     |                   |                       |  'Cảm biến ánh sáng')|
     |                   |                       | ORDER BY d.time DESC|
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |                       | 5. SELECT COUNT(*)  |
     |                   |                       | (tính totalItems    |
     |                   |                       | cho phân trang)     |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- count --------|
     |                   |<-- 200 { success,     |                     |
     |                   |  data[], pagination:  |                     |
     |                   |  { currentPage: 1,    |                     |
     |                   |    totalPages,        |                     |
     |                   |    totalItems,        |                     |
     |                   |    itemsPerPage: 10}} |                     |
     |                   | 6. Render bảng dữ liệu|                     |
     |                   | + pagination          |                     |
     |<-- Hiện bảng ------|                      |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng lọc theo loại cảm biến ~~~|
     |                   |                       |                     |
     | 7. Chọn checkbox  |                       |                     |
     | "Nhiệt độ" only   |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 8. Cập nhật filterBy='temp'               |
     |                   | Reset page=1          |                     |
     |                   | GET /api/sensors/data |                     |
     |                   | ?page=1&limit=10      |                     |
     |                   | &filterBy=temp        |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 9. SELECT ... WHERE |
     |                   |                       | s.name =            |
     |                   |                       | 'Cảm biến nhiệt độ'|
     |                   |                       | ORDER BY d.time DESC|
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 10. Re-render bảng    |                     |
     |<-- Bảng lọc temp --|                      |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng tìm kiếm ~~~              |
     |                   |                       |                     |
     | 11. Nhập từ khóa  |                       |                     |
     | vào ô tìm kiếm    |                       |                     |
     | (ví dụ: "25")     |                       |                     |
     |---- input ------->|                       |                     |
     |                   | 12. Debounce 500ms    |                     |
     |                   | (chờ người dùng       |                     |
     |                   | ngừng gõ)             |                     |
     |                   | Cập nhật searchText='25'                   |
     |                   | Reset page=1          |                     |
     |                   | GET /api/sensors/data |                     |
     |                   | ?page=1&limit=10      |                     |
     |                   | &searchText=25        |                     |
     |                   | &filterBy=temp        |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 13. SELECT ... WHERE|
     |                   |                       | s.name = '...' AND  |
     |                   |                       | (d.value LIKE '%25%'|
     |                   |                       |  OR d.time LIKE     |
     |                   |                       |  '%25%')            |
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 14. Re-render bảng    |                     |
     |<-- Kết quả tìm ---|                       |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng sắp xếp ~~~               |
     |                   |                       |                     |
     | 15. Click header  |                       |                     |
     | cột "Giá trị"     |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 16. Cập nhật          |                     |
     |                   | sortKey='value'       |                     |
     |                   | sortDir='asc'         |                     |
     |                   | (click lần 2 → 'desc')|                     |
     |                   | GET /api/sensors/data |                     |
     |                   | ?page=1&limit=10      |                     |
     |                   | &sortKey=value        |                     |
     |                   | &sortDir=asc          |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 17. SELECT ...      |
     |                   |                       | ORDER BY d.value ASC|
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 18. Re-render bảng    |                     |
     |<-- Bảng sắp xếp --|                       |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng chuyển trang ~~~          |
     |                   |                       |                     |
     | 19. Click trang 2 |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 20. Cập nhật page=2   |                     |
     |                   | GET /api/sensors/data |                     |
     |                   | ?page=2&limit=10&...  |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 21. SELECT ...      |
     |                   |                       | LIMIT 10 OFFSET 10 |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 22. Re-render bảng    |                     |
     |<-- Trang 2 --------|                      |                     |


Người dùng        FE (ActionHistory)       BE (Express)          CSDL (MySQL)
     |                   |                       |                     |
     | 1. Vào trang      |                       |                     |
     | /action-history   |                       |                     |
     |---- navigate ---->|                       |                     |
     |                   | 2. Khởi tạo state mặc định:               |
     |                   | page=1, limit=10,     |                     |
     |                   | devices=[] (tất cả),  |                     |
     |                   | actions=[] (tất cả),  |                     |
     |                   | statuses=[] (tất cả), |                     |
     |                   | searchTime=''         |                     |
     |                   |                       |                     |
     |                   | 3. GET /api/actions/history               |
     |                   | ?page=1&limit=10      |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 4. SELECT ah.id,    |
     |                   |                       | d.name, ah.action,  |
     |                   |                       | ah.status, ah.time  |
     |                   |                       | FROM action_history ah|
     |                   |                       | JOIN devices d      |
     |                   |                       | ON ah.iddv = d.id   |
     |                   |                       | ORDER BY ah.time DESC|
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |                       | 5. SELECT COUNT(*)  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- count --------|
     |                   |<-- 200 { success,     |                     |
     |                   |  data[], pagination } |                     |
     |                   | 6. Render bảng lịch sử|                     |
     |<-- Hiện bảng ------|                      |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng lọc theo thiết bị ~~~     |
     |                   |                       |                     |
     | 7. Chọn checkbox  |                       |                     |
     | "Quạt" + "Đèn"    |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 8. Cập nhật           |                     |
     |                   | devices=[1, 3]        |                     |
     |                   | Reset page=1          |                     |
     |                   | GET /api/actions/history                   |
     |                   | ?page=1&limit=10      |                     |
     |                   | &devices=1,3          |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 9. SELECT ... WHERE |
     |                   |                       | ah.iddv IN (1, 3)   |
     |                   |                       | ORDER BY ah.time DESC|
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 10. Re-render bảng    |                     |
     |<-- Bảng đã lọc ---|                       |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng lọc theo hành động ~~~    |
     |                   |                       |                     |
     | 11. Chọn checkbox |                       |                     |
     | "Bật" only        |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 12. Cập nhật          |                     |
     |                   | actions=['Bật']       |                     |
     |                   | Reset page=1          |                     |
     |                   | GET /api/actions/history                   |
     |                   | ?page=1&limit=10      |                     |
     |                   | &devices=1,3          |                     |
     |                   | &actions=Bật          |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 13. SELECT ... WHERE|
     |                   |                       | ah.iddv IN (1,3)    |
     |                   |                       | AND ah.action='Bật' |
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 14. Re-render bảng    |                     |
     |<-- Bảng lọc Bật --|                       |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng lọc theo trạng thái ~~~   |
     |                   |                       |                     |
     | 15. Chọn checkbox |                       |                     |
     | "Thành công"      |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 16. Cập nhật          |                     |
     |                   | statuses=['Thành công']                    |
     |                   | Reset page=1          |                     |
     |                   | GET /api/actions/history                   |
     |                   | ?page=1&limit=10      |                     |
     |                   | &devices=1,3          |                     |
     |                   | &actions=Bật          |                     |
     |                   | &statuses=Thành công  |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 17. SELECT ... WHERE|
     |                   |                       | ah.iddv IN (1,3)    |
     |                   |                       | AND ah.action='Bật' |
     |                   |                       | AND ah.status=      |
     |                   |                       | 'Thành công'        |
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 18. Re-render bảng    |                     |
     |<-- Kết quả lọc ---|                       |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng tìm kiếm theo thời gian ~~|
     |                   |                       |                     |
     | 19. Nhập thời gian|                       |                     |
     | vào ô tìm kiếm    |                       |                     |
     | (ví dụ: "2024-01")|                       |                     |
     |---- input ------->|                       |                     |
     |                   | 20. Debounce 500ms    |                     |
     |                   | Cập nhật              |                     |
     |                   | searchTime='2024-01'  |                     |
     |                   | Reset page=1          |                     |
     |                   | GET /api/actions/history                   |
     |                   | ?page=1&limit=10      |                     |
     |                   | &searchTime=2024-01   |                     |
     |                   | &devices=1,3          |                     |
     |                   | &actions=Bật          |                     |
     |                   | &statuses=Thành công  |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 21. SELECT ... WHERE|
     |                   |                       | ...                 |
     |                   |                       | AND ah.time LIKE    |
     |                   |                       | '%2024-01%'         |
     |                   |                       | LIMIT 10 OFFSET 0  |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 22. Re-render bảng    |                     |
     |<-- Kết quả tìm ---|                       |                     |
     |                   |                       |                     |
     |                   |   ~~~ Người dùng chuyển trang ~~~          |
     |                   |                       |                     |
     | 23. Click trang 2 |                       |                     |
     |---- click ------->|                       |                     |
     |                   | 24. Cập nhật page=2   |                     |
     |                   | GET /api/actions/history                   |
     |                   | ?page=2&limit=10&...  |                     |
     |                   | (giữ nguyên toàn bộ   |                     |
     |                   | filter hiện tại)      |                     |
     |                   |---------- HTTP GET --->|                     |
     |                   |                       | 25. SELECT ...      |
     |                   |                       | LIMIT 10 OFFSET 10 |
     |                   |                       |------ SELECT ------>|
     |                   |                       |<----- rows[] -------|
     |                   |<-- 200 { data[], pagination } -------------|
     |                   | 26. Re-render bảng    |                     |
     |<-- Trang 2 --------|                      |                     |
