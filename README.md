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
     |                   |--------- HTTP GET --->|                     |                    |                  |
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
     |                   |                       | giữ 30 điểm cuối    |                    |                  |
     |                   |<-- 200 { data[], pagination } --------------|                    |                  |
     |                   | 6. Render chart với   |                     |                    |                  |
     |                   | 30 điểm dữ liệu       |                     |                    |                  |
     |<-- Hiện biểu đồ --|                       |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   | 7. GET /api/devices/status                  |                    |                  |
     |                   |--------- HTTP GET --->|                     |                    |                  |
     |                   |                       | 8. SELECT ah.action,|                    |                  |
     |                   |                       | ah.status FROM      |                    |                  |
     |                   |                       | action_history ah   |                    |                  |
     |                   |                       | WHERE iddv IN (1,2,3)                    |                  |
     |                   |                       | ORDER BY time DESC  |                    |                  |
     |                   |                       | LIMIT 1 per device  |                    |                  |
     |                   |                       |------ SELECT ------>|                    |                  |
     |                   |                       |<----- rows[] -------|                    |                  |
     |                   |<-- 200 { data: {fan, pump, light}, pending }|                    |                  |
     |                   | 9. Render trạng thái  |                     |                    |                  |
     |                   | thiết bị (ON/OFF)     |                     |                    |                  |
     |<-- Hiện switch ---|                       |                     |                    |                  |
     |                   |                       |                     |                    |                  |
     |                   |                       |                     |     Realtime loop bắt đầu             |
     |                   |                       |                     |                    |                  |
     |                   |                       |                     |        10. Publish sensors/data       |
     |                   |                       |                     |            { temp, hum, light }       |
     |                   |                       |                     |<--- MQTT pub ------| <-- publish -----|
     |                   |                       | 11. Subscribe nhận  |                    |                  |
     |                   |                       | topic sensors/data  |                    |                  |
     |                   |                       |<=================== MQTT message ========|                  |
     |                   |                       | 12. INSERT INTO data_sensors             |                  |
     |                   |                       | (idss=1, value=temp) -- x3 sensor        |                  |
     |                   |                       |------ INSERT x3 --->|                    |                  |
     |                   |                       |<----- OK -----------|                    |                  |
     |                   |                       | 13. socket.emit(    |                    |                  |
     |                   |                       | 'update_dashboard', |                    |                  |
     |                   |                       | { time, temp,       |                    |                  |
     |                   |                       |   hum, light })     |                    |                  |
     |                   |<====== Socket.io event 'update_dashboard' ==|                    |                  |
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


