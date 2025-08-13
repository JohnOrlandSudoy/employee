# 🧪 **Complete Postman WebSocket Testing Guide**

## 🚀 **WebSocket Server URL**
```
ws://localhost:3001
```

## 📋 **Prerequisites**
1. **Start Enhanced Location Server:**
   ```bash
   cd websocket-server
   node server-location.js
   ```

2. **Expected Server Output:**
   ```
   🚌 Enhanced Real-Time Location WebSocket Server Starting...
   📍 Optimized for accurate GPS tracking and device location
   📱 Supports high-precision location updates
   🚀 Enhanced Real-Time Location WebSocket Server running on port 3001
   📡 Connect to: ws://localhost:3001
   👥 Ready to handle precise location tracking!
   ```

## 🔌 **Postman Setup**

### **Step 1: Create WebSocket Request**
1. **Open Postman**
2. **Click "New" → "WebSocket Request"**
3. **Enter URL:** `ws://localhost:3001`
4. **Click "Connect"**

### **Step 2: Verify Connection**
- **Status should show "Connected"**
- **You should receive welcome message with client ID**

## 📱 **Test Message Templates**

### **1. Test Connection (Ping)**
```json
{
  "type": "ping",
  "data": {}
}
```

**Expected Response:**
```json
{
  "type": "pong",
  "data": {
    "message": "Server is alive",
    "timestamp": "2024-08-12T01:20:00.000Z",
    "clientId": "abc123",
    "serverStatus": {
      "uptime": 120.5,
      "totalClients": 1,
      "adminClients": 0,
      "employeeClients": 0,
      "totalLocations": 0
    }
  }
}
```

### **2. Get Server Status**
```json
{
  "type": "get_status",
  "data": {}
}
```

**Expected Response:**
```json
{
  "type": "server_status",
  "data": {
    "timestamp": "2024-08-12T01:20:00.000Z",
    "serverInfo": {
      "uptime": 120.5,
      "totalClients": 1,
      "adminClients": 0,
      "employeeClients": 0,
      "version": "2.0.0"
    },
    "locationInfo": {
      "totalEmployees": 0,
      "totalLocations": 0,
      "lastUpdate": "1970-01-01T00:00:00.000Z"
    },
    "clientInfo": {
      "clientId": "abc123",
      "isAdmin": false,
      "isEmployee": false
    }
  }
}
```

### **3. Connect as Admin**
```json
{
  "type": "admin_connected",
  "data": {
    "role": "admin",
    "name": "Postman Admin"
  }
}
```

**Expected Response:**
```json
{
  "type": "employee_statuses",
  "data": {
    "employees": [],
    "totalEmployees": 0,
    "timestamp": "2024-08-12T01:20:00.000Z"
  }
}
```

### **4. Connect as Employee**
```json
{
  "type": "employee_connected",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "role": "employee"
  }
}
```

**Expected Response:**
```json
{
  "type": "employee_connected",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "timestamp": "2024-08-12T01:20:00.000Z",
    "totalEmployees": 1
  }
}
```

### **5. Send Standard Location Update**
```json
{
  "type": "location_update",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "timestamp": "2024-08-12T01:20:00.000Z",
    "busNumber": "BUS-POSTMAN-001",
    "accuracy": 5.2
  }
}
```

**Expected Response:**
```json
{
  "type": "location_confirmed",
  "data": {
    "message": "Location update sent to admin",
    "timestamp": "2024-08-12T01:20:00.000Z",
    "adminCount": 1,
    "locationNumber": 1,
    "accuracy": 5.2
  }
}
```

### **6. Send Device-Specific Location (High Precision)**
```json
{
  "type": "device_location",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "deviceInfo": {
      "deviceType": "mobile",
      "userAgent": "PostmanRuntime/7.32.3",
      "platform": "Win32",
      "language": "en-US"
    },
    "accuracy": 3.5,
    "speed": 2.1,
    "heading": 180.5,
    "timestamp": "2024-08-12T01:20:00.000Z"
  }
}
```

**Expected Response:**
```json
{
  "type": "device_location_confirmed",
  "data": {
    "message": "Device location sent to admin",
    "timestamp": "2024-08-12T01:20:00.000Z",
    "adminCount": 1,
    "locationNumber": 2
  }
}
```

### **7. Test Location Message**
```json
{
  "type": "test_location",
  "data": {
    "message": "Testing location handling",
    "testCoordinates": {
      "lat": 40.7589,
      "lng": -73.9851
    },
    "testId": "test_001"
  }
}
```

