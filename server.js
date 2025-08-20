import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// In-memory state for latest locations and SSE clients
const latestByBusId = new Map(); // busId -> { lat, lng, accuracy?, speed?, heading?, timestamp, employeeId }
const sseClients = new Set(); // Set<res>

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Employee: get my bus by email
app.get('/api/employee/my-bus', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'email query param is required' });
    }

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase is not configured' });
    }

    // Find user by email
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, role, assigned_bus_id')
      .eq('email', email)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.assigned_bus_id) {
      return res.status(404).json({ message: 'No bus assigned to this user' });
    }

    // Get bus
    const { data: bus, error: busErr } = await supabase
      .from('buses')
      .select('id, bus_number, total_seats, available_seats, status, current_location, route_id')
      .eq('id', user.assigned_bus_id)
      .single();

    if (busErr || !bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Load route
    const { data: route, error: routeErr } = await supabase
      .from('routes')
      .select('id, name, start_terminal_id, end_terminal_id')
      .eq('id', bus.route_id)
      .single();

    if (routeErr || !route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Fetch terminal names
    let startName = null;
    let endName = null;
    if (route.start_terminal_id || route.end_terminal_id) {
      const ids = [route.start_terminal_id, route.end_terminal_id].filter(Boolean);
      const { data: terminals } = await supabase
        .from('terminals')
        .select('id, name')
        .in('id', ids);
      if (terminals && terminals.length) {
        const map = new Map(terminals.map(t => [t.id, t.name]));
        startName = map.get(route.start_terminal_id) || null;
        endName = map.get(route.end_terminal_id) || null;
      }
    }

    // If DB location is null, use latest from in-memory stream
    const latest = latestByBusId.get(bus.id);
    const current_location = bus.current_location || (latest ? { lat: latest.lat, lng: latest.lng } : null);

    const response = {
      role: user.role,
      bus: {
        id: bus.id,
        route: {
          id: route.id,
          name: route.name,
          start_terminal_id: route.start_terminal_id,
          end_terminal_id: route.end_terminal_id,
          start_terminal_name: startName,
          end_terminal_name: endName
        },
        status: bus.status,
        bus_number: bus.bus_number,
        total_seats: bus.total_seats,
        available_seats: bus.available_seats,
        current_location,
      }
    };

    return res.json(response);
  } catch (e) {
    console.error('my-bus error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update location from employee devices
app.put('/api/employee/location', async (req, res) => {
  try {
    const { lat, lng, employeeId, busId, accuracy, speed, heading } = req.body || {};
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat and lng are required numbers' });
    }

    const payload = {
      lat,
      lng,
      accuracy: typeof accuracy === 'number' ? accuracy : null,
      speed: typeof speed === 'number' ? speed : null,
      heading: typeof heading === 'number' ? heading : null,
      employeeId: employeeId || null,
      busId: busId || null,
      timestamp: new Date().toISOString(),
    };   

    if (busId) {
      latestByBusId.set(busId, payload);
    }

    // Broadcast to admin subscribers via SSE
    const sseData = `data: ${JSON.stringify({ type: 'location_update', data: payload })}\n\n`;
    for (const client of sseClients) {
      client.write(sseData);
    }

    // Optional: persist to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('bus_locations').insert({
          bus_id: payload.busId,
          employee_id: payload.employeeId,
          lat: payload.lat,
          lng: payload.lng,
          accuracy: payload.accuracy,
          speed: payload.speed,
          heading: payload.heading,
          recorded_at: payload.timestamp,
        });
      } catch (e) {
        // Log and continue; do not fail the request
        console.warn('Supabase insert failed:', e?.message || e);
      }
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Location update failed:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin: get latest location by bus
app.get('/api/admin/bus/:busId/location', (req, res) => {
  const { busId } = req.params;
  const data = latestByBusId.get(busId) || null;
  res.json({ busId, latest: data });
});

// Admin: subscribe to live updates via SSE
app.get('/api/admin/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial comment to keep connection open
  res.write(': connected\n\n');

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Admin: list all latest bus locations
app.get('/api/admin/locations', (_req, res) => {
  const all = Array.from(latestByBusId.entries()).map(([busId, latest]) => ({ busId, latest }));
  res.json(all);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


