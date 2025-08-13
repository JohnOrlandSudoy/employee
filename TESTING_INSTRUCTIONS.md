# 🚌 Real-Time Bus Tracking Testing Guide

## 🎯 **Overview**
This guide will help you test the real-time location tracking system using WebSocket technology. The system allows bus employees to send their current location to admin users in real-time.

## 🏗️ **System Architecture**
```
Employee App (React) ←→ WebSocket Server ←→ Admin Dashboard
     ↓                      ↓                    ↓
GPS Location         Real-time Relay      Live Map Display
Updates             Location Broadcast    Bus Icon Tracking
```

## 🚀 **Setup Instructions**

### **1. Install WebSocket Server Dependencies**
```bash
cd websocket-server
npm install
```

### **2. Start WebSocket Server**
```bash
npm start
# or for development with auto-restart
npm run dev
```

**Expected Output:**
```
🚌 Bus Tracking WebSocket Server Starting...
🚀 WebSocket Server running on port 3001
📡 Connect to: ws://localhost:3001
👥 Ready to handle bus tracking connections!
```

### **3. Start Your React App**
```bash
npm run dev
```

### **4. Open Admin Dashboard**
Open `admin-dashboard.html` in your browser.

## 🧪 **Testing Scenarios**

### **Scenario 1: Basic Connection Test**
1. **Start WebSocket server** (should show "Ready to handle connections")
2. **Open admin dashboard** in browser
3. **Click "Connect"** button
4. **Expected Result:** Status should change to "Connected" with green dot

### **Scenario 2: Employee Connection Test**
1. **Ensure WebSocket server is running**
2. **Login to employee app** with valid credentials
3. **Expected Result:** 
   - WebSocket status should show "Live" in employee app
   - Admin dashboard should show "Employee connected" message
   - Active buses count should increase

### **Scenario 3: Real-time Location Tracking**
1. **Complete Scenario 2**
2. **Allow GPS permission** in employee app
3. **Move around** (or simulate movement)
4. **Expected Result:**
   - Bus icon should appear on admin map
   - Location updates should appear in live updates
   - Bus marker should move in real-time

### **Scenario 4: Multiple Employees**
1. **Open employee app in multiple browser tabs**
2. **Login with different employee accounts**
3. **Expected Result:**
   - Multiple bus icons on admin map
   - Each bus tracked independently
   - Active buses count should match connected employees

### **Scenario 5: Connection Recovery**
1. **Disconnect WebSocket server** (Ctrl+C)
2. **Observe employee app** (should show "Offline")
3. **Restart WebSocket server**
4. **Expected Result:**
   - Employee app should automatically reconnect
   - Status should return to "Live"
   - Admin should see reconnection

## 🔍 **Testing Checklist**

### **Employee App Testing**
- [ ] WebSocket connection status indicator
- [ ] GPS permission request
- [ ] Real-time location updates
- [ ] Connection recovery after disconnection
- [ ] Error handling for connection failures

### **Admin Dashboard Testing**
- [ ] WebSocket connection establishment
- [ ] Employee connection notifications
- [ ] Live location updates on map
- [ ] Bus icon movement tracking
- [ ] Active buses list updates
- [ ] Connection status indicators

### **WebSocket Server Testing**
- [ ] Server startup and port binding
- [ ] Client connection handling
- [ ] Message routing and broadcasting
- [ ] Client disconnection cleanup
- [ ] Error handling and logging

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. WebSocket Connection Failed**
```
Error: Failed to create WebSocket connection
```
**Solution:**
- Ensure WebSocket server is running on port 3001
- Check firewall settings
- Verify `VITE_WS_URL` environment variable

#### **2. GPS Not Working**
```
Error: Geolocation is not supported
```
**Solution:**
- Use HTTPS (required for GPS in modern browsers)
- Allow location permissions in browser
- Test on mobile device for better GPS accuracy

#### **3. Map Not Loading**
```
Error: Map tiles not loading
```
**Solution:**
- Check internet connection
- Verify Leaflet CSS/JS imports
- Check browser console for errors

#### **4. Location Updates Not Appearing**
```
Error: No location updates in admin dashboard
```
**Solution:**
- Verify WebSocket connection status
- Check employee app GPS permissions
- Ensure bus data is loaded before WebSocket connection

## 📱 **Mobile Testing**

### **Android Chrome**
1. **Enable Developer Options**
2. **Enable USB Debugging**
3. **Use Chrome DevTools** for mobile simulation
4. **Test GPS accuracy** with real movement

### **iOS Safari**
1. **Use Safari Web Inspector**
2. **Test on physical device** for GPS
3. **Verify location permissions**

## 🔧 **Performance Testing**

### **Load Testing**
1. **Connect multiple employees** (10+ simultaneous)
2. **Monitor WebSocket server** performance
3. **Check memory usage** and CPU
4. **Test location update frequency** (every 1-5 seconds)

### **Network Testing**
1. **Simulate slow connections** (3G/2G)
2. **Test connection recovery** after network drops
3. **Verify message delivery** under poor conditions

## 📊 **Monitoring & Logs**

### **WebSocket Server Logs**
```bash
# Monitor real-time logs
tail -f websocket-server.log

# Check connection status
netstat -an | grep 3001
```

### **Browser Console Logs**
- **Employee App:** WebSocket connection status
- **Admin Dashboard:** Message handling and map updates
- **Network Tab:** WebSocket message flow

## 🎉 **Success Criteria**

### **Functional Requirements**
- ✅ Real-time location updates every 1-5 seconds
- ✅ Live map display with moving bus icons
- ✅ Automatic connection recovery
- ✅ Multi-employee support
- ✅ Admin notification system

### **Performance Requirements**
- ✅ Location update latency < 100ms
- ✅ Connection recovery < 5 seconds
- ✅ Support for 50+ simultaneous connections
- ✅ Stable performance under load

### **User Experience**
- ✅ Clear connection status indicators
- ✅ Smooth map animations
- ✅ Intuitive admin interface
- ✅ Responsive design on all devices

## 🚀 **Next Steps After Testing**

1. **Deploy to staging environment**
2. **Test with real GPS devices**
3. **Implement production WebSocket server**
4. **Add authentication and security**
5. **Set up monitoring and alerting**
6. **Performance optimization**

---

**Happy Testing! 🚌✨**
