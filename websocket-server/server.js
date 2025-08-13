const WebSocket = require('ws');
const http = require('http');
const axios = require('axios');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();
const employeeClients = new Map(); // Store employee-specific data

// API configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

console.log('🚌 Enhanced Bus Tracking Server Starting...');
console.log(`🌐 API Base URL: ${API_BASE_URL}`);

// Helper function to fetch employee bus data
async function getEmployeeBusData(email) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/employee/my-bus?email=${email}`);
    console.log('📡 API Response for employee bus data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching employee bus data:', error.message);
    return null;
  }
}

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection established');
  
  // Generate unique client ID
  const clientId = Math.random().toString(36).substr(2, 9);
  clients.set(clientId, ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    data: { 
      message: 'Connected to Enhanced Bus Tracking Server', 
      clientId: clientId,
      features: ['real_time_location', 'bus_data_integration', 'location_broadcasting']
    }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received message:', data);
      
      handleMessage(ws, clientId, data);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected:', clientId);
    
    // Remove from employee clients if exists
    for (const [email, clientData] of employeeClients.entries()) {
      if (clientData.ws === ws) {
        console.log(`👷 Employee ${email} disconnected`);
        employeeClients.delete(email);
        break;
      }
    }
    
    clients.delete(clientId);
    
    // Notify other clients about disconnection
    broadcastToOthers(ws, {
      type: 'client_disconnected',
      data: { clientId, timestamp: new Date().toISOString() }
    });
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

async function handleMessage(ws, clientId, message) {
  switch (message.type) {
    case 'employee_connected':
      console.log('\n👷 ===== EMPLOYEE CONNECTION =====');
      console.log('🆔 Client ID:', clientId);
      console.log('📧 Employee Email:', message.data.email);
      console.log('⏰ Connection Time:', new Date().toISOString());
      
      try {
        // Fetch employee bus data from API
        const busData = await getEmployeeBusData(message.data.email);
        
        if (busData && busData.bus) {
          // Store employee client data
          employeeClients.set(message.data.email, {
            ws: ws,
            clientId: clientId,
            busData: busData,
            lastLocation: null,
            connectedAt: new Date().toISOString()
          });
          
          console.log('✅ Employee bus data stored successfully');
          console.log('🚌 Bus Details:', {
            busNumber: busData.bus.bus_number,
            route: busData.bus.route?.name,
            totalSeats: busData.bus.total_seats,
            availableSeats: busData.bus.available_seats,
            status: busData.bus.status
          });
          
          // Send confirmation with bus data
          ws.send(JSON.stringify({
            type: 'employee_connected_confirmed',
            data: {
              message: 'Employee connected successfully',
              busData: busData,
              timestamp: new Date().toISOString()
            }
          }));
          
          // Broadcast to other clients
          broadcastToOthers(ws, {
            type: 'employee_connected',
            data: {
              clientId: clientId,
              email: message.data.email,
              busData: busData,
              timestamp: new Date().toISOString()
            }
          });
          
          console.log('👷 ===== EMPLOYEE CONNECTION COMPLETE =====\n');
        } else {
          console.error('❌ No bus data found for employee');
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'No bus data found for this employee' }
          }));
        }
      } catch (error) {
        console.error('❌ Error processing employee connection:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Failed to process employee connection' }
        }));
      }
      break;
      
    case 'location_update':
      console.log('\n📍 ===== LOCATION UPDATE RECEIVED =====');
      console.log('🆔 Client ID:', clientId);
      console.log('🌍 Coordinates:', message.data.location);
      console.log('⏰ Timestamp:', message.data.timestamp);
      console.log('📊 Raw Message Data:', JSON.stringify(message.data, null, 2));
      
      // Find employee data for this client
      let employeeEmail = null;
      let employeeData = null;
      
      for (const [email, data] of employeeClients.entries()) {
        if (data.ws === ws) {
          employeeEmail = email;
          employeeData = data;
          break;
        }
      }
      
      if (employeeData) {
        // Update last location
        employeeData.lastLocation = message.data.location;
        employeeData.lastLocationTime = new Date().toISOString();
        
        console.log('👷 Employee Email:', employeeEmail);
        console.log('🚌 Bus Number:', employeeData.busData.bus.bus_number);
        console.log('📍 Last Location Updated');
        
        // Create enhanced location message with bus data
        const enhancedLocationMessage = {
          type: 'enhanced_location_update',
          data: {
            clientId: clientId,
            employeeEmail: employeeEmail,
            location: message.data.location,
            timestamp: message.data.timestamp,
            busData: {
              busNumber: employeeData.busData.bus.bus_number,
              route: employeeData.busData.bus.route?.name,
              totalSeats: employeeData.busData.bus.total_seats,
              availableSeats: employeeData.busData.bus.available_seats,
              status: employeeData.busData.bus.status,
              passengers: (employeeData.busData.bus.total_seats || 0) - (employeeData.busData.bus.available_seats || 0)
            },
            accuracy: message.data.accuracy || null,
            speed: message.data.speed || null,
            heading: message.data.heading || null
          }
        };
        
        console.log('📤 Enhanced Location Message:', JSON.stringify(enhancedLocationMessage, null, 2));
        
        // Send confirmation to employee
        ws.send(JSON.stringify({
          type: 'location_confirmed',
          data: {
            message: 'Location update sent successfully',
            location: message.data.location,
            timestamp: new Date().toISOString(),
            busData: enhancedLocationMessage.data.busData
          }
        }));
        
        // Broadcast enhanced location to all other clients
        broadcastToOthers(ws, enhancedLocationMessage);
        
        console.log('✅ Enhanced location broadcasted to all clients');
        console.log('📍 ===== LOCATION UPDATE COMPLETE =====\n');
      } else {
        console.log('⚠️ No employee data found for this client');
        
        // Send basic confirmation
        ws.send(JSON.stringify({
          type: 'location_confirmed',
          data: {
            message: 'Location received (no employee data)',
            location: message.data.location,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Broadcast basic location
        broadcastToOthers(ws, {
          type: 'location_broadcast',
          data: {
            clientId: clientId,
            location: message.data.location,
            timestamp: message.data.timestamp
          }
        });
      }
      break;
      
    case 'get_location':
      console.log('📍 Location request from client:', clientId);
      
      // Send current location request
      ws.send(JSON.stringify({
        type: 'location_request',
        data: { 
          message: 'Please provide your current location',
          timestamp: new Date().toISOString()
        }
      }));
      break;
      
    case 'ping':
      console.log('🏓 Ping from client:', clientId);
      ws.send(JSON.stringify({
        type: 'pong',
        data: { 
          message: 'Server is alive',
          timestamp: new Date().toISOString(),
          clientId: clientId,
          serverStatus: {
            totalClients: clients.size,
            employeeClients: employeeClients.size,
            uptime: Math.floor(process.uptime())
          }
        }
      }));
      break;
      
    case 'get_server_status':
      console.log('📊 Server status request from client:', clientId);
      ws.send(JSON.stringify({
        type: 'server_status',
        data: {
          timestamp: new Date().toISOString(),
          totalClients: clients.size,
          employeeClients: employeeClients.size,
          uptime: Math.floor(process.uptime()),
          connectedEmployees: Array.from(employeeClients.keys())
        }
      }));
      break;
      
    default:
      console.log('❓ Unknown message type:', message.type);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Unknown message type' }
      }));
  }
}

function broadcastToOthers(senderWs, message) {
  let sentCount = 0;
  let failedCount = 0;
  
  console.log(`📤 Broadcasting message type '${message.type}' to ${clients.size - 1} other clients...`);
  
  clients.forEach((client, clientId) => {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
        sentCount++;
        console.log(`✅ Sent to client ${clientId}`);
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed to send to client ${clientId}:`, error.message);
      }
    }
  });
  
  console.log(`📊 Broadcast Summary: ✅ ${sentCount} sent, ❌ ${failedCount} failed`);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('\n🚀 ===== ENHANCED BUS TRACKING SERVER STARTED =====');
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📡 WebSocket Endpoint: ws://localhost:${PORT}`);
  console.log(`🔗 API Integration: ${API_BASE_URL}`);
  console.log('👥 Ready to handle enhanced bus tracking!');
  console.log('📊 Features: Real-time location + Bus data integration');
  console.log('🚀 ===== SERVER READY =====\n');
});

// Periodic status logging
setInterval(() => {
  console.log('\n📊 ===== SERVER STATUS UPDATE =====');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔌 Total Clients: ${clients.size}`);
  console.log(`👷 Employee Clients: ${employeeClients.size}`);
  console.log(`📈 Uptime: ${Math.floor(process.uptime())} seconds`);
  
  if (employeeClients.size > 0) {
    console.log('👥 Connected Employees:');
    employeeClients.forEach((data, email) => {
      console.log(`   📧 ${email} - Bus: ${data.busData.bus.bus_number}`);
      if (data.lastLocation) {
        console.log(`      📍 Last Location: ${data.lastLocation.lat}, ${data.lastLocation.lng}`);
        console.log(`      ⏰ Updated: ${data.lastLocationTime}`);
      }
    });
  }
  
  console.log('📊 ===== STATUS UPDATE COMPLETE =====\n');
}, 30000); // Log every 30 seconds

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Enhanced Bus Tracking Server...');
  wss.close(() => {
    server.close(() => {
      console.log('✅ Server closed gracefully');
      process.exit(0);
    });
  });
});