Người dùng          FE (DataSensor)              BE (Express)                CSDL (MySQL)
     |                     |                            |                          |
     | 1. Vào trang        |                            |                          |
     |   /data-sensor      |                            |                          |
     |---- navigate ------>|                            |                          |
     |                     | 2. Khởi tạo state mặc định:|                          |
     |                     |   page=1, limit=10         |                          |
     |                     |   selectedSensor='all'     |                          |
     |                     |   selectedCriteria='time'  |                          |
     |                     |   sortConfig={key:'time',  |                          |
     |                     |     direction:'desc'}      |                          |
     |                     |                            |                          |
     |                     | 3. Build filterBy:          |                          |
     |                     |   sensor='all'             |                          |
     |                     |   → ['temp','hum','light'] |                          |
     |                     |   + criteria='time'        |                          |
     |                     |   → filterBy='temp,hum,    |                          |
     |                     |     light,time'            |                          |
     |                     |                            |                          |
     |                     | 4. GET /api/sensors/data   |                          |
     |                     |   ?page=1&limit=10         |                          |
     |                     |   &sortKey=time            |                          |
     |                     |   &sortDir=desc            |                          |
     |                     |   &searchText=             |                          |
     |                     |   &filterBy=temp,hum,      |                          |
     |                     |     light,time             |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 5. Parse filterBy:       |
     |                     |                            |   temp→1, hum→2, light→3 |
     |                     |                            |   → ds.idss IN (1,2,3)   |
     |                     |                            |   criteria='time' → tìm  |
     |                     |                            |   theo thời gian nếu có  |
     |                     |                            |   searchText             |
     |                     |                            |                          |
     |                     |                            | 6. SELECT COUNT(*) as    |
     |                     |                            | total FROM data_sensors  |
     |                     |                            | ds JOIN sensors s ON     |
     |                     |                            | ds.idss=s.id             |
     |                     |                            | WHERE ds.idss IN (1,2,3) |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- count ----------|
     |                     |                            |                          |
     |                     |                            | 7. Sort key='time'       |
     |                     |                            | → ORDER BY ds.time DESC, |
     |                     |                            |   ds.id DESC             |
     |                     |                            |                          |
     |                     |                            | 8. SELECT ds.id, s.name, |
     |                     |                            | ds.value, ds.time ...    |
     |                     |                            | ORDER BY ds.time DESC,   |
     |                     |                            |   ds.id DESC             |
     |                     |                            | LIMIT 10 OFFSET 0       |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |                            |                          |
     |                     |<-- 200 { success, data[],  |                          |
     |                     |  pagination: {currentPage:1|                          |
     |                     |  totalPages, totalItems,   |                          |
     |                     |  itemsPerPage:10} } -------|                          |
     |                     |                            |                          |
     |                     | 9. Format mỗi row:         |                          |
     |                     |   new Date(item.time) →    |                          |
     |                     |   date: "2024/01/15"       |                          |
     |                     |   time: "08:30:45"         |                          |
     |                     | 10. Render bảng + pagination|                         |
     |<-- Hiện bảng -------|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Lọc theo 1 loại cảm biến (single-select) ~~~~~~~~                |
     |                     |                            |                          |
     | 11. Mở dropdown     |                            |                          |
     |   "Tất cả cảm biến"|                            |                          |
     |   → Chọn "Nhiệt độ"|                            |                          |
     |---- click --------->|                            |                          |
     |                     | 12. setSelectedSensor('temp')                         |
     |                     |   Menu tự đóng             |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |   Build filterBy:           |                          |
     |                     |   sensor='temp' → ['temp'] |                          |
     |                     |   + criteria='time'        |                          |
     |                     |   → filterBy='temp,time'   |                          |
     |                     |                            |                          |
     |                     | 13. GET /api/sensors/data  |                          |
     |                     |   ?page=1&limit=10         |                          |
     |                     |   &filterBy=temp,time      |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 14. Parse: temp→1        |
     |                     |                            | WHERE ds.idss IN (1)     |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |                     | 15. Re-render bảng         |                          |
     |<-- Chỉ hiện nhiệt độ|                           |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Chọn tiêu chí tìm kiếm (single-select) ~~~~~~~~                  |
     |                     |                            |                          |
     | 16. Mở dropdown     |                            |                          |
     |   "Thời gian"       |                            |                          |
     |   → Chọn "Giá trị" |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 17. setSelectedCriteria('value')                      |
     |                     |   Build filterBy:           |                          |
     |                     |   → filterBy='temp,value'  |                          |
     |                     |                            |                          |
     |                     | 18. GET /api/sensors/data  |                          |
     |                     |   &filterBy=temp,value     |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 19. Parse: temp→1,       |
     |                     |                            | criteria='value'         |
     |                     |                            | → searchText sẽ tìm trên|
     |                     |                            |   CAST(ds.value) LIKE    |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Bảng cập nhật ---|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Tìm kiếm (debounce 500ms) ~~~~~~~~                               |
     |                     |                            |                          |
     | 20. Gõ "25" vào ô   |                            |                          |
     |   tìm kiếm          |                            |                          |
     |---- input --------->|                            |                          |
     |                     | 21. setSearchInput('25')   |                          |
     |                     |   Debounce 500ms chờ ngừng |                          |
     |                     |   gõ → debouncedSearch='25'|                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |                            |                          |
     |                     | 22. GET /api/sensors/data  |                          |
     |                     |   &searchText=25           |                          |
     |                     |   &filterBy=temp,value     |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 23. criteria có 'value'  |
     |                     |                            | → WHERE ds.idss IN (1)   |
     |                     |                            |   AND (CAST(ds.value     |
     |                     |                            |   AS CHAR) LIKE '%25%')  |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Kết quả tìm -----|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Sắp xếp bằng click header bảng ~~~~~~~~                           |
     |                     |                            |                          |
     | 24. Click header    |                            |                          |
     |   cột "GIÁ TRỊ"    |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 25. handleSort('value'):   |                          |
     |                     |   sortConfig.key != 'value'|                          |
     |                     |   → direction = 'desc'     |                          |
     |                     |   (mặc định click đầu)     |                          |
     |                     |   setSortConfig({          |                          |
     |                     |     key:'value',           |                          |
     |                     |     direction:'desc'})     |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |                            |                          |
     |                     | 26. GET /api/sensors/data  |                          |
     |                     |   &sortKey=value           |                          |
     |                     |   &sortDir=desc            |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 27. sort.key='value'     |
     |                     |                            | → ORDER BY ds.value DESC,|
     |                     |                            |   ds.id DESC             |
     |                     |                            | (sort name/value: tiêu   |
     |                     |                            |  chí phụ luôn id DESC)   |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |                     | 28. Render: icon cột       |                          |
     |                     |   GIÁ TRỊ = ArrowDown xanh|                          |
     |                     |   các cột khác = ArrowUpDown|                         |
     |<-- Bảng sắp xếp ----|                           |                          |
     |                     |                            |                          |
     | 29. Click lại header|                            |                          |
     |   cột "GIÁ TRỊ"    |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 30. handleSort('value'):   |                          |
     |                     |   key='value' && dir='desc'|                          |
     |                     |   → direction = 'asc'      |                          |
     |                     |                            |                          |
     |                     | 31. GET /api/sensors/data  |                          |
     |                     |   &sortKey=value           |                          |
     |                     |   &sortDir=asc             |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 32. ORDER BY ds.value ASC|
     |                     |                            |   ds.id DESC             |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |                     | 33. Icon = ArrowUp xanh    |                          |
     |<-- Bảng đảo chiều --|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Phân trang ~~~~~~~~                                               |
     |                     |                            |                          |
     | 34. Click nút trang 3|                           |                          |
     |---- click --------->|                            |                          |
     |                     | 35. setCurrentPage(3)      |                          |
     |                     | GET /api/sensors/data      |                          |
     |                     |   ?page=3&limit=10&...     |                          |
     |                     |   (giữ nguyên filter,      |                          |
     |                     |    criteria, sort hiện tại)|                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 36. LIMIT 10 OFFSET 20  |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Trang 3 ----------|                           |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Thay đổi số bản ghi / trang ~~~~~~~~                              |
     |                     |                            |                          |
     | 37. Sửa ô "Hiển thị"|                           |                          |
     |   từ 10 → 50, Enter |                            |                          |
     |---- input+Enter --->|                            |                          |
     |                     | 38. applyLimit():          |                          |
     |                     |   50 hợp lệ (1-1000)      |                          |
     |                     |   setItemsPerPage(50)      |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     | GET /api/sensors/data      |                          |
     |                     |   ?page=1&limit=50&...     |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 39. LIMIT 50 OFFSET 0   |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- 50 dòng / trang --|                           |                          |


