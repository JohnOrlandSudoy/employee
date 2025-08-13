# 🚀 Quick Start Guide - Real-Time Bus Tracking

## ⚡ **Fast Setup (3 Steps)**

### **Step 1: Install Dependencies**
```bash
# Install React app dependencies
npm install

# Install WebSocket server dependencies
cd websocket-server
npm install
cd ..
```

### **Step 2: Start WebSocket Server**
```bash
# Option A: Using npm script
npm run websocket

# Option B: Direct command
cd websocket-server
node server.js

# Option C: Windows batch file
websocket-server\start.bat
```

**Expected Output:**
```
🚌 Bus Tracking WebSocket Server Starting...
🚀 WebSocket Server running on port 3001
👥 Ready to handle bus tracking connections!
```

### **Step 3: Start React App**
```bash
# In a new terminal
npm run dev
```

## 🧪 **Test the System**

### **1. Open Admin Dashboard**
- Open `admin-dashboard.html` in your browser
- Click "Connect" button
- Should show "Connected" with green dot

### **2. Test Employee App**
- Open React app in browser
- Login with employee credentials
- Check WebSocket status shows "Live"

### **3. Test Real-time Tracking**
- Allow GPS permissions
- Move around (or simulate movement)
- Watch admin dashboard for live updates

## 🔧 **Troubleshooting**

### **WebSocket Server Won't Start**
```bash
# Check if port 3001 is free
netstat -an | findstr :3001

# Kill process using port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### **Connection Failed**
- Ensure WebSocket server is running
- Check browser console for errors
- Verify `VITE_WS_URL=ws://localhost:3001` in environment

### **GPS Not Working**
- Use HTTPS or localhost
- Allow location permissions
- Test on mobile device

## 📱 **Mobile Testing**
```bash
# Get your local IP address
ipconfig

# Update VITE_WS_URL in .env
VITE_WS_URL=ws://YOUR_IP:3001
```

## 🎯 **Success Indicators**
- ✅ WebSocket server shows "Ready to handle connections"
- ✅ Admin dashboard shows "Connected" status
- ✅ Employee app shows "Live" WebSocket status
- ✅ Bus icons appear on admin map
- ✅ Real-time location updates in admin dashboard

---

**Need Help?** Check `TESTING_INSTRUCTIONS.md` for detailed testing scenarios.
