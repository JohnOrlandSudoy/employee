# 🚀 Employee Frontend Deployment Guide

## ✅ **Updates Made**

Your employee frontend has been updated to connect to **two separate servers**:

### **Main Backend Server** (Authentication, Bus Data, Reports)
- **Server URL**: `https://backendbus-sumt.onrender.com`
- **Endpoints**: `/api/auth/employee-login`, `/api/employee/my-bus`, `/api/employee/report`

### **Bus Tracking Server** (Real-time Location Updates)
- **Server URL**: `https://employee-server-89en.onrender.com`
- **Endpoints**: `/api/employee/location`, `/health`
- **Real-time location updates** enabled

## 🔧 **Environment Configuration**

### **Local Development**
Create a `.env.local` file in your project root:
```env
# Main Backend Server
VITE_BACKEND_URL=https://backendbus-sumt.onrender.com

# Bus Tracking Server
VITE_TRACKING_URL=https://employee-server-89en.onrender.com
```

### **Production (Vercel)**
Set environment variables in your Vercel dashboard:
- `VITE_BACKEND_URL` = `https://backendbus-sumt.onrender.com`
- `VITE_TRACKING_URL` = `https://employee-server-89en.onrender.com`

## 🚀 **Deploy to Vercel**

### **Step 1: Build Locally (Optional)**
```bash
npm run build
```

### **Step 2: Deploy to Vercel**
```bash
# If you haven't installed Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **Step 3: Set Environment Variables**
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `VITE_API_BASE_URL` = `https://employee-server-89en.onrender.com`

## 📱 **Test the Integration**

### **1. Location Updates**
- Open your employee app
- Allow GPS permissions
- Check console for location updates
- Verify data is sent to your server

### **2. API Endpoints**
Test these endpoints:
- `GET /api/employee/my-bus?email=your-email`
- `PUT /api/employee/location`
- `GET /health`

### **3. Real-Time Features**
- Location tracking should work in real-time
- Admin dashboard should receive updates
- Check server logs for connections

## 🔍 **Troubleshooting**

### **CORS Issues**
If you see CORS errors, verify your server's CORS configuration includes:
```
https://employee-alpha-lovat.vercel.app
```

### **API Connection Issues**
- Check main backend health: `https://backendbus-sumt.onrender.com/health` (if available)
- Check tracking server health: `https://employee-server-89en.onrender.com/health`
- Verify environment variables are set
- Check browser console for errors

### **Location Tracking Issues**
- Ensure GPS permissions are granted
- Check browser console for geolocation errors
- Verify employee and bus IDs are being sent

## 📊 **Monitor Your Deployment**

### **Server Health**
- **Main Backend**: Monitor `https://backendbus-sumt.onrender.com` status
- **Tracking Server**: Health check `https://employee-server-89en.onrender.com/health`
- Monitor Render dashboards for both servers

### **Frontend Performance**
- Check Vercel analytics
- Monitor real-time location updates
- Verify API response times

## 🎯 **Next Steps**

1. **Deploy the updated frontend** to Vercel
2. **Test real-time location tracking**
3. **Verify admin dashboard receives updates**
4. **Monitor server performance**
5. **Set up alerts for any issues**

---

**Your employee frontend is now ready to connect to your deployed bus tracking server!** 🚌✨