Người dùng          FE (ActionHistory)           BE (Express)                CSDL (MySQL)
     |                     |                            |                          |
     | 1. Vào trang        |                            |                          |
     |   /action-history   |                            |                          |
     |---- navigate ------>|                            |                          |
     |                     | 2. Khởi tạo state mặc định:|                          |
     |                     |   page=1, limit=10         |                          |
     |                     |   selectedDevices='all'    |                          |
     |                     |   selectedActions='all'    |                          |
     |                     |   selectedStatuses='all'   |                          |
     |                     |   searchInput=''           |                          |
     |                     |                            |                          |
     |                     | 3. Build query params:      |                          |
     |                     |   devices='all' → '1,2,3'  |                          |
     |                     |   actions='all' → 'Bật,Tắt'|                          |
     |                     |   statuses='all' →          |                          |
     |                     |     'Thành công,Thất bại,Chờ'|                        |
     |                     |                            |                          |
     |                     | 4. GET /api/actions/history|                          |
     |                     |   ?page=1&limit=10         |                          |
     |                     |   &searchTime=             |                          |
     |                     |   &devices=1,2,3           |                          |
     |                     |   &actions=Bật,Tắt         |                          |
     |                     |   &statuses=Thành công,    |                          |
     |                     |     Thất bại,Chờ           |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 5. Parse params:         |
     |                     |                            |   devices → [1,2,3]      |
     |                     |                            |   actions → ['Bật','Tắt']|
     |                     |                            |   statuses→ ['Thành công'|
     |                     |                            |     'Thất bại','Chờ']    |
     |                     |                            |                          |
     |                     |                            | 6. SELECT COUNT(*) as    |
     |                     |                            | total FROM action_history |
     |                     |                            | ah JOIN devices d ON     |
     |                     |                            | ah.iddv=d.id             |
     |                     |                            | WHERE ah.iddv IN (1,2,3) |
     |                     |                            |   AND ah.action IN       |
     |                     |                            |     ('Bật','Tắt')        |
     |                     |                            |   AND ah.status IN       |
     |                     |                            |     ('Thành công',       |
     |                     |                            |      'Thất bại','Chờ')   |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- count ----------|
     |                     |                            |                          |
     |                     |                            | 7. SELECT ah.id,         |
     |                     |                            |   d.name as device,      |
     |                     |                            |   ah.action, ah.status,  |
     |                     |                            |   ah.time ...            |
     |                     |                            | ORDER BY ah.id DESC      |
     |                     |                            | LIMIT 10 OFFSET 0       |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |                            |                          |
     |                     |<-- 200 { success, data[],  |                          |
     |                     |  pagination } -------------|                          |
     |                     |                            |                          |
     |                     | 8. Format mỗi row:         |                          |
     |                     |   date: "2024/01/15"       |                          |
     |                     |   time: "08:30:45"         |                          |
     |                     |   action → badge xanh/đỏ   |                          |
     |                     |   status → badge xanh/đỏ/  |                          |
     |                     |     xám                    |                          |
     |                     | 9. Render bảng + pagination|                          |
     |<-- Hiện bảng -------|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Lọc thiết bị (single-select) ~~~~~~~~                             |
     |                     |                            |                          |
     | 10. Mở dropdown     |                            |                          |
     |   "Tất cả thiết bị" |                            |                          |
     |   → Chọn "Quạt"    |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 11. setSelectedDevices(1)  |                          |
     |                     |   Menu tự đóng             |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |   Build: devices=1         |                          |
     |                     |   (không phải '1,2,3')     |                          |
     |                     |                            |                          |
     |                     | 12. GET /api/actions/history|                         |
     |                     |   &devices=1               |                          |
     |                     |   &actions=Bật,Tắt         |                          |
     |                     |   &statuses=Thành công,... |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 13. WHERE ah.iddv IN (1) |
     |                     |                            |   AND ah.action IN (...) |
     |                     |                            |   AND ah.status IN (...) |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Chỉ hiện Quạt ---|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Lọc hành động (single-select) ~~~~~~~~                            |
     |                     |                            |                          |
     | 14. Mở dropdown     |                            |                          |
     |   "Tất cả hành động"|                            |                          |
     |   → Chọn "Bật"     |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 15. setSelectedActions('Bật')                         |
     |                     |   Menu tự đóng             |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |   Build: actions=Bật       |                          |
     |                     |                            |                          |
     |                     | 16. GET /api/actions/history|                         |
     |                     |   &devices=1               |                          |
     |                     |   &actions=Bật             |                          |
     |                     |   &statuses=Thành công,... |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 17. WHERE ah.iddv IN (1) |
     |                     |                            |   AND ah.action IN ('Bật')|
     |                     |                            |   AND ah.status IN (...) |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Quạt + Bật only --|                           |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Lọc trạng thái (single-select) ~~~~~~~~                           |
     |                     |                            |                          |
     | 18. Mở dropdown     |                            |                          |
     |   "Tất cả trạng thái"|                           |                          |
     |   → Chọn "Thất bại"|                            |                          |
     |---- click --------->|                            |                          |
     |                     | 19. setSelectedStatuses('Thất bại')                   |
     |                     |   Menu tự đóng             |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |   Build: statuses=Thất bại |                          |
     |                     |                            |                          |
     |                     | 20. GET /api/actions/history|                         |
     |                     |   &devices=1               |                          |
     |                     |   &actions=Bật             |                          |
     |                     |   &statuses=Thất bại      |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 21. WHERE ah.iddv IN (1) |
     |                     |                            |   AND ah.action IN ('Bật')|
     |                     |                            |   AND ah.status IN       |
     |                     |                            |     ('Thất bại')         |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Quạt+Bật+Thất bại|                           |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Tìm kiếm theo thời gian (debounce 500ms) ~~~~~~~~                |
     |                     |                            |                          |
     | 22. Gõ "2024/01"    |                            |                          |
     |   vào ô tìm kiếm   |                            |                          |
     |---- input --------->|                            |                          |
     |                     | 23. setSearchInput('2024/01')                         |
     |                     |   Debounce 500ms           |                          |
     |                     |   → debouncedSearch=       |                          |
     |                     |     '2024/01'              |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     |                            |                          |
     |                     | 24. GET /api/actions/history|                         |
     |                     |   &searchTime=2024/01      |                          |
     |                     |   &devices=1&actions=Bật   |                          |
     |                     |   &statuses=Thất bại      |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 25. WHERE ... AND (       |
     |                     |                            |   CAST(ah.time AS CHAR)  |
     |                     |                            |     LIKE '%2024/01%'     |
     |                     |                            |   OR DATE_FORMAT(ah.time,|
     |                     |                            |     '%Y/%m/%d-%H:%i:%s') |
     |                     |                            |     LIKE '%2024/01%'     |
     |                     |                            |   OR DATE_FORMAT(ah.time,|
     |                     |                            |     '%Y%m%d%H%i%s')      |
     |                     |                            |     LIKE '%202401%'      |
     |                     |                            |   OR DATE_FORMAT(ah.time,|
     |                     |                            |     '%Y-%m-%d %H:%i:%s') |
     |                     |                            |     LIKE '%2024/01%' )   |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Kết quả tìm -----|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Phân trang ~~~~~~~~                                               |
     |                     |                            |                          |
     | 26. Click trang 2   |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 27. setCurrentPage(2)      |                          |
     |                     | GET /api/actions/history   |                          |
     |                     |   ?page=2&limit=10         |                          |
     |                     |   (giữ nguyên tất cả       |                          |
     |                     |    filter + search)        |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 28. LIMIT 10 OFFSET 10  |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- Trang 2 ----------|                           |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Thay đổi số bản ghi / trang ~~~~~~~~                              |
     |                     |                            |                          |
     | 29. Sửa ô "Hiển thị"|                           |                          |
     |   từ 10 → 100, Enter|                            |                          |
     |---- input+Enter --->|                            |                          |
     |                     | 30. applyLimit():          |                          |
     |                     |   100 hợp lệ (1-1000)     |                          |
     |                     |   setItemsPerPage(100)     |                          |
     |                     |   setCurrentPage(1)        |                          |
     |                     | GET /api/actions/history   |                          |
     |                     |   ?page=1&limit=100&...    |                          |
     |                     |---------- HTTP GET ------->|                          |
     |                     |                            | 31. LIMIT 100 OFFSET 0  |
     |                     |                            |--------- SELECT -------->|
     |                     |                            |<-------- rows[] ---------|
     |                     |<-- 200 { data[] } ---------|                          |
     |<-- 100 dòng/trang --|                            |                          |
     |                     |                            |                          |
     |  ~~~~~~~~ Copy thời gian ~~~~~~~~                                           |
     |                     |                            |                          |
     | 32. Click icon Copy |                            |                          |
     |   cạnh ô thời gian  |                            |                          |
     |---- click --------->|                            |                          |
     |                     | 33. navigator.clipboard    |                          |
     |                     |   .writeText(              |                          |
     |                     |   "2024/01/15 - 08:30:45") |                          |
     |                     | (xử lý hoàn toàn ở FE,    |                          |
     |                     |  không gọi API)            |                          |
     |<-- Đã copy ----------|                           |                          |