**Expected Response:**
```json
{
  "type": "test_location_response",
  "data": {
    "message": "Test location received successfully",
    "originalLocation": {
      "message": "Testing location handling",
      "testCoordinates": {
        "lat": 40.7589,
        "lng": -73.9851
      },
      "testId": "test_001"
    },
    "timestamp": "2024-08-12T01:20:00.000Z",
    "clientId": "abc123",
    "serverInfo": {
      "totalClients": 2,
      "locationHistorySize": 1
    }
  }
}
```

### **8. Get Location History**
```json
{
  "type": "get_location_history",
  "data": {
    "employeeId": "emp_postman_001"
  }
}
```

**Expected Response:**
```json
{
  "type": "location_history",
  "data": {
    "employeeId": "emp_postman_001",
    "history": {
      "count": 2,
      "lastLocation": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "firstSeen": "2024-08-12T01:20:00.000Z",
      "lastSeen": "2024-08-12T01:20:00.000Z",
      "accuracy": 3.5,
      "busNumber": "BUS-POSTMAN-001",
      "deviceInfo": {
        "deviceType": "mobile",
        "userAgent": "PostmanRuntime/7.32.3",
        "platform": "Win32",
        "language": "en-US"
      },
      "speed": 2.1,
      "heading": 180.5
    },
    "timestamp": "2024-08-12T01:20:00.000Z"
  }
}
```

## 🧪 **Testing Scenarios**

### **Scenario 1: Basic Connection Test**
1. **Connect to WebSocket**
2. **Send ping message**
3. **Verify pong response**
4. **Check server status**

### **Scenario 2: Admin Monitoring Test**
1. **Connect as admin**
2. **Check employee statuses (should be empty)**
3. **Monitor for employee connections**

### **Scenario 3: Employee Location Tracking Test**
1. **Connect as employee**
2. **Send location updates**
3. **Verify admin notifications**
4. **Check location history**

### **Scenario 4: High-Precision Device Location Test**
1. **Connect as employee**
2. **Send device-specific location with accuracy, speed, heading**
3. **Verify enhanced location data**
4. **Check admin receives detailed information**

### **Scenario 5: Multiple Client Test**
1. **Open multiple Postman tabs**
2. **Connect as admin in one tab**
3. **Connect as employee in another tab**
4. **Send location updates from employee**
5. **Verify admin receives real-time updates**

## 📊 **Real-Time Location Testing**

### **Simulate Moving Bus**
```json
// Location 1: Starting point
{
  "type": "device_location",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "deviceInfo": { "deviceType": "mobile" },
    "accuracy": 5.0,
    "speed": 0.0,
    "heading": 0.0,
    "timestamp": "2024-08-12T01:20:00.000Z"
  }
}

// Location 2: Moving north
{
  "type": "device_location",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "location": { "lat": 40.7130, "lng": -74.0060 },
    "deviceInfo": { "deviceType": "mobile" },
    "accuracy": 4.2,
    "speed": 2.5,
    "heading": 0.0,
    "timestamp": "2024-08-12T01:20:30.000Z"
  }
}

// Location 3: Moving east
{
  "type": "device_location",
  "data": {
    "employeeId": "emp_postman_001",
    "busId": "bus_postman_001",
    "location": { "lat": 40.7130, "lng": -74.0058 },
    "deviceInfo": { "deviceType": "mobile" },
    "accuracy": 3.8,
    "speed": 3.1,
    "heading": 90.0,
    "timestamp": "2024-08-12T01:21:00.000Z"
  }
}
```

## 🔍 **Monitoring & Verification**

### **Server Console Output**
Watch the server console for detailed logging:
- 📨 Message received
- 📤 Message sent
- 📍 Location updates
- 📱 Device locations
- 👨‍💼 Admin connections
- 👷 Employee connections

### **Admin Dashboard Verification**
1. **Open admin-dashboard.html**
2. **Connect to WebSocket**
3. **Watch for real-time updates**
4. **Verify bus icons appear and move**

### **Location Accuracy Verification**
- **Accuracy values** should be in meters
- **Speed values** should be in m/s
- **Heading values** should be in degrees (0-360)
- **Timestamps** should be recent and sequential

## 🚨 **Troubleshooting**

### **Connection Issues**
- Ensure server is running on port 3001
- Check firewall settings
- Verify WebSocket URL format

### **Message Errors**
- Check JSON format
- Verify message type is supported
- Ensure required fields are present

### **Location Not Updating**
- Check employee connection status
- Verify admin is connected
- Monitor server console for errors

## 🎯 **Success Criteria**

✅ **WebSocket connection established**
✅ **Ping/pong working**
✅ **Admin can connect and monitor**
✅ **Employee can send location updates**
✅ **Real-time location broadcasting working**
✅ **Location history tracking working**
✅ **Device-specific location data working**
✅ **Admin dashboard showing live updates**

---

**Happy Testing! 🚌✨**

Your enhanced WebSocket server is now ready for precise real-time location tracking with Postman!
